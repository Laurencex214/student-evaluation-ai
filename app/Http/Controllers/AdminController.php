<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;

class AdminController extends Controller
{
    /**
     * Admin Dashboard page.
     */
    public function dashboard()
    {
        return view('admin.dashboard');
    }

    /**
     * Add Students page.
     */
    public function addStudents()
    {
        return view('admin.addstudents');
    }

    /**
     * Grading / Records page.
     */
    public function records()
    {
        return view('admin.records');
    }

    /**
     * Manage Teachers page.
     */
    public function manageTeachers()
    {
        return view('admin.manageTeachers');
    }

    /**
     * Assign Section page.
     */
    public function assignSection()
    {
        return view('admin.assignSection');
    }

    /**
     * Activity Logs page.
     */
    public function activityLogs()
    {
        return view('admin.activityLogs');
    }

    /**
     * Analytics page.
     */
    public function analytics()
    {
        return view('admin.analytics');
    }

    /**
     * Settings page.
     */
    public function settings()
    {
        return view('admin.settings');
    }


}
