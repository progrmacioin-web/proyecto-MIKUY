<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;

class User extends Authenticatable
{
    use HasFactory, Notifiable;

    protected $fillable = [
        'name', 'email', 'password', 'role', 'organization', 'district',
        'phone', 'active', 'verification', 'public_description', 'photo_data',
    ];

    protected $hidden = [
        'password',
        'remember_token',
    ];

    protected function casts(): array
    {
        return [
            'password' => 'hashed',
            'active' => 'boolean',
        ];
    }

    public function donations(): HasMany
    {
        return $this->hasMany(Donation::class, 'owner_id');
    }

    public function requests(): HasMany
    {
        return $this->hasMany(DonationRequest::class, 'organization_id');
    }

    public function deliveries(): HasMany
    {
        return $this->hasMany(Delivery::class, 'organization_id');
    }

    public function needs(): HasMany
    {
        return $this->hasMany(OrganizationNeed::class, 'organization_id');
    }

    public function sentMessages(): HasMany
    {
        return $this->hasMany(Message::class, 'sender_id');
    }

    public function toPublicArray(): array
    {
        return [
            'id' => $this->id,
            'name' => $this->name,
            'email' => $this->email,
            'role' => $this->role,
            'organization' => $this->organization ?? '',
            'district' => $this->district,
            'phone' => $this->phone ?? '',
            'active' => (bool) $this->active,
            'verification' => $this->verification ?? 'pending',
            'public_description' => $this->public_description ?? '',
            'photo_data' => $this->photo_data,
        ];
    }
}
