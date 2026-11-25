<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Support\Str;

class Donation extends Model
{
    protected $fillable = [
        'owner_id', 'name', 'description', 'category', 'qty', 'unit', 'expiry',
        'care', 'district', 'place', 'status', 'image', 'photo_data',
        'origin', 'lot', 'packaging', 'storage_type', 'trace_code',
    ];

    protected function casts(): array
    {
        return [
            'qty' => 'float',
            'expiry' => 'date:Y-m-d',
        ];
    }

    protected static function booted(): void
    {
        static::creating(function (Donation $d) {
            if (empty($d->trace_code)) {
                $d->trace_code = 'MK-LOT-' . strtoupper(Str::random(6));
            }
        });
    }

    public function owner(): BelongsTo
    {
        return $this->belongsTo(User::class, 'owner_id');
    }

    public function requests(): HasMany
    {
        return $this->hasMany(DonationRequest::class, 'donation_id');
    }

    public function deliveries(): HasMany
    {
        return $this->hasMany(Delivery::class, 'donation_id');
    }
}
