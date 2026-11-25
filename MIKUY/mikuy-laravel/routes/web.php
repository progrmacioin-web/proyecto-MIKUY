<?php

use App\Http\Controllers\AssistantController;
use App\Http\Controllers\AuthController;
use App\Http\Controllers\DashboardController;
use App\Http\Controllers\DonationController;
use App\Http\Controllers\MessageController;
use App\Http\Controllers\RequestController;
use App\Http\Controllers\WebAppController;
use Illuminate\Support\Facades\Route;

// Vista principal (React compilado o panel de estado Laravel)
Route::get('/', [WebAppController::class, 'index'])->name('mikuy.home');

// Ruta protegida por CSRF para evidenciar bloqueo HTTP 419 (Sección 7.8.3)
Route::post('/csrf-check', fn () => response()->json(['ok' => true]));

// API REST de MIKUY (Laravel + Eloquent ORM)
Route::prefix('api')->group(function () {
    Route::get('/health', fn () => response()->json([
        'ok' => true,
        'service' => 'MIKUY API REST (Laravel + Eloquent)',
        'stack' => 'PHP + Laravel + Eloquent ORM + MySQL + React + Gemini AI',
        'ai_enabled' => trim((string) env('GEMINI_API_KEY', '')) !== '',
    ]));

    // Endpoints públicos
    Route::get('/summary', [DashboardController::class, 'publicSummary']);
    Route::get('/donations', [DonationController::class, 'index']);
    Route::get('/donations/{donation}', [DonationController::class, 'show']);
    Route::get('/verify/{code}', [RequestController::class, 'verifyCertificate']);
    Route::post('/assistant', [AssistantController::class, 'chat']);

    // Autenticación
    Route::post('/auth/login', [AuthController::class, 'login']);
    Route::post('/auth/register', [AuthController::class, 'register']);

    // Rutas autenticadas (JWT + Eloquent)
    Route::middleware('jwt.auth')->group(function () {
        Route::get('/auth/me', [AuthController::class, 'me']);
        Route::put('/auth/profile', [AuthController::class, 'updateProfile']);

        // Mensajería interna
        Route::get('/messages/{requestId}', [MessageController::class, 'index']);
        Route::post('/messages/{requestId}', [MessageController::class, 'store']);

        // Donante y Admin
        Route::middleware('role:donor,admin')->group(function () {
            Route::post('/donations', [DonationController::class, 'store']);
            Route::put('/donations/{donation}', [DonationController::class, 'update']);
            Route::delete('/donations/{donation}', [DonationController::class, 'destroy']);
            Route::post('/requests/{donationRequest}/accept', [RequestController::class, 'accept']);
            Route::post('/requests/{donationRequest}/reject', [RequestController::class, 'reject']);
            Route::get('/dashboards/donor', [DashboardController::class, 'donor']);
        });

        // Organización beneficiaria
        Route::get('/requests', [RequestController::class, 'index']);
        Route::post('/requests', [RequestController::class, 'store'])->middleware('role:organization');
        Route::post('/deliveries/{delivery}/confirm', [RequestController::class, 'confirmDelivery'])
            ->middleware('role:organization,donor,admin');
        Route::get('/needs', [RequestController::class, 'listNeeds'])->middleware('role:organization');
        Route::post('/needs', [RequestController::class, 'createNeed'])->middleware('role:organization');
        Route::get('/dashboards/organization', [DashboardController::class, 'organization'])
            ->middleware('role:organization,admin');

        // Administrador (RBAC estricto + Laboratorio de Optimización Eloquent)
        Route::middleware('role:admin')->prefix('admin')->group(function () {
            Route::get('/dashboard', [DashboardController::class, 'admin']);
            Route::patch('/users/{user}/toggle', [DashboardController::class, 'toggleUserActive']);
            Route::get('/optimization-benchmark', [DashboardController::class, 'optimizationBenchmark']);
        });
    });
});
