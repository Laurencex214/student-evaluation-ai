<?php

namespace App\Http\Controllers;

use App\Models\StudentAttendance;
use App\Models\Student;
use Illuminate\Http\Request;

class AttendanceController extends Controller
{
    public function index($lrn)
    {
        $student = Student::where('lrn', $lrn)->firstOrFail();
        return response()->json($student->attendances()->orderBy('month')->get());
    }

    public function saveBulk(Request $request)
    {
        $lrn = $request->lrn;
        $records = $request->records; // array of {month, school_days, days_present, school_year}
        $student = Student::where('lrn', $lrn)->firstOrFail();

        foreach ($records as $rec) {
            StudentAttendance::updateOrCreate(
                [
                    'student_id' => $student->id,
                    'month' => $rec['month'],
                    'school_year' => $rec['school_year']
                ],
                [
                    'school_days' => $rec['school_days'],
                    'days_present' => $rec['days_present']
                ]
            );
        }

        return response()->json(['success' => true]);
    }

    public function saveSectionBulk(Request $request)
    {
        $month = $request->month;
        $school_year = $request->school_year;
        $records = $request->records; // array of {lrn, school_days, days_present}

        foreach ($records as $rec) {
            $student = Student::where('lrn', $rec['lrn'])->first();
            if ($student) {
                StudentAttendance::updateOrCreate(
                    [
                        'student_id' => $student->id,
                        'month' => $month,
                        'school_year' => $school_year
                    ],
                    [
                        'school_days' => $rec['school_days'],
                        'days_present' => $rec['days_present'],
                        'daily_marks' => isset($rec['daily_marks']) ? json_encode($rec['daily_marks']) : null
                    ]
                );

                // Update overall attendance percent
                $totalDays = $student->attendances()->sum('school_days');
                $totalPresent = $student->attendances()->sum('days_present');
                $student->attendance = $totalDays > 0 ? round(($totalPresent / $totalDays) * 100, 2) : 0;
                $student->save();
            }
        }

        return response()->json(['success' => true]);
    }

    public function getSectionAttendance($section)
    {
        // Get all students in the section
        $students = Student::where('section', $section)->get();
        $results = [];

        foreach ($students as $student) {
            $results[$student->lrn] = $student->attendances()->orderBy('month')->get()->map(function($att) {
                $att->daily_marks = $att->daily_marks ? json_decode($att->daily_marks) : null;
                return $att;
            });
        }

        return response()->json($results);
    }
}
