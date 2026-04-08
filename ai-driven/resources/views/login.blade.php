{{--
    resources/views/login.blade.php
    Full SPA entry page — contains both login screen and the app shell.
    JavaScript controls which panel is visible (login or app-container).
    This is the main working page for the application.
--}}
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>CNHS | AI-Driven Student Evaluation System</title>

    {{-- CDN Libraries --}}
    <script src="https://cdn.tailwindcss.com"></script>
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css">
    <script src="https://cdn.jsdelivr.net/npm/chart.js"></script>
    <script src="https://cdn.jsdelivr.net/npm/marked/marked.min.js"></script>
    <script src="https://cdnjs.cloudflare.com/ajax/libs/qrcodejs/1.0.0/qrcode.min.js"></script>
    <script src="https://unpkg.com/html5-qrcode"></script>

    {{-- Tailwind Theme Config --}}
    <script>
        tailwind.config = {
            theme: {
                extend: {
                    colors: {
                        primary: '#166534', primaryDark: '#14532d',
                        accent: '#f59e0b', surface: '#ffffff',
                        background: '#f3f4f6', textMain: '#1e293b'
                    },
                    animation: {
                        'fade-in': 'fadeIn 0.4s ease-out forwards',
                        'slide-up': 'slideUp 0.5s ease-out forwards',
                        'scale-up': 'scaleUp 0.3s ease-out forwards'
                    },
                    keyframes: {
                        fadeIn: { '0%': { opacity: '0' }, '100%': { opacity: '1' } },
                        slideUp: { '0%': { transform: 'translateY(15px)', opacity: '0' }, '100%': { transform: 'translateY(0)', opacity: '1' } },
                        scaleUp: { '0%': { transform: 'scale(0.96)', opacity: '0' }, '100%': { transform: 'scale(1)', opacity: '1' } }
                    }
                }
            }
        }
    </script>

    <link rel="stylesheet" href="{{ asset('css/app.css') }}">
