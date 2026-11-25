<?php

use App\Http\Middleware\CheckRole;
use App\Http\Middleware\JwtAuth;
use App\Http\Middleware\SecurityHeaders;
use Illuminate\Foundation\Application;
use Illuminate\Foundation\Configuration\Exceptions;
use Illuminate\Foundation\Configuration\Middleware;

return Application::configure(basePath: dirname(__DIR__))
    ->withRouting(
        web: __DIR__.'/../routes/web.php',
        commands: __DIR__.'/../routes/console.php',
        health: '/up',
    )
    ->withMiddleware(function (Middleware $middleware) {
        // Las rutas API usan autenticación Bearer JWT (sin CSRF),
        // mientras las rutas web mantienen protección CSRF completa.
        $middleware->validateCsrfTokens(except: [
            'api/*',
        ]);
        $middleware->alias([
            'jwt.auth' => JwtAuth::class,
            'role' => CheckRole::class,
        ]);
        $middleware->append(SecurityHeaders::class);
    })
    ->withExceptions(function (Exceptions $exceptions) {
        // Manejo seguro de errores
    })->create();
