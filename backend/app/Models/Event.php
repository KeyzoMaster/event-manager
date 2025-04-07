<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Event extends Model
{
    use HasFactory;
    protected $fillable = [
        'title',
        'description',
        'start_date',
        'end_date',
        'location',
        'category',
        'participants_number',
        'max_participants',
        'user_id'
    ];

    // Relationship with User (creator)
    public function user()
    {
        return $this->belongsTo(User::class);
    }

    // Relationship with Registrations
    public function registrations()
    {
        return $this->hasMany(Registration::class);
    }
    
    // Relationship with registered users
    public function registeredUsers()
    {
        return $this->belongsToMany(User::class, 'registrations');
    }
    protected function casts(): array
    {
        return [
            'start_date' => 'datetime',
            'end_date' => 'datetime',
        ];
    }
}
