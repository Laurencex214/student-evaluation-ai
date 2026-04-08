{{-- resources/views/dash/sidebar.blade.php --}}
{{-- Sidebar navigation partial - included in dash.main --}}

<aside id="sidebar" class="w-72 flex flex-col h-full shrink-0 shadow-xl lg:shadow-none z-30 lg:relative absolute left-0 top-0 bg-gradient-to-b from-primary to-primaryDark text-white overflow-y-auto">
    <!-- LOGO / BRAND -->
    <div class="px-6 py-8 flex items-center gap-4 border-b border-white/10">
        <div class="w-12 h-12 bg-white/10 rounded-2xl flex items-center justify-center shadow-inner shrink-0">
            <i class="fas fa-graduation-cap text-2xl text-accent"></i>
        </div>
        <div>
            <h1 class="text-sm font-bold tracking-wide leading-tight">AI-Driven Student</h1>
            <p class="text-[10px] text-white/60 font-medium uppercase tracking-widest">Evaluation System</p>
        </div>
    </div>

    <!-- ROLE TAG -->
    <div class="px-6 py-3">
        <span id="role-tag" class="text-[9px] font-bold uppercase tracking-widest px-3 py-1 rounded-full bg-white/10 border border-white/20 text-white/70">GUEST</span>
    </div>

    <!-- NAVIGATION MENU -->
    <nav class="flex-1 px-3 py-2 space-y-1">
        <button onclick="navigate('dashboard')" id="nav-dashboard"
            class="sidebar-item w-full flex items-center gap-3.5 px-4 py-3.5 rounded-xl text-sm text-white/70 hover:text-white hover:bg-white/10 transition-all">
            <i class="fas fa-th-large w-5 text-center text-lg opacity-80"></i>
            <span>Dashboard</span>
        </button>

        <button onclick="navigate('add-student')" id="nav-add-student"
            class="sidebar-item w-full flex items-center gap-3.5 px-4 py-3.5 rounded-xl text-sm text-white/70 hover:text-white hover:bg-white/10 transition-all">
            <i class="fas fa-user-plus w-5 text-center text-lg opacity-80"></i>
            <span>Add Students</span>
        </button>

        <button onclick="navigate('records')" id="nav-records"
            class="sidebar-item w-full flex items-center gap-3.5 px-4 py-3.5 rounded-xl text-sm text-white/70 hover:text-white hover:bg-white/10 transition-all">
            <i class="fas fa-table w-5 text-center text-lg opacity-80"></i>
            <span>Grading Records</span>
        </button>

        {{-- Admin-only items --}}
        <button onclick="navigate('manage-teachers')" id="nav-manage-teachers"
            class="sidebar-item hidden w-full flex items-center gap-3.5 px-4 py-3.5 rounded-xl text-sm text-white/70 hover:text-white hover:bg-white/10 transition-all">
            <i class="fas fa-chalkboard-teacher w-5 text-center text-lg opacity-80"></i>
            <span>Manage Teachers</span>
        </button>

        <button onclick="navigate('logs')" id="nav-logs"
            class="sidebar-item hidden w-full flex items-center gap-3.5 px-4 py-3.5 rounded-xl text-sm text-white/70 hover:text-white hover:bg-white/10 transition-all">
            <i class="fas fa-clipboard-list w-5 text-center text-lg opacity-80"></i>
            <span>Activity Logs</span>
        </button>
    </nav>

    <!-- BOTTOM: QR VIEWER & LOGOUT -->
    <div class="p-4 space-y-2 border-t border-white/10">
        <button onclick="document.getElementById('qr-scan-modal').classList.remove('hidden')"
            class="w-full flex items-center gap-3.5 px-4 py-3.5 rounded-xl text-sm text-white/70 hover:text-white hover:bg-white/10 transition-all">
            <i class="fas fa-qrcode w-5 text-center text-lg opacity-80"></i>
            <span>Scan Student QR</span>
        </button>
        <button onclick="logout()"
            class="w-full flex items-center gap-3.5 px-4 py-3.5 rounded-xl text-sm text-red-300 hover:text-white hover:bg-red-500/40 transition-all">
            <i class="fas fa-sign-out-alt w-5 text-center text-lg opacity-80"></i>
            <span>Logout</span>
        </button>
    </div>
</aside>
