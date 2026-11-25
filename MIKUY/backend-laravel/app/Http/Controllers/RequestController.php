<?php

namespace App\Http\Controllers;

use App\Models\Delivery;
use App\Models\Donation;
use App\Models\DonationRequest;
use App\Models\OrganizationNeed;
use App\Services\SecurityHelper;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class RequestController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $user = $request->user();
        $query = DonationRequest::with([
            'donation:id,owner_id,name,unit,district,place,category',
            'donation.owner:id,name,district,phone',
            'organization:id,name,district,phone',
            'delivery',
        ])->latest();

        if ($user->role === 'organization') {
            $query->where('organization_id', $user->id);
        } elseif ($user->role === 'donor') {
            $query->whereHas('donation', fn ($q) => $q->where('owner_id', $user->id));
        }

        return response()->json(['data' => $query->get()]);
    }

    /**
     * Al adquirir un lote, descuenta stock con lockForUpdate() y emite inmediatamente
     * el Ticket de Recojo (QR + Código + PIN de 6 dígitos) para ambos roles.
     */
    public function store(Request $request): JsonResponse
    {
        $donationId = (int) $request->input('donation_id');
        $qty = (float) $request->input('qty');
        $message = SecurityHelper::cleanText($request->input('message', ''), 500);

        if ($donationId <= 0 || $qty <= 0) {
            return response()->json(['error' => 'Selecciona un alimento y una cantidad válida.'], 400);
        }

        try {
            $result = DB::transaction(function () use ($donationId, $qty, $message, $request) {
                $lot = Donation::whereKey($donationId)->lockForUpdate()->first();
                if (!$lot || $lot->status !== 'available') {
                    abort(400, 'El lote no está disponible.');
                }
                if ($qty > $lot->qty) {
                    abort(400, 'La cantidad solicitada supera el stock disponible.');
                }

                $lot->qty = round($lot->qty - $qty, 2);
                if ($lot->qty <= 0) {
                    $lot->status = 'reserved';
                }
                $lot->save();

                $newReq = DonationRequest::create([
                    'donation_id' => $lot->id,
                    'organization_id' => $request->user()->id,
                    'qty' => $qty,
                    'message' => $message,
                    'status' => 'accepted',
                    'response' => 'Reserva confirmada. Ticket de recojo autorizado generado.',
                ]);

                $delivery = Delivery::create([
                    'donation_id' => $lot->id,
                    'request_id' => $newReq->id,
                    'organization_id' => $request->user()->id,
                    'qty' => $qty,
                    'unit' => $lot->unit,
                    'status' => 'scheduled',
                    'scheduled_date' => now()->format('Y-m-d'),
                    'scheduled_time' => '10:00',
                    'pickup_place' => $lot->place ?: $lot->district,
                ]);

                $delivery->load(['donation:id,name,district,lot', 'organization:id,name,district']);

                return ['request' => $newReq, 'ticket' => $delivery];
            });

            return response()->json([
                'message' => '¡Adquisición registrada! Ticket de Recojo QR generado.',
                'data' => $result['request'],
                'ticket' => $result['ticket'],
            ], 201);
        } catch (\Symfony\Component\HttpKernel\Exception\HttpException $e) {
            return response()->json(['error' => $e->getMessage()], $e->getStatusCode());
        }
    }

    public function accept(Request $request, DonationRequest $donationRequest): JsonResponse
    {
        $donation = $donationRequest->donation;
        if ($request->user()->role !== 'admin' && $donation->owner_id !== $request->user()->id) {
            return response()->json(['error' => 'No autorizado.'], 403);
        }
        if ($donationRequest->status !== 'pending') {
            return response()->json(['error' => 'Solo se pueden aprobar solicitudes pendientes.'], 400);
        }

        $delivery = DB::transaction(function () use ($donationRequest, $request) {
            $lot = Donation::whereKey($donationRequest->donation_id)->lockForUpdate()->firstOrFail();
            if ($donationRequest->qty > $lot->qty) {
                abort(400, 'Stock insuficiente en el lote.');
            }
            $lot->qty = round($lot->qty - $donationRequest->qty, 2);
            if ($lot->qty <= 0) $lot->status = 'reserved';
            $lot->save();

            $donationRequest->update([
                'status' => 'accepted',
                'response' => SecurityHelper::cleanText($request->input('response', 'Aprobado. Ticket QR generado.'), 300),
            ]);

            return Delivery::create([
                'donation_id' => $lot->id,
                'request_id' => $donationRequest->id,
                'organization_id' => $donationRequest->organization_id,
                'qty' => $donationRequest->qty,
                'unit' => $lot->unit,
                'status' => 'scheduled',
                'scheduled_date' => now()->format('Y-m-d'),
                'scheduled_time' => '10:00',
                'pickup_place' => $lot->place ?: $lot->district,
            ]);
        });

        return response()->json(['message' => 'Solicitud aprobada y Ticket QR generado.', 'delivery' => $delivery]);
    }

    public function reject(Request $request, DonationRequest $donationRequest): JsonResponse
    {
        $donation = $donationRequest->donation;
        if ($request->user()->role !== 'admin' && $donation->owner_id !== $request->user()->id) {
            return response()->json(['error' => 'No autorizado.'], 403);
        }
        $donationRequest->update([
            'status' => 'rejected',
            'response' => SecurityHelper::cleanText($request->input('response', 'Solicitud rechazada.'), 300),
        ]);
        return response()->json(['message' => 'Solicitud rechazada.', 'data' => $donationRequest]);
    }

    public function confirmDelivery(Request $request, Delivery $delivery): JsonResponse
    {
        $user = $request->user();
        $delivery->load('donation:id,owner_id');
        $isOwner = $delivery->donation && $delivery->donation->owner_id === $user->id;
        $isOrg = $delivery->organization_id === $user->id;

        if ($user->role !== 'admin' && !$isOwner && !$isOrg) {
            return response()->json(['error' => 'No autorizado para confirmar esta entrega.'], 403);
        }

        DB::transaction(function () use ($delivery) {
            $delivery->update(['status' => 'confirmed', 'received_at' => now()]);
            DonationRequest::whereKey($delivery->request_id)->update(['status' => 'completed']);
        });

        return response()->json(['message' => 'Entrega confirmada y registrada.', 'data' => $delivery->fresh()]);
    }

    public function verifyCertificate(string $code): JsonResponse
    {
        $cleanCode = strtoupper(SecurityHelper::cleanText($code, 50));
        $delivery = Delivery::with([
            'donation:id,owner_id,name,category,district,lot,place',
            'donation.owner:id,name,district',
            'organization:id,name,organization,district,phone,verification,photo_data',
        ])->where('certificate_code', $cleanCode)->first();

        if (!$delivery) {
            return response()->json([
                'valid' => false,
                'authorized' => false,
                'error' => 'Ticket no encontrado. NO autorices la entrega sin un código válido.',
            ], 404);
        }

        $authorized = in_array($delivery->status, ['scheduled', 'confirmed'], true);
        $msg = $delivery->status === 'scheduled'
            ? "ORGANIZACIÓN AUTORIZADA PARA RECOJO: {$delivery->organization->name} puede retirar {$delivery->qty} {$delivery->unit} de {$delivery->donation->name}."
            : ($delivery->status === 'confirmed'
                ? 'ENTREGA YA CONFIRMADA el ' . optional($delivery->received_at)->format('d/m/Y') . '.'
                : 'TICKET CANCELADO: no autorizado.');

        return response()->json([
            'valid' => true,
            'authorized' => $authorized,
            'can_deliver' => $delivery->status === 'scheduled',
            'authorization_message' => $msg,
            'data' => $delivery,
        ]);
    }

    public function listNeeds(Request $request): JsonResponse
    {
        return response()->json([
            'data' => OrganizationNeed::where('organization_id', $request->user()->id)->latest()->get(),
        ]);
    }

    public function createNeed(Request $request): JsonResponse
    {
        $product = SecurityHelper::cleanText($request->input('product'), 120);
        $category = SecurityHelper::cleanText($request->input('category'), 60);
        $qty = (float) $request->input('qty', 0);

        if ($product === '' || $category === '' || $qty <= 0) {
            return response()->json(['error' => 'Completa producto, categoría y cantidad positiva.'], 400);
        }

        $priority = in_array($request->input('priority'), ['high', 'normal', 'low'], true)
            ? $request->input('priority')
            : 'normal';

        $need = OrganizationNeed::create([
            'organization_id' => $request->user()->id,
            'product' => $product,
            'category' => $category,
            'qty' => $qty,
            'unit' => SecurityHelper::cleanText($request->input('unit', 'kg'), 25),
            'priority' => $priority,
            'storage' => SecurityHelper::cleanText($request->input('storage', 'any'), 30),
        ]);

        return response()->json(['message' => 'Necesidad registrada.', 'data' => $need], 201);
    }
}
