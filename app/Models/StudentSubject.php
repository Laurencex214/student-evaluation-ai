<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class StudentSubject extends Model
{
    protected $table = 'student_subjects';

    protected $fillable = [
        'student_id',
        'subject_name',
        'quarter',
        'school_year',
        'ww1', 'ww2', 'ww3', 'ww4', 'ww5',
        'pt1', 'pt2', 'pt3', 'pt4', 'pt5',
        'qa',
        'grade',
    ];

    protected $casts = [
        'ww1' => 'float', 'ww2' => 'float', 'ww3' => 'float', 'ww4' => 'float', 'ww5' => 'float',
        'pt1' => 'float', 'pt2' => 'float', 'pt3' => 'float', 'pt4' => 'float', 'pt5' => 'float',
        'qa'  => 'float',
        'grade' => 'float',
    ];

    public function student()
    {
        return $this->belongsTo(Student::class);
    }
}