</head>
<body class="h-screen flex flex-col">

    {{-- ==================== LOGIN SCREEN ==================== --}}
    <div id="login-screen" class="flex flex-col lg:flex-row h-full">

        {{-- LEFT PANEL — Hero --}}
        <div class="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-primary via-primaryDark to-green-900 flex-col items-center justify-center p-16 relative overflow-hidden">
            <div class="absolute inset-0 opacity-30 animate-pulse" style="animation-duration: 4s;">
                <div class="absolute top-16 left-16 w-64 h-64 bg-white rounded-full blur-3xl"></div>
                <div class="absolute bottom-16 right-16 w-96 h-96 bg-accent rounded-full blur-3xl"></div>
            </div>
            <div class="relative text-center animate-slide-up">
                <div class="w-28 h-28 bg-white/10 rounded-3xl flex items-center justify-center mx-auto mb-8 shadow-2xl border border-white/20">
                    <i class="fas fa-graduation-cap text-5xl text-accent"></i>
                </div>
                <h1 class="text-4xl font-bold text-white leading-tight mb-4">AI-Driven Student<br>Evaluation System</h1>
                <p class="text-lg text-white/60 max-w-sm mx-auto leading-relaxed">City National High School &mdash; Intelligent Academic Performance Management</p>
                <div class="mt-10 flex flex-col gap-3 text-left max-w-xs mx-auto">
                    <div class="flex items-center gap-3 bg-white/10 rounded-xl p-3">
                        <i class="fas fa-brain text-accent w-5 text-center"></i>
                        <span class="text-white/80 text-sm">AI-powered grade extraction</span>
                    </div>
                    <div class="flex items-center gap-3 bg-white/10 rounded-xl p-3">
                        <i class="fas fa-qrcode text-accent w-5 text-center"></i>
                        <span class="text-white/80 text-sm">QR-based student identity cards</span>
                    </div>
                    <div class="flex items-center gap-3 bg-white/10 rounded-xl p-3">
                        <i class="fas fa-chart-line text-accent w-5 text-center"></i>
                        <span class="text-white/80 text-sm">Real-time honor classification</span>
                    </div>
                </div>
            </div>
        </div>

        {{-- RIGHT PANEL — Login Form --}}
        <div class="flex-1 flex items-center justify-center p-8 bg-background overflow-y-auto">
            <div class="w-full max-w-md animate-fade-in">

                {{-- Mobile Logo --}}
                <div class="lg:hidden text-center mb-8">
                    <div class="w-20 h-20 bg-primary rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-xl">
                        <i class="fas fa-graduation-cap text-3xl text-accent"></i>
                    </div>
                    <h1 class="text-2xl font-bold text-gray-800">CNHS Student System</h1>
                </div>

                <div class="mb-8">
                    <h2 class="text-3xl font-bold text-gray-800">Welcome back</h2>
                    <p class="text-gray-400 mt-1.5 text-sm">Please log in to access your dashboard.</p>
                </div>

                {{-- Input Fields --}}
                <div class="space-y-4 mb-6">
                    <div class="relative">
                        <div class="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                            <i class="fas fa-user text-gray-400"></i>
                        </div>
                        <input type="text" id="login-user" placeholder="Username"
                               class="w-full pl-11 pr-4 py-4 border border-gray-200 rounded-xl bg-white text-sm focus:bg-white focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition shadow-sm">
                    </div>
                    <div class="relative">
                        <div class="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                            <i class="fas fa-lock text-gray-400"></i>
                        </div>
                        <input type="password" id="login-pass" placeholder="Password"
                               class="w-full pl-11 pr-4 py-4 border border-gray-200 rounded-xl bg-white text-sm focus:bg-white focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition shadow-sm"
                               onkeypress="if(event.key==='Enter') login(document.getElementById('active-role').value || 'admin')">
                    </div>
                    <input type="hidden" id="active-role" value="">
                </div>

                {{-- Error Message --}}
                <p id="login-error" class="hidden text-red-500 text-xs font-semibold mb-4 p-3 bg-red-50 rounded-xl border border-red-100"></p>

                {{-- Login Buttons --}}
                <div class="grid grid-cols-2 gap-3 mb-6">
                    <button onclick="document.getElementById('active-role').value='admin'; login('admin')"
                            class="py-4 bg-gray-900 text-white rounded-xl font-bold text-sm transition-all duration-300 shadow-md hover:shadow-xl hover:-translate-y-1 flex items-center justify-center gap-2">
                        <i class="fas fa-shield-alt text-accent"></i> Login as Admin
                    </button>
                    <button onclick="document.getElementById('active-role').value='teacher'; login('teacher')"
                            class="py-4 bg-white text-gray-700 border border-gray-200 rounded-xl font-bold text-sm hover:border-primary hover:text-primary transition-all duration-300 shadow-sm hover:shadow-xl hover:-translate-y-1 flex items-center justify-center gap-2">
                        <i class="fas fa-chalkboard-teacher text-primary"></i> Login as Teacher
                    </button>
                </div>

                {{-- Student QR Button --}}
                <div class="text-center">
                    <p class="text-[10px] text-gray-400 uppercase font-bold tracking-wider mb-3">For Students</p>
                    <button onclick="document.getElementById('qr-scan-modal').classList.remove('hidden')"
                            class="w-full py-3.5 border-2 border-dashed border-gray-200 rounded-xl text-sm font-bold text-gray-500 hover:border-primary hover:text-primary hover:bg-green-50 transition flex items-center justify-center gap-2">
                        <i class="fas fa-qrcode text-lg"></i> Scan QR to View My Grades
                    </button>
                </div>

                <p class="text-center text-[10px] text-gray-300 mt-6 font-mono">
                    Admin: admin/admin123 &bull; Teacher: clara123/teach123
                </p>
            </div>
        </div>
    </div>

    {{-- ==================== APP CONTAINER (hidden until login) ==================== --}}
    <div id="app-container" class="hidden flex h-full">

        @include('dash.sidebar')

        {{-- MAIN CONTENT AREA --}}
        <main class="flex-1 flex flex-col h-full overflow-hidden relative">

            {{-- HEADER --}}
            <header class="h-20 bg-white border-b border-gray-200 flex items-center justify-between px-8 z-20 shrink-0">
                <div class="flex items-center gap-4">
                    <button class="lg:hidden text-gray-500" onclick="toggleSidebar()">
                        <i class="fas fa-bars text-xl"></i>
                    </button>
                    <h2 class="text-xl font-bold text-gray-800" id="page-title">Dashboard</h2>
                </div>
                <div class="flex items-center gap-4">
                    <div class="text-right hidden sm:block">
                        <p class="text-sm font-bold text-gray-800 leading-tight" id="user-display-name">User</p>
                        <p class="text-[10px] text-gray-400 uppercase font-bold" id="user-display-role">Role</p>
                    </div>
                    <img id="user-display-avatar" src=""
                         class="w-10 h-10 rounded-xl border-2 border-gray-100 object-cover">
                </div>
            </header>

            {{-- CONTENT AREA --}}
            <div id="content-area" class="flex-1 overflow-y-auto p-4 sm:p-8 scroll-smooth bg-background">
            </div>

            {{-- CHATBOT BUBBLE --}}
            <div id="chatbot-container" class="fixed bottom-6 right-6 z-40 flex flex-col items-end">
                <div id="chat-window" class="hidden bg-white w-80 h-96 rounded-2xl shadow-2xl border border-gray-200 flex flex-col mb-4 overflow-hidden animate-slide-up">
                    <div class="bg-primary p-4 text-white flex justify-between items-center">
                        <span class="text-xs font-bold"><i class="fas fa-robot mr-2"></i>CNHS AI Assistant</span>
                        <button onclick="toggleChat()"><i class="fas fa-times"></i></button>
                    </div>
                    <div id="chat-messages" class="flex-1 overflow-y-auto p-4 space-y-3 bg-gray-50 text-xs"></div>
                    <div class="p-3 border-t bg-white flex gap-2">
                        <input type="text" id="chat-input"
                               class="flex-1 border rounded-lg px-3 py-2 outline-none focus:border-primary text-xs"
                               placeholder="Ask about honors..."
                               onkeypress="if(event.key==='Enter') sendChat()">
                        <button onclick="sendChat()" class="bg-primary text-white p-2 rounded-lg">
                            <i class="fas fa-paper-plane"></i>
                        </button>
                    </div>
                </div>
                <button onclick="toggleChat()"
                        class="w-12 h-12 bg-primary text-white rounded-full shadow-lg flex items-center justify-center hover:scale-110 transition">
                    <i class="fas fa-comment-dots text-xl"></i>
                </button>
            </div>
        </main>
    </div>

    {{-- ==================== MODALS ==================== --}}

    {{-- AI Document Scanner --}}
    <div id="camera-modal" class="hidden fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
        <div class="bg-white rounded-3xl shadow-2xl w-full max-w-md p-8 animate-scale-up">
            <div class="flex justify-between items-center mb-6">
                <div>
                    <h3 class="text-xl font-bold text-gray-800" id="camera-title">AI Document Scanner</h3>
                    <p class="text-xs text-gray-400 mt-1" id="camera-hint">Upload your document image</p>
                </div>
                <button onclick="closeCameraModal()" class="w-9 h-9 rounded-full bg-gray-100 text-gray-500 hover:bg-gray-200 flex items-center justify-center transition text-sm">
                    <i class="fas fa-times"></i>
                </button>
            </div>
            <label for="doc-upload" class="block cursor-pointer">
                <div class="w-full h-52 rounded-2xl bg-gray-50 border-2 border-dashed border-gray-200 flex flex-col items-center justify-center overflow-hidden relative hover:border-primary transition group">
                    <img id="doc-preview" src="" class="hidden w-full h-full object-contain">
                    <div id="doc-placeholder" class="flex flex-col items-center justify-center gap-3 group-hover:opacity-60 transition">
                        <i class="fas fa-file-image text-4xl text-gray-300"></i>
                        <p class="text-xs text-gray-400">Click to upload document image</p>
                        <p class="text-[10px] text-gray-300">Supports JPG, PNG, WebP</p>
                    </div>
                </div>
                <input type="file" id="doc-upload" class="hidden" accept="image/*" onchange="handleDocPreview(this)">
            </label>
            <div id="processing-status" class="hidden mt-4 bg-green-50 rounded-xl p-4 flex items-center gap-3 border border-green-200">
                <div class="spinner shrink-0"></div>
                <div>
                    <p class="text-xs font-bold text-primary">AI Processing...</p>
                    <p class="text-[10px] text-gray-400">Gemini is analyzing your document</p>
                </div>
            </div>
            <button id="process-btn" onclick="processAI()" disabled
                    class="mt-4 w-full py-3.5 bg-primary text-white rounded-xl font-bold text-sm transition shadow-md hover:bg-primaryDark disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2">
                <i class="fas fa-brain"></i> Process with AI
            </button>
        </div>
    </div>

    {{-- Master Grades Override --}}
    <div id="grades-modal" class="hidden fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
        <div class="bg-white rounded-3xl shadow-2xl w-full max-w-lg p-8 animate-scale-up">
            <div class="flex justify-between items-center mb-5">
                <div>
                    <h3 class="text-lg font-bold text-gray-800">Encode / Override Grades</h3>
                    <p class="text-xs text-gray-400">Select a student to edit their master record.</p>
                </div>
                <button onclick="closeGradesModal()" class="w-8 h-8 rounded-full bg-gray-100 text-gray-500 hover:bg-gray-200 flex items-center justify-center transition text-sm">
                    <i class="fas fa-times"></i>
                </button>
            </div>
            <div class="grid grid-cols-2 gap-3 mb-4">
                <div>
                    <label class="text-[10px] font-bold text-gray-500 uppercase mb-1 block">Section</label>
                    <select id="grade-section-select" onchange="filterStudentsBySectionModal()" class="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-xs font-bold outline-none focus:border-primary bg-white cursor-pointer">
                        <option value="" disabled selected>-- Choose Section --</option>
                    </select>
                </div>
                <div>
                    <label class="text-[10px] font-bold text-gray-500 uppercase mb-1 block">Student</label>
                    <select id="grade-student-select" onchange="populateMasterGradeForm()" class="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-xs font-bold outline-none focus:border-primary bg-white cursor-pointer" disabled>
                        <option value="" disabled selected>-- Choose Student --</option>
                    </select>
                </div>
            </div>
            <form onsubmit="saveMasterGrades(event)" class="space-y-4">
                <div id="grade-form-dynamic-area"></div>
                <button type="submit" class="w-full py-3.5 bg-primary text-white rounded-xl font-bold text-sm transition shadow-md hover:bg-primaryDark flex items-center justify-center gap-2">
                    <i class="fas fa-save"></i> Save Evaluation
                </button>
            </form>
        </div>
    </div>

    {{-- Student Academic Report --}}
    <div id="report-modal" class="hidden fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
        <div class="bg-white rounded-3xl shadow-2xl w-full max-w-md max-h-[90vh] overflow-y-auto p-8 animate-scale-up">
            <div id="report-content"></div>
        </div>
    </div>

    {{-- Student ID Card --}}
    <div id="id-card-modal" class="hidden fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
        <div class="bg-white rounded-3xl shadow-2xl w-full max-w-sm max-h-[90vh] overflow-y-auto p-8 animate-scale-up flex flex-col items-center">
            <div class="w-full flex justify-end mb-4 no-print">
                <button onclick="closeQRModal()" class="w-8 h-8 rounded-full bg-gray-100 text-gray-500 hover:bg-gray-200 flex items-center justify-center transition text-sm">
                    <i class="fas fa-times"></i>
                </button>
            </div>
            <div id="id-card-content" class="w-full flex flex-col items-center"></div>
        </div>
    </div>

    {{-- Student QR Scanner (from sidebar) --}}
    <div id="qr-scan-modal" class="hidden fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
        <div class="bg-white rounded-3xl shadow-2xl w-full max-w-sm p-8 animate-scale-up">
            <div class="flex justify-between items-center mb-6">
                <div>
                    <h3 class="text-xl font-bold text-gray-800">Scan Student QR</h3>
                    <p class="text-xs text-gray-400 mt-1">View individual student academic report</p>
                </div>
                <button onclick="document.getElementById('qr-scan-modal').classList.add('hidden'); stopCameraScanner();"
                        class="w-9 h-9 rounded-full bg-gray-100 text-gray-500 hover:bg-gray-200 flex items-center justify-center transition text-sm">
                    <i class="fas fa-times"></i>
                </button>
            </div>
            <div class="w-full rounded-2xl bg-gray-900 overflow-hidden relative" style="aspect-ratio: 1/1; min-height: 240px;">
                <div id="qr-reader" class="hidden w-full h-full"></div>
                <div id="qr-loading" class="hidden absolute inset-0 flex items-center justify-center bg-black/50">
                    <div class="spinner"></div>
                </div>
                <div id="qr-entry-zone" class="absolute inset-0 flex flex-col items-center justify-center gap-4 text-white">
                    <div class="relative w-32 h-32 border-4 border-white/30 rounded-2xl flex items-center justify-center">
                        <div class="scanner-line"></div>
                        <i class="fas fa-qrcode text-5xl text-white/20"></i>
                    </div>
                    <p class="text-xs text-white/60">Position QR code in frame</p>
                </div>
            </div>
            <input type="file" id="qr-input" accept="image/*" class="hidden" onchange="handleQrScan(this)">
            <div id="stop-scan-btn" class="hidden mt-4">
                <button onclick="stopCameraScanner()" class="w-full py-2.5 bg-red-500 text-white rounded-xl text-xs font-bold hover:bg-red-600 transition flex items-center justify-center gap-2">
                    <i class="fas fa-stop-circle"></i> Stop Camera
                </button>
            </div>
            <div class="mt-4 grid grid-cols-2 gap-3">
                <button onclick="startCameraScanner()"
                        class="col-span-1 py-3 bg-primary text-white rounded-xl text-xs font-bold hover:bg-primaryDark transition flex items-center justify-center gap-2 shadow-md">
                    <i class="fas fa-camera"></i> Use Camera
                </button>
                <button onclick="triggerQrFile()"
                        class="col-span-1 py-3 bg-gray-100 text-gray-700 rounded-xl text-xs font-bold hover:bg-gray-200 transition flex items-center justify-center gap-2">
                    <i class="fas fa-image"></i> Upload Image
                </button>
            </div>
        </div>
    </div>

    {{-- Hidden canvas for image processing --}}
    <canvas id="canvas-tool" class="hidden"></canvas>

    {{-- ==================== SCRIPTS ==================== --}}
    {{-- Core logic --}}
    <script src="{{ asset('js/app.js') }}"></script>

    {{-- All render functions (admin + shared for teacher) --}}
    <script src="{{ asset('js/admin/dashboard.js') }}"></script>
    <script src="{{ asset('js/admin/addstudents.js') }}"></script>
    <script src="{{ asset('js/admin/records.js') }}"></script>
    <script src="{{ asset('js/admin/manageTeachers.js') }}"></script>
    <script src="{{ asset('js/admin/activityLogs.js') }}"></script>
    <script src="{{ asset('js/admin/settings.js') }}"></script>

</body>
</html>
