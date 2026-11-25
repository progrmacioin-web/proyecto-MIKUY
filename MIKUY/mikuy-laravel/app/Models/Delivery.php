<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Support\Str;

class Delivery extends Model
{
    protected $fillable = [
        'donation_id', 'request_id', 'organization_id', 'qty', 'unit', 'status',
        'scheduled_date', 'scheduled_time', 'pickup_place', 'certificate_code',
        'pickup_pin', 'received_at',
    ];

    protected function casts(): array
    {
        return [
            'qty' => 'float',
            'received_at' => 'datetime',
        ];
    }

    protected static function booted(): void
    {
        static::creating(function (Delivery $del) {
            if (empty($del->certificate_code)) {
                $del->certificate_code = 'MK-CUS-' . now()->format('Y') . '-' . strtoupper(Str::random(6));
            }
            if (empty($del->pickup_pin)) {
                $del->pickup_pin = (string) random_int(100000, 999999);
            }
        });
    }

    public function donation(): BelongsTo
    {
        return $this->belongsTo(Donation::class, 'donation_id');
    }

    public function request(): BelongsTo
    {
        return $this->belongsTo(DonationRequest::class, 'request_id');
    }

    public function organization(): BelongsTo
    {
        return $this->belongsTo(User::class, 'organization_id');
    }
}
