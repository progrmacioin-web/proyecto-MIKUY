<?php

namespace App\Http\Controllers;

use App\Models\Delivery;
use App\Models\Donation;
use App\Models\User;
use App\Services\SecurityHelper;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Http;

class AssistantController extends Controller
{
    public function chat(Request $request): JsonResponse
    {
        $rawMessage = SecurityHelper::cleanText($request->input('message', ''), 500);
        $role = (string) $request->input('context.role', 'visitor');
        $history = is_array($request->input('history')) ? $request->input('history') : [];

        if ($rawMessage === '') {
            return response()->json(['error' => 'Escribe una consulta para Ukumari.'], 400);
        }

        // Datos reales en vivo desde MySQL usando Eloquent
        $lots = Donation::select('id', 'name', 'category', 'qty', 'unit', 'district', 'expiry', 'place', 'storage_type')
            ->where('status', 'available')
            ->orderBy('expiry')
            ->limit(12)
            ->get();
        $totalCount = Donation::where('status', 'available')->count();
        $totalKg = (float) Donation::where('status', 'available')->sum('qty');
        $orgCount = User::where('role', 'organization')->where('active', true)->count();

        $ticketInfo = null;
        if (preg_match('/MK-CUS-\d{4}-[A-Z0-9]+/', strtoupper($rawMessage), $m)) {
            $del = Delivery::with(['donation:id,name,district', 'organization:id,name,district'])
                ->where('certificate_code', $m[0])
                ->first();
            $ticketInfo = $del
                ? [
                    'code' => $del->certificate_code,
                    'status' => $del->status,
                    'qty' => $del->qty,
                    'unit' => $del->unit,
                    'food' => $del->donation?->name,
                    'organization' => $del->organization?->name,
                    'district' => $del->organization?->district,
                ]
                : ['code' => $m[0], 'notFound' => true];
        }

        $q = mb_strtolower($rawMessage);
        $actions = $this->suggestActions($q, $role);

        // 1. Intentar responder con Gemini AI (si GEMINI_API_KEY está configurada en .env)
        $apiKey = trim((string) env('GEMINI_API_KEY', ''));
        if ($apiKey !== '' && !app()->runningUnitTests()) {
            try {
                $model = trim((string) env('GEMINI_MODEL', 'gemini-2.5-flash'));
                $lotsSummary = $lots->map(fn ($l) => "- {$l->name} ({$l->category}): {$l->qty} {$l->unit} en {$l->district}, vence {$l->expiry}")->implode("\n");
                $ticketLine = $ticketInfo
                    ? (!empty($ticketInfo['notFound'])
                        ? "Ticket {$ticketInfo['code']} NO existe en MySQL."
                        : "Ticket {$ticketInfo['code']}: estado={$ticketInfo['status']}, alimento={$ticketInfo['food']}, cantidad={$ticketInfo['qty']} {$ticketInfo['unit']}, organización={$ticketInfo['organization']}.")
                    : 'Ningún ticket consultado.';

                $system = "Eres Ukumari, el asistente virtual oficial de MIKUY (Red Solidaria de Alimentos en Cusco, Perú), construida en Laravel + Eloquent + React.\n"
                    . "REGLAS ESTRICTAS:\n"
                    . "1. Responde SOLO sobre la plataforma MIKUY (donaciones en Cusco, catálogo, subir fotos y editar productos/perfiles, mensajería interna, tickets QR/PIN y validación de recojo, seguridad alimentaria y ODS 2 y 12).\n"
                    . "2. Si te preguntan algo fuera de MIKUY, responde cortésmente que solo atiendes consultas sobre la plataforma MIKUY.\n"
                    . "3. Responde siempre en español claro y directo (máx. 5 líneas), usando únicamente estos datos reales de MySQL:\n"
                    . "- Rol actual: {$role}\n- Lotes disponibles: {$totalCount} ({$totalKg} kg), Organizaciones: {$orgCount}\n"
                    . "- Lotes:\n{$lotsSummary}\n- Ticket consultado: {$ticketLine}";

                $contents = [];
                foreach (array_slice($history, -6) as $h) {
                    if (!empty($h['text'])) {
                        $contents[] = [
                            'role' => ($h['sender'] ?? '') === 'user' ? 'user' : 'model',
                            'parts' => [['text' => mb_substr((string) $h['text'], 0, 400)]],
                        ];
                    }
                }
                $contents[] = ['role' => 'user', 'parts' => [['text' => $rawMessage]]];

                $resp = Http::timeout(9)->post(
                    "https://generativelanguage.googleapis.com/v1beta/models/{$model}:generateContent?key={$apiKey}",
                    [
                        'systemInstruction' => ['parts' => [['text' => $system]]],
                        'contents' => $contents,
                        'generationConfig' => ['temperature' => 0.35, 'maxOutputTokens' => 320],
                    ]
                );

                $aiText = trim((string) $resp->json('candidates.0.content.parts.0.text', ''));
                if ($aiText !== '') {
                    return response()->json([
                        'reply' => $aiText,
                        'mood' => $ticketInfo ? 'celebrate' : 'talking',
                        'poweredBy' => 'Gemini AI · Laravel',
                        'actions' => $actions,
                    ]);
                }
            } catch (\Throwable $e) {
                // Fallback automático
            }
        }

        // 2. Motor local de respaldo con datos en vivo de Eloquent
        $fallback = $this->localReply($q, $lots, $totalCount, $totalKg, $ticketInfo);
        return response()->json([
            'reply' => $fallback['reply'],
            'mood' => $fallback['mood'],
            'poweredBy' => 'MIKUY Laravel Local',
            'actions' => $actions,
        ]);
    }

