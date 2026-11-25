<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class OrganizationNeed extends Model
{
    protected $fillable = [
        'organization_id', 'product', 'category', 'qty', 'unit', 'priority', 'storage',
    ];

    protected function casts(): array
    {
        return ['qty' => 'float'];
    }

    public function organization(): BelongsTo
    {
        return $this->belongsTo(User::class, 'organization_id');
    }
}
