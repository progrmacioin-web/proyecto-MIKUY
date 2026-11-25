<?php

namespace App\Http\Controllers;

use App\Models\Delivery;
use App\Models\Donation;
use App\Models\DonationRequest;
use App\Models\OrganizationNeed;
use App\Models\User;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Http;

class DashboardController extends Controller
{
    public function publicSummary(): JsonResponse
    {
        $clima = [
            'fuente' => 'Referencia local Cusco',
            'temperatura_c' => 15.5,
            'humedad_pct' => 56,
            'recomendacion' => 'Clima fresco en Cusco: almacenar tubérculos y menestras en ambiente seco y ventilado.',
        ];

        if (!app()->runningUnitTests()) {
            try {
                $resp = Http::timeout(3)->get(
                    'https://api.open-meteo.com/v1/forecast?latitude=-13.5319&longitude=-71.9675&current=temperature_2m,relative_humidity_2m'
                );
                if ($resp->ok()) {
                    $temp = $resp->json('current.temperature_2m');
                    $hum = $resp->json('current.relative_humidity_2m');
                    $clima = [
                        'fuente' => 'Open-Meteo API (vía Laravel HTTP)',
                        'temperatura_c' => $temp,
                        'humedad_pct' => $hum,
                        'recomendacion' => $temp >= 18
                            ? 'Temperatura cálida en Cusco: priorizar refrigeración para frutas y verduras.'
                            : 'Clima fresco en Cusco: almacenar tubérculos y menestras en ambiente seco y ventilado.',
                    ];
                }
            } catch (\Throwable $e) {
                // Mantiene respaldo local
            }
        }

        return response()->json([
            'donations_available' => Donation::where('status', 'available')->count(),
            'organizations_active' => User::where('role', 'organization')->where('active', true)->count(),
            'confirmed_deliveries' => Delivery::where('status', 'confirmed')->count(),
            'available_kg' => (float) Donation::where('status', 'available')->sum('qty'),
            'clima_cusco' => $clima,
        ]);
    }

    public function donor(Request $request): JsonResponse
    {
        $uid = $request->user()->id;

        $donations = Donation::select(
            'id', 'owner_id', 'name', 'description', 'category', 'qty', 'unit', 'expiry',
            'district', 'place', 'care', 'storage_type', 'status', 'image', 'photo_data', 'lot', 'trace_code'
        )->where('owner_id', $uid)->orderBy('expiry')->get();

        $ids = $donations->pluck('id');
        $requests = $ids->isNotEmpty()
            ? DonationRequest::whereIn('donation_id', $ids)
                ->with([
                    'donation:id,name,unit,district,lot',
                    'organization:id,name,district,phone',
                    'delivery',
                ])->latest()->get()
            : collect();

        $confirmedCount = $requests->filter(fn ($r) => $r->delivery && $r->delivery->status === 'confirmed')->count();
        $pendingCount = $requests->filter(fn ($r) => $r->status === 'pending' || ($r->delivery && $r->delivery->status === 'scheduled'))->count();

        return response()->json([
            'kpis' => [
                'total_lots' => $donations->count(),
                'available_lots' => $donations->where('status', 'available')->count(),
                'pending_requests' => $pendingCount,
                'confirmed_deliveries' => $confirmedCount,
            ],
            'donations' => $donations,
            'requests' => $requests,
        ]);
    }

    public function organization(Request $request): JsonResponse
    {
        $user = $request->user();
        $uid = $user->id;

        $requests = DonationRequest::where('organization_id', $uid)
            ->with([
                'donation:id,owner_id,name,unit,district,place',
                'donation.owner:id,name,phone',
                'delivery',
            ])->latest()->get();

        $deliveries = Delivery::where('organization_id', $uid)
            ->with(['donation:id,name,category,district,lot', 'organization:id,name,district'])
            ->latest()->get();

        $needs = OrganizationNeed::where('organization_id', $uid)->latest()->get();
        $availableLots = Donation::select('id', 'name', 'category', 'qty', 'unit', 'expiry', 'district', 'storage_type', 'image', 'photo_data')
            ->where('status', 'available')->limit(30)->get();

        $recommendations = $availableLots->map(function ($lot) use ($needs, $user) {
            $best = 0;
            foreach ($needs as $n) {
                if ($n->storage !== 'any' && $lot->storage_type !== 'not_declared' && $lot->storage_type !== $n->storage) {
                    continue;
                }
                $score = 0;
                if (stripos($lot->name, $n->product) !== false) $score += 40;
                if ($lot->category === $n->category) $score += 25;
                if ($lot->district === $user->district) $score += 15;
                if ($lot->unit === $n->unit && $lot->qty >= $n->qty) $score += 15;
                if ($n->priority === 'high') $score += 5;
                $best = max($best, min(100, $score));
            }
            $arr = $lot->toArray();
            $arr['score'] = $best;
            return $arr;
        })->filter(fn ($x) => $x['score'] >= 30)->sortByDesc('score')->take(4)->values();

        return response()->json([
            'kpis' => [
                'total_requests' => $requests->count(),
                'pending_requests' => $requests->where('status', 'pending')->count(),
                'scheduled_deliveries' => $deliveries->where('status', 'scheduled')->count(),
                'confirmed_certificates' => $deliveries->where('status', 'confirmed')->count(),
                'confirmed_kg' => round((float) $deliveries->where('status', 'confirmed')->sum('qty'), 2),
            ],
            'requests' => $requests,
            'deliveries' => $deliveries,
            'needs' => $needs,
            'recommendations' => $recommendations,
        ]);
    }

