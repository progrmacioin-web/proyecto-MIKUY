<?php

namespace App\Http\Controllers;

use App\Models\Donation;
use App\Services\SecurityHelper;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class DonationController extends Controller
{
    /**
     * Consulta optimizada con Laravel Eloquent (Indicador 5 y Sección 7.7):
     * select() explícito + with() Eager Loading + índice compuesto + paginate()
     */
    public function index(Request $request): JsonResponse
    {
        $limit = min(50, max(1, (int) $request->query('limit', 12)));
        $status = $request->query('status');
        $district = $request->query('district');
        $category = $request->query('category');
        $search = trim((string) $request->query('q', ''));

        $query = Donation::select(
            'id', 'owner_id', 'name', 'description', 'category', 'qty', 'unit',
            'expiry', 'care', 'district', 'place', 'status', 'image', 'photo_data',
            'origin', 'lot', 'packaging', 'storage_type', 'trace_code', 'created_at'
        )->with(['owner:id,name,district,photo_data']);

        if ($status && $status !== 'all') {
            $query->where('status', $status);
        } elseif (!$request->query('includeAll')) {
            $query->where('status', 'available');
        }

        $query->when($district, fn ($q) => $q->where('district', $district))
            ->when($category, fn ($q) => $q->where('category', $category))
            ->when($search !== '', function ($q) use ($search) {
                $q->where(function ($sub) use ($search) {
                    $sub->where('name', 'like', "%{$search}%")
                        ->orWhere('description', 'like', "%{$search}%")
                        ->orWhere('district', 'like', "%{$search}%");
                });
            })
            ->orderBy('expiry', 'asc');

        $paginator = $query->paginate($limit);

        return response()->json([
            'data' => $paginator->items(),
            'pagination' => [
                'page' => $paginator->currentPage(),
                'limit' => $paginator->perPage(),
                'total' => $paginator->total(),
                'totalPages' => max(1, $paginator->lastPage()),
            ],
        ]);
    }

    public function show(Donation $donation): JsonResponse
    {
        $donation->load([
            'owner:id,name,district,photo_data',
            'requests:id,donation_id,qty,status,created_at',
        ]);
        return response()->json(['data' => $donation]);
    }

    public function store(Request $request): JsonResponse
    {
        $name = SecurityHelper::cleanText($request->input('name'), 120);
        $qty = (float) $request->input('qty', 0);
        $expiry = (string) $request->input('expiry', '');
        $district = SecurityHelper::cleanText($request->input('district'), 80);

        $validDistricts = ['Cusco', 'Santiago', 'Wanchaq', 'San Sebastián', 'San Jerónimo', 'Poroy', 'Saylla', 'Ccorca'];

        if (mb_strlen($name) < 2) {
            return response()->json(['error' => 'El nombre del alimento es obligatorio (mín. 2 caracteres).'], 400);
        }
        if ($qty <= 0 || $qty > 50000) {
            return response()->json(['error' => 'La cantidad debe ser mayor a cero.'], 400);
        }
        if ($expiry === '' || $expiry < now()->format('Y-m-d')) {
            return response()->json(['error' => 'No se pueden publicar alimentos vencidos.'], 400);
        }
        if (!in_array($district, $validDistricts, true)) {
            return response()->json(['error' => 'Distrito del Cusco no válido.'], 400);
        }

        $category = SecurityHelper::cleanText($request->input('category', 'Productos envasados'), 60);
        $imageMap = [
            'Tubérculos' => 'potato',
            'Verduras' => 'carrot',
            'Cereales' => 'rice',
            'Frutas' => 'apple',
            'Menestras' => 'beans',
            'Productos envasados' => 'packaged',
        ];

        $donation = Donation::create([
            'owner_id' => $request->user()->id,
            'name' => $name,
            'description' => SecurityHelper::cleanText($request->input('description', ''), 600),
            'category' => $category,
            'qty' => $qty,
            'unit' => SecurityHelper::cleanText($request->input('unit', 'kg'), 25),
            'expiry' => $expiry,
            'care' => SecurityHelper::cleanText($request->input('care', 'Mantener en lugar limpio y ventilado.'), 255),
            'district' => $district,
            'place' => SecurityHelper::cleanText($request->input('place', $district), 150),
            'status' => 'available',
            'image' => $imageMap[$category] ?? 'packaged',
            'photo_data' => SecurityHelper::sanitizeImageData($request->input('photo_data')),
            'origin' => SecurityHelper::cleanText($request->input('origin', 'Donante local de Cusco'), 150),
            'lot' => SecurityHelper::cleanText($request->input('lot', 'LT-' . substr((string) time(), -4)), 60),
            'packaging' => SecurityHelper::cleanText($request->input('packaging', 'Empaque limpio'), 120),
            'storage_type' => SecurityHelper::cleanText($request->input('storage_type', 'ambient'), 40),
        ]);

        return response()->json(['message' => 'Alimento publicado correctamente.', 'data' => $donation], 201);
    }

    public function update(Request $request, Donation $donation): JsonResponse
    {
        if ($request->user()->role !== 'admin' && $donation->owner_id !== $request->user()->id) {
            return response()->json(['error' => 'No tienes permiso para editar esta publicación.'], 403);
        }

        $updates = [];
        if ($request->has('name')) $updates['name'] = SecurityHelper::cleanText($request->input('name'), 120);
        if ($request->has('category')) $updates['category'] = SecurityHelper::cleanText($request->input('category'), 60);
        if ($request->has('description')) $updates['description'] = SecurityHelper::cleanText($request->input('description'), 600);
        if ($request->has('unit')) $updates['unit'] = SecurityHelper::cleanText($request->input('unit'), 25);
        if ($request->has('expiry')) $updates['expiry'] = (string) $request->input('expiry');
        if ($request->has('care')) $updates['care'] = SecurityHelper::cleanText($request->input('care'), 255);
        if ($request->has('place')) $updates['place'] = SecurityHelper::cleanText($request->input('place'), 150);
        if ($request->has('district')) $updates['district'] = SecurityHelper::cleanText($request->input('district'), 80);
        if ($request->has('storage_type')) $updates['storage_type'] = SecurityHelper::cleanText($request->input('storage_type'), 40);
        if ($request->has('status')) $updates['status'] = SecurityHelper::cleanText($request->input('status'), 30);
        if ($request->has('qty')) {
            $q = (float) $request->input('qty');
            if ($q < 0) return response()->json(['error' => 'Cantidad inválida.'], 400);
            $updates['qty'] = $q;
        }
        if ($request->has('photo_data')) {
            $raw = $request->input('photo_data');
            $updates['photo_data'] = $raw ? SecurityHelper::sanitizeImageData($raw) : null;
        }

        $donation->update($updates);
        return response()->json(['message' => 'Publicación actualizada correctamente.', 'data' => $donation->fresh()]);
    }

    public function destroy(Request $request, Donation $donation): JsonResponse
    {
        if ($request->user()->role !== 'admin' && $donation->owner_id !== $request->user()->id) {
            return response()->json(['error' => 'No tienes permiso para retirar esta publicación.'], 403);
        }
        $donation->update(['status' => 'retired']);
        return response()->json(['message' => 'Publicación retirada del catálogo.']);
    }
}
