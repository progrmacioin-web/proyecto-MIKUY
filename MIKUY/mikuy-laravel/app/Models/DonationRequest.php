<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Relations\HasOne;

class DonationRequest extends Model
{
    protected $fillable = [
        'donation_id', 'organization_id', 'qty', 'message', 'status', 'response',
    ];

    protected function casts(): array
    {
        return ['qty' => 'float'];
    }

    public function donation(): BelongsTo
    {
        return $this->belongsTo(Donation::class, 'donation_id');
    }

    public function organization(): BelongsTo
    {
        return $this->belongsTo(User::class, 'organization_id');
    }

    public function delivery(): HasOne
    {
        return $this->hasOne(Delivery::class, 'request_id');
    }

    public function messages(): HasMany
    {
        return $this->hasMany(Message::class, 'request_id');
    }
}
