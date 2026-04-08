<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class StudentAttendance extends Model
{
    protected $fillable = [
        'student_id',
        'month',
        'school_days',
        'days_present',
        'school_year',
        'daily_marks',
    ];

    public function student()
    {
        return $this->belongsTo(Student::class);
    }
}
