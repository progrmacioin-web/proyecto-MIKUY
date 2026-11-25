<?php

namespace App\Http\Controllers;

use App\Models\User;
use App\Services\JwtService;
use App\Services\SecurityHelper;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\RateLimiter;
use Illuminate\Support\Str;
use Illuminate\Validation\Rule;

class AuthController extends Controller
{
    public function login(Request $request): JsonResponse
    {
        $email = strtolower(trim((string) $request->input('email', '')));
        $password = (string) $request->input('password', '');

        if ($email === '' || $password === '') {
            return response()->json(['error' => 'Debes ingresar correo y contraseña.'], 400);
        }

        $throttleKey = Str::lower($email) . '|' . $request->ip();
        if (!app()->runningUnitTests() && RateLimiter::tooManyAttempts($throttleKey, 10)) {
            return response()->json(['error' => 'Demasiados intentos. Espera un minuto.'], 429);
        }

        // Consulta parametrizada mediante Eloquent ORM (previene SQL Injection)
        $user = User::where('email', $email)->first();
        if (!$user || !$user->active || !Hash::check($password, $user->password)) {
            RateLimiter::hit($throttleKey, 60);
            return response()->json(['error' => 'Credenciales inválidas o cuenta inactiva.'], 401);
        }

        RateLimiter::clear($throttleKey);

        return response()->json([
            'message' => 'Inicio de sesión exitoso.',
            'token' => JwtService::sign($user),
            'user' => $user->toPublicArray(),
        ]);
    }

    public function register(Request $request): JsonResponse
    {
        $name = SecurityHelper::cleanText($request->input('name'), 120);
        $email = strtolower(trim((string) $request->input('email', '')));
        $password = (string) $request->input('password', '');
        $role = (string) $request->input('role', 'donor');
        $district = SecurityHelper::cleanText($request->input('district', 'Cusco'), 80);
        $phone = SecurityHelper::cleanText($request->input('phone', ''), 30);

        if (mb_strlen($name) < 3) {
            return response()->json(['error' => 'El nombre debe tener al menos 3 caracteres.'], 400);
        }
        if (!filter_var($email, FILTER_VALIDATE_EMAIL)) {
            return response()->json(['error' => 'Ingresa un correo electrónico válido.'], 400);
        }
        if (strlen($password) < 8) {
            return response()->json(['error' => 'La contraseña debe tener mínimo 8 caracteres.'], 400);
        }
        // OWASP A01: Impide autoregistro como administrador
        if (!in_array($role, ['donor', 'organization'], true)) {
            return response()->json(['error' => 'Tipo de cuenta no permitido para registro público.'], 400);
        }
        if (User::where('email', $email)->exists()) {
            return response()->json(['error' => 'Ese correo electrónico ya está registrado.'], 409);
        }

        $user = User::create([
            'name' => $name,
            'email' => $email,
            'password' => Hash::make($password),
            'role' => $role,
            'organization' => $role === 'organization' ? $name : '',
            'district' => $district,
            'phone' => $phone,
            'active' => true,
            'verification' => $role === 'organization' ? 'pending' : 'verified',
        ]);

        return response()->json([
            'message' => 'Cuenta creada correctamente.',
            'token' => JwtService::sign($user),
            'user' => $user->toPublicArray(),
        ], 201);
    }

    public function me(Request $request): JsonResponse
    {
        return response()->json(['user' => $request->user()->toPublicArray()]);
    }

    public function updateProfile(Request $request): JsonResponse
    {
        $user = $request->user();
        $updates = [];

        if ($request->has('name')) {
            $name = SecurityHelper::cleanText($request->input('name'), 120);
            if (mb_strlen($name) < 3) {
                return response()->json(['error' => 'El nombre debe tener al menos 3 caracteres.'], 400);
            }
            $updates['name'] = $name;
        }
        if ($request->has('organization')) {
            $updates['organization'] = SecurityHelper::cleanText($request->input('organization'), 150);
        }
        if ($request->has('district')) {
            $updates['district'] = SecurityHelper::cleanText($request->input('district'), 80);
        }
        if ($request->has('phone')) {
            $updates['phone'] = SecurityHelper::cleanText($request->input('phone'), 30);
        }
        if ($request->has('public_description')) {
            $updates['public_description'] = SecurityHelper::cleanText($request->input('public_description'), 600);
        }
        if ($request->has('photo_data')) {
            $raw = $request->input('photo_data');
            $updates['photo_data'] = $raw ? SecurityHelper::sanitizeImageData($raw) : null;
        }

        $user->update($updates);
        return response()->json([
            'message' => 'Perfil actualizado correctamente.',
            'user' => $user->fresh()->toPublicArray(),
        ]);
    }
}
