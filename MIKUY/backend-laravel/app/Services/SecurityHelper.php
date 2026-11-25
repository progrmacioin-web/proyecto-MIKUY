<?php

namespace App\Services;

class SecurityHelper
{
    public static function cleanText(?string $value, int $max = 255): string
    {
        $str = strip_tags((string) ($value ?? ''));
        $str = preg_replace('/javascript:|on\w+\s*=/i', '', $str) ?? $str;
        return mb_substr(trim($str), 0, $max);
    }

    public static function sanitizeImageData(?string $raw): ?string
    {
        if (empty($raw)) {
            return null;
        }
        $str = trim($raw);
        if (strlen($str) > 950000) {
            abort(400, 'La imagen supera el tamaño permitido (máx. 650 KB comprimida).');
        }
        if (!preg_match('/^data:image\/(jpeg|jpg|png|webp);base64,[A-Za-z0-9+\/=]+$/', $str)) {
            abort(400, 'Formato de imagen inválido. Usa JPG, PNG o WEBP.');
        }
        return $str;
    }
}
