<?php

namespace App\Support;

/** Lecture des limites d'envoi de PHP (elles varient d'un hébergeur à l'autre). */
final class PhpLimits
{
    /** Taille maximale d'une requête (post_max_size), en octets ; null = illimité. */
    public static function postMaxBytes(): ?int
    {
        return self::toBytes(ini_get('post_max_size'));
    }

    /** "8M" → 8388608 ; 0 ou vide = illimité (null). */
    public static function toBytes(string|false $value): ?int
    {
        $value = trim((string) $value);
        if ($value === '' || $value === '0') {
            return null;
        }

        $number = (int) $value;

        return match (strtolower(substr($value, -1))) {
            'g' => $number * 1024 ** 3,
            'm' => $number * 1024 ** 2,
            'k' => $number * 1024,
            default => $number,
        };
    }
}
