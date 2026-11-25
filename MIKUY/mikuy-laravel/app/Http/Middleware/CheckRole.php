<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class CheckRole
{
    public function handle(Request $request, Closure $next, string ...$roles): Response
    {
        $user = $request->user();
        if (!$user || !$user->active) {
            return response()->json(['error' => 'No autenticado.'], 401);
        }
        if (!in_array($user->role, $roles, true)) {
            return response()->json(['error' => 'Acceso denegado: tu rol no tiene permisos para este módulo.'], 403);
        }
        return $next($request);
    }
}