    private function suggestActions(string $q, string $role): array
    {
        $actions = [];
        if (preg_match('/qr|ticket|tiket|codigo|constancia|verificar|validar/', $q)) {
            $actions[] = ['label' => 'Validar Ticket QR', 'page' => 'verify'];
        }
        if (preg_match('/mapa|distrito|wanchaq|santiago|cusco|sebastian|jeronimo|poroy/', $q)) {
            $actions[] = ['label' => 'Mapa Cusco', 'page' => 'map'];
        }
        if (preg_match('/alimento|catalogo|lote|disponible|solicitar|adquirir|papa|arroz/', $q)) {
            $actions[] = ['label' => 'Explorar Catálogo', 'page' => 'catalog'];
        }
        if (preg_match('/donar|publicar|editar|perfil|foto|imagen|chat|mensaje/', $q)) {
            $actions[] = ['label' => $role !== 'visitor' ? 'Ir a Mi Panel' : 'Ingresar', 'page' => $role !== 'visitor' ? 'dashboard' : 'login'];
        }
        return array_slice($actions ?: [['label' => 'Explorar Catálogo', 'page' => 'catalog']], 0, 2);
    }

    private function localReply(string $q, $lots, int $totalCount, float $totalKg, ?array $ticketInfo): array
    {
        if ($ticketInfo) {
            if (!empty($ticketInfo['notFound'])) {
                return ['reply' => "No encontré el ticket {$ticketInfo['code']} en MySQL. Prueba con MK-CUS-2026-0002.", 'mood' => 'confused'];
            }
            $estado = $ticketInfo['status'] === 'scheduled' ? 'SÍ está autorizada para recoger.' : 'Esta entrega ya fue confirmada.';
            return ['reply' => "Ticket {$ticketInfo['code']}: {$ticketInfo['organization']} ({$ticketInfo['qty']} {$ticketInfo['unit']} de {$ticketInfo['food']}). {$estado}", 'mood' => 'celebrate'];
        }

        foreach (['Cusco', 'Santiago', 'Wanchaq', 'San Sebastián', 'San Jerónimo', 'Poroy', 'Saylla'] as $d) {
            if (str_contains($q, mb_strtolower($d))) {
                $filtered = $lots->filter(fn ($l) => mb_strtolower($l->district) === mb_strtolower($d));
                if ($filtered->isNotEmpty()) {
                    $lines = $filtered->take(4)->map(fn ($l) => "• {$l->name}: {$l->qty} {$l->unit} (vence {$l->expiry})")->implode("\n");
                    return ['reply' => "Lotes disponibles en {$d}:\n{$lines}", 'mood' => 'pointing'];
                }
                return ['reply' => "Ahora no hay lotes en {$d}, pero existen {$totalCount} lotes disponibles en otros distritos.", 'mood' => 'confused'];
            }
        }

        if (preg_match('/foto|imagen|subir|editar|perfil/', $q)) {
            return ['reply' => 'Puedes editar tus datos y subir tu foto de perfil en "Mi Panel → 👤 Mi Perfil". Como Donante también puedes subir foto real al publicar o editar cualquier alimento.', 'mood' => 'talking'];
        }
        if (preg_match('/mensaje|chat|comunicar|hablar/', $q)) {
            return ['reply' => 'MIKUY cuenta con mensajería interna: entra a "Mi Panel" y haz clic en "💬 Chat" en cualquier solicitud o ticket para coordinar el recojo.', 'mood' => 'talking'];
        }
        if (preg_match('/ticket|tiket|qr|codigo|autorizado|recoge/', $q)) {
            return ['reply' => 'Al adquirir un lote se genera automáticamente un Ticket QR + PIN para la organización y el donante. El donante entra a "📷 Validar Ticket QR" para leer el código y confirmar la autorización de entrega.', 'mood' => 'celebrate'];
        }
        if (preg_match('/disponible|catalogo|que hay|kilos|stock|lote|papa|arroz|zanahoria/', $q)) {
            $lines = $lots->take(4)->map(fn ($l) => "• {$l->name} ({$l->qty} {$l->unit}) en {$l->district}")->implode("\n");
            return ['reply' => "Hay {$totalCount} lotes disponibles en Cusco ({$totalKg} kg):\n{$lines}", 'mood' => 'pointing'];
        }

        return [
            'reply' => '¡Hola! Soy Ukumari, el asistente de MIKUY. Solo respondo preguntas sobre la plataforma: lotes disponibles en Cusco, subir fotos y editar productos/perfiles, mensajería interna y validación de Tickets QR. ¿Qué necesitas hacer?',
            'mood' => 'hello',
        ];
    }
}
