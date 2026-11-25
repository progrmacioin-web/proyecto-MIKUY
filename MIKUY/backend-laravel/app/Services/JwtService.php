<?php

namespace App\Services;

use App\Models\User;

class JwtService
{
    private static function base64UrlEncode(string $data): string
    {
        return rtrim(strtr(base64_encode($data), '+/', '-_'), '=');
    }

    private static function base64UrlDecode(string $data): string
    {
        return base64_decode(strtr($data, '-_', '+/') . str_repeat('=', (4 - strlen($data) % 4) % 4));
    }

    private static function secret(): string
    {
        return (string) (env('JWT_SECRET') ?: config('app.key', 'mikuy_cusco_2026_secret'));
    }

    public static function sign(User $user): string
    {
        $header = self::base64UrlEncode(json_encode(['alg' => 'HS256', 'typ' => 'JWT']));
        $payload = self::base64UrlEncode(json_encode([
            'sub' => $user->id,
            'email' => $user->email,
            'role' => $user->role,
            'iat' => time(),
            'exp' => time() + 8 * 3600,
        ]));
        $sig = self::base64UrlEncode(hash_hmac('sha256', "$header.$payload", self::secret(), true));
        return "$header.$payload.$sig";
    }

    public static function verify(string $token): ?array
    {
        $parts = explode('.', $token);
        if (count($parts) !== 3) {
            return null;
        }
        [$header, $payload, $sig] = $parts;
        $expected = self::base64UrlEncode(hash_hmac('sha256', "$header.$payload", self::secret(), true));
        if (!hash_equals($expected, $sig)) {
            return null;
        }
        $data = json_decode(self::base64UrlDecode($payload), true);
        if (!is_array($data) || ($data['exp'] ?? 0) < time()) {
            return null;
        }
        return $data;
    }
}
