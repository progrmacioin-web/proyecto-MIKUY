<?php

namespace App\Http\Middleware;

use App\Models\User;
use App\Services\JwtService;
use Closure;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Symfony\Component\HttpFoundation\Response;

class JwtAuth
{
    public function handle(Request $request, Closure $next): Response
    {
        if ($request->user()) {
            return $next($request);
        }

        $header = (string) $request->header('Authorization', '');
        if (!str_starts_with($header, 'Bearer ')) {
            return response()->json(['error' => 'Acceso no autorizado. Inicia sesión para continuar.'], 401);
        }

        $token = trim(substr($header, 7));
        $payload = JwtService::verify($token);
        if (!$payload || empty($payload['sub'])) {
            return response()->json(['error' => 'Token inválido o expirado.'], 401);
        }

        $user = User::find($payload['sub']);
        if (!$user || !$user->active) {
            return response()->json(['error' => 'Cuenta inactiva o inexistente.'], 401);
        }

        Auth::setUser($user);
        $request->setUserResolver(fn () => $user);

        return $next($request);
    }
}
