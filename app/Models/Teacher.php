<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Teacher extends Model
{
    protected $fillable = [
        'teacher_id',
        'name',
        'username',
        'password',
        'profile_picture',
        'subject',
        'is_adviser',
        'section',
        'level',
        'strand',
        'assignment_history',
        'qr_pin',
    ];

    protected $casts = [
        'is_adviser' => 'boolean',
        'assignment_history' => 'array',
    ];

    protected $hidden = ['password', 'qr_pin'];
}
