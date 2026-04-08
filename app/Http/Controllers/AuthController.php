<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;

class AuthController extends Controller
{
    /**
     * Show the login / SPA entry page.
     * All authentication is handled client-side via JavaScript for MVP.
     */
    public function showLanding()
    {
        return view('landing');
    }

    public function showAdminLogin()
    {
        return view('auth.admin-login');
    }

    public function showTeacherLogin()
    {
        return view('auth.teacher-login');
    }
}