    public function admin(): JsonResponse
    {
        $users = User::select('id', 'name', 'email', 'role', 'district', 'active', 'verification', 'created_at')
            ->orderBy('id')->get();

        $byDistrict = Donation::select('district', DB::raw('COUNT(id) as lotes'), DB::raw('SUM(qty) as total_kg'))
            ->groupBy('district')->get();

        return response()->json([
            'kpis' => [
                'total_users' => $users->count(),
                'donors' => $users->where('role', 'donor')->count(),
                'organizations' => $users->where('role', 'organization')->count(),
                'total_donations' => Donation::count(),
                'pending_requests' => DonationRequest::where('status', 'pending')->count(),
                'confirmed_deliveries' => Delivery::where('status', 'confirmed')->count(),
            ],
            'by_district' => $byDistrict,
            'users' => $users,
        ]);
    }

    public function toggleUserActive(Request $request, User $user): JsonResponse
    {
        if ($user->id === $request->user()->id) {
            return response()->json(['error' => 'No puedes desactivar tu propia cuenta administrativa.'], 400);
        }
        $user->update(['active' => !$user->active]);
        return response()->json(['message' => 'Estado actualizado.', 'active' => $user->active]);
    }

    /**
     * Optimización de consultas utilizando Laravel y Eloquent (Indicador 5 + Sección 7.7)
     */
    public function optimizationBenchmark(Request $request): JsonResponse
    {
        $district = (string) $request->query('district', 'Cusco');
        $driver = DB::connection()->getDriverName();

        // 1. ANTES: N+1 Queries + SELECT * sin paginación
        DB::flushQueryLog();
        DB::enableQueryLog();
        $t0 = microtime(true);

        $rawLots = Donation::where('status', 'available')->get();
        foreach ($rawLots as $lot) {
            $_ = $lot->owner?->name;
            $__ = $lot->requests()->count();
        }
        $beforeMs = round((microtime(true) - $t0) * 1000, 2);
        $beforeQueries = count(DB::getQueryLog());

        // 2. DESPUÉS: Eloquent optimizado (select + with + withCount + índice compuesto + paginate)
        DB::flushQueryLog();
        $t1 = microtime(true);

        $optimized = Donation::select('id', 'owner_id', 'name', 'category', 'qty', 'unit', 'expiry', 'district', 'status')
            ->with(['owner:id,name,district'])
            ->withCount('requests')
            ->where('status', 'available')
            ->where('district', $district)
            ->orderBy('expiry', 'asc')
            ->paginate(12);

        $afterMs = round((microtime(true) - $t1) * 1000, 2);
        $afterQueries = count(DB::getQueryLog());
        DB::disableQueryLog();

        // 3. EXPLAIN real contra MySQL / SQLite
        $explainBefore = [];
        $explainAfter = [];
        try {
            if ($driver === 'mysql') {
                $explainBefore = DB::select(
                    "EXPLAIN SELECT * FROM donations IGNORE INDEX (idx_donations_status_district_expiry) WHERE status = 'available' AND district = ? ORDER BY expiry ASC",
                    [$district]
                );
                $explainAfter = DB::select(
                    "EXPLAIN SELECT id, owner_id, name, category, qty, unit, expiry, district, status FROM donations WHERE status = 'available' AND district = ? ORDER BY expiry ASC LIMIT 12",
                    [$district]
                );
            } else {
                $explainAfter = DB::select(
                    "EXPLAIN QUERY PLAN SELECT id, owner_id, name, category, qty, unit, expiry, district, status FROM donations WHERE status = 'available' AND district = ? ORDER BY expiry ASC LIMIT 12",
                    [$district]
                );
            }
        } catch (\Throwable $e) {}

        $reduction = $beforeQueries > 0
            ? round((($beforeQueries - $afterQueries) / $beforeQueries) * 100, 1)
            : 0;

        return response()->json([
            'driver' => strtoupper($driver),
            'district' => $district,
            'before' => ['queries' => $beforeQueries, 'time_ms' => $beforeMs, 'rows' => $rawLots->count()],
            'after' => ['queries' => $afterQueries, 'time_ms' => $afterMs, 'rows' => $optimized->count()],
            'reduction_pct' => $reduction,
            'explain_before' => $explainBefore,
            'explain_after' => $explainAfter,
        ]);
    }
}
