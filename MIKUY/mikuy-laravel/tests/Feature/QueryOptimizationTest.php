<?php

namespace Tests\Feature;

use App\Models\Donation;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\DB;
use Tests\TestCase;

class QueryOptimizationTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();
        $this->seed();
    }

    public function test_optimizacion_eloquent_elimina_problema_n_mas_1(): void
    {
        // ANTES: N+1 queries
        DB::flushQueryLog();
        DB::enableQueryLog();
        $raw = Donation::where('status', 'available')->get();
        foreach ($raw as $lot) {
            $_ = $lot->owner->name;
            $__ = $lot->requests()->count();
        }
        $before = count(DB::getQueryLog());

        // DESPUÉS: Eloquent con select + with + withCount + paginate
        DB::flushQueryLog();
        $opt = Donation::select('id', 'owner_id', 'name', 'category', 'qty', 'unit', 'expiry', 'district', 'status')
            ->with(['owner:id,name,district'])
            ->withCount('requests')
            ->where('status', 'available')
            ->orderBy('expiry')
            ->paginate(12);
        $after = count(DB::getQueryLog());
        DB::disableQueryLog();

        $this->assertGreaterThan(15, $before);
        $this->assertLessThanOrEqual(4, $after);
        $this->assertLessThanOrEqual(12, $opt->count());
    }
}
