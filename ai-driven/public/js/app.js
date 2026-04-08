/**
 * app.js — CNHS AI-Driven Student Evaluation System
 * Core shared logic: data, state, auth, navigation, modals, QR, AI scanner, chatbot.
 * All render functions are in the page-specific JS files (admin/*.js).
 */

// NOTE: API_KEY is now kept server-side for the chatbot (secure).
// It is only used here for the AI Document Scanner image processing.
const API_KEY = "AIzaSyDgwHguATP7EuRW9I8_z4GE2Cb0HLLuqmk";
const currentUser = { role: null, name: '', id: '' };

const coreSubjects = ['Business Math', 'Science', 'English', 'Filipino', 'A.P.', 'MAPEH'];
const MAX_WW = 5; // Max number of Written Works (Quizzes)
const MAX_PT = 5; // Max number of Performance Tasks

// Highest Possible Scores global tracker
let maxScores = {};
try {
    const savedMax = localStorage.getItem('system_max_scores');
    if (savedMax) {
        maxScores = JSON.parse(savedMax);
    } else {
        // Fallback defaults
        maxScores = {
            'Business Math': { ww1: 10, ww2: 10, pt1: 50, pt2: 50, qa: 50 },
            'Science': { ww1: 20, ww2: 20, ww3: 15, pt1: 100, qa: 60 }
        };
    }
} catch {
    maxScores = {};
}

function saveMaxScores() {
    localStorage.setItem('system_max_scores', JSON.stringify(maxScores));
}

let students = [];

// Central computation logic for individual subject based on raw scores & max scores
function recalcStudentSubject(s, subject) {
    let sub = s.subjects.find(x => x.n === subject);
    if (!sub) {
        sub = { n: subject, g: null };
        s.subjects.push(sub);
    }
    let mScores = maxScores[subject] || {};

    let wwRaw = 0, wwMax = 0, wwHasScore = false;
    for (let i = 1; i <= MAX_WW; i++) {
        if (sub['ww' + i] !== null && sub['ww' + i] !== undefined && sub['ww' + i] !== '') {
            wwRaw += parseFloat(sub['ww' + i]);
            wwHasScore = true;
        }
        if (mScores['ww' + i]) wwMax += parseFloat(mScores['ww' + i]);
    }

    let wwPS = 0;
    if (wwMax > 0) {
        wwPS = (wwRaw / wwMax) * 100;
    } else if (wwHasScore) {
        let sum = 0, count = 0;
        for (let i = 1; i <= MAX_WW; i++) {
            if (sub['ww' + i] !== null && sub['ww' + i] !== undefined && sub['ww' + i] !== '') { sum += parseFloat(sub['ww' + i]); count++; }
        }
        wwPS = sum / count;
    }

    let ptRaw = 0, ptMax = 0, ptHasScore = false;
    for (let i = 1; i <= MAX_PT; i++) {
        if (sub['pt' + i] !== null && sub['pt' + i] !== undefined && sub['pt' + i] !== '') {
            ptRaw += parseFloat(sub['pt' + i]);
            ptHasScore = true;
        }
        if (mScores['pt' + i]) ptMax += parseFloat(mScores['pt' + i]);
    }

    let ptPS = 0;
    if (ptMax > 0) {
        ptPS = (ptRaw / ptMax) * 100;
    } else if (ptHasScore) {
        let sum = 0, count = 0;
        for (let i = 1; i <= MAX_PT; i++) {
            if (sub['pt' + i] !== null && sub['pt' + i] !== undefined && sub['pt' + i] !== '') { sum += parseFloat(sub['pt' + i]); count++; }
        }
        ptPS = sum / count;
    }

    let qaRaw = parseFloat(sub['qa']);
    let qaHasScore = !isNaN(qaRaw);
    let qaMax = parseFloat(mScores['qa']) || 0;

    let qaPS = 0;
    if (qaMax > 0 && qaHasScore) {
        qaPS = (qaRaw / qaMax) * 100;
    } else if (qaHasScore) {
        qaPS = qaRaw;
    }

    if (wwHasScore || ptHasScore || qaHasScore) {
        sub.g = parseFloat(((wwPS * 0.3) + (ptPS * 0.5) + (qaPS * 0.2)).toFixed(2));
        sub.wwPS = wwPS.toFixed(1);
        sub.ptPS = ptPS.toFixed(1);
        sub.qaPS = qaPS.toFixed(1);
    } else {
        sub.g = null;
        sub.wwPS = '-';
        sub.ptPS = '-';
        sub.qaPS = '-';
    }
}

// Global GWA computation
function computeStudentGWA(s) {
    let totalGWA = 0; let subCount = 0;
    if (s.subjects) {
        s.subjects.forEach(sub => {
            if (sub.g !== null && sub.g !== undefined) {
                totalGWA += sub.g;
                subCount++;
            }
        });
    }
    s.gwa = subCount > 0 ? parseFloat((totalGWA / subCount).toFixed(2)) : 0;
    s.risk = s.gwa > 0 && s.gwa < 75 ? 'High' : (s.gwa >= 75 ? 'Low' : 'Pending');
}

// Initialize All Grades
students.forEach(s => {
    if (s.subjects) s.subjects.forEach(sub => recalcStudentSubject(s, sub.n));
    computeStudentGWA(s);
});

let activityLogs = [{ id: 1, user: 'System', action: 'System Initialized', time: new Date().toLocaleString() }];
let teachers = [];
const adminCreds = { user: 'admin', pass: 'admin123' };

/**
 * Load students, teachers, and all subject scores from the database.
 * Called once when the user successfully logs in.
 */
async function initAppData() {
    try {
        const [studRes, teachRes] = await Promise.all([
            fetch('/api/students', { headers: { 'Accept': 'application/json' } }),
            fetch('/api/teachers', { headers: { 'Accept': 'application/json' } })
        ]);
        if (studRes.ok) students = await studRes.json();
        if (teachRes.ok) teachers = await teachRes.json();

        // Ensure each student has a subjects array
        students.forEach(s => { if (!s.subjects) s.subjects = []; });

        // Fetch all subject scores in parallel
        await Promise.all(students.map(async s => {
            try {
                const r = await fetch(`/api/students/${s.lrn}/subjects`, { headers: { 'Accept': 'application/json' } });
                if (r.ok) {
                    const rows = await r.json();
                    s.subjects = rows; // [{n, ww1..ww5, pt1..pt5, qa, g}, ...]
                    // Recalculate computed fields for each subject
                    s.subjects.forEach(sub => recalcStudentSubject(s, sub.n));
                }
            } catch { /* individual student fetch failure is non-fatal */ }
            computeStudentGWA(s);
        }));
    } catch (e) {
        console.warn('Could not load data from DB:', e);
    }
}

let activeFilter = 'total';
let currentMode = '';
let base64Image = '';
let currentSubjectView = null;
let currentRecordSection = 'all';
let currentRecordSearch = '';

// Add Student Table State
let addStudentSection = 'all';
let addStudentSearch = '';

// Global Custom Notification Wrapper (Replaces native alerts)
function showMessage(msg, isError = false) {
    const toast = document.createElement('div');
    toast.className = `fixed top-5 right-5 z-[100] px-6 py-3 rounded-xl shadow-2xl text-white font-bold text-sm transform transition-all duration-300 translate-y-[-150%] opacity-0 ${isError ? 'bg-red-600' : 'bg-primary'}`;
    toast.innerText = msg;
    document.body.appendChild(toast);

    setTimeout(() => toast.classList.remove('translate-y-[-150%]', 'opacity-0'), 10);
    setTimeout(() => {
        toast.classList.add('translate-y-[-150%]', 'opacity-0');
        setTimeout(() => toast.remove(), 300);
    }, 3000);
}

async function login(role) {
    const u = document.getElementById('login-user').value.trim();
    const p = document.getElementById('login-pass').value.trim();
    const err = document.getElementById('login-error');
    err.classList.add('hidden');

    if (!u || !p) {
        err.innerText = "Please enter both username and password.";
        err.classList.remove('hidden');
        return;
    }

    // Load fresh data from DB before entering the app
    await initAppData();

    currentUser.role = role;
    if (role === 'admin') {
        if (u !== adminCreds.user || p !== adminCreds.pass) {
            err.innerText = "Invalid Admin Credentials! (Hint: admin / admin123)";
            err.classList.remove('hidden');
            return;
        }
        currentUser.name = 'Admin Principal';
        currentUser.id = 'ADM-001';
        currentUser.subject = null;
        document.getElementById('nav-manage-teachers').classList.remove('hidden');
        document.getElementById('nav-logs').classList.remove('hidden');
    } else if (role === 'teacher') {
        // Validate against DB via API (secure password check)
        try {
            const res = await fetch('/api/teachers/login', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
                body: JSON.stringify({ username: u, password: p })
            });
            if (!res.ok) {
                err.innerText = "Invalid Teacher Credentials!";
                err.classList.remove('hidden');
                return;
            }
            const teacher = await res.json();
            currentUser.name = teacher.name;
            currentUser.id = teacher.id;
            currentUser.subject = teacher.subject;
        } catch {
            err.innerText = "Server error. Please try again.";
            err.classList.remove('hidden');
            return;
        }
    }

    document.getElementById('login-screen').classList.add('hidden');
    document.getElementById('app-container').classList.remove('hidden');
    document.getElementById('role-tag').innerText = role.toUpperCase();
    document.getElementById('user-display-name').innerText = currentUser.name;
    document.getElementById('user-display-role').innerText = role;
    document.getElementById('user-display-avatar').src = `https://ui-avatars.com/api/?name=${currentUser.name}&background=166534&color=fff&font-size=0.4`;

    // clear inputs for security
    document.getElementById('login-user').value = '';
    document.getElementById('login-pass').value = '';

    // Save session so refresh doesn't log out
    sessionStorage.setItem('cnhs_session', JSON.stringify(currentUser));

    logActivity(`User Logged In: ${currentUser.name} (${role})`);
    navigate('dashboard');
}

function logout() {
    logActivity(`User Logged Out: ${currentUser.name}`);
    sessionStorage.removeItem('cnhs_session');
    location.reload();
}

function logActivity(action) {
    activityLogs.unshift({
        id: activityLogs.length + 1,
        user: currentUser.name || 'System',
        action: action,
        time: new Date().toLocaleString()
    });
}

function navigate(view) {
    const area = document.getElementById('content-area');
    const title = document.getElementById('page-title');
    document.querySelectorAll('.sidebar-item').forEach(i => i.classList.remove('active'));
    document.getElementById(`nav-${view}`)?.classList.add('active');

    area.innerHTML = '';
    title.innerText = view.replace('-', ' ').toUpperCase();

    if (view === 'records') {
        currentSubjectView = null;
        currentRecordSearch = '';
    }
    if (view === 'add-student') {
        addStudentSearch = '';
        addStudentSection = 'all';
    }

    switch (view) {
        case 'dashboard': renderDashboard(area); break;
        case 'add-student': renderAddStudent(area); break;
        case 'records': renderRecords(area); break;
        case 'manage-teachers': renderManageTeachers(area); break;
        case 'logs': renderLogs(area); break;
    }
}

// --- MASTER GRADES MODAL (For Admins to override everything) ---
function openGradesModal() {
    document.getElementById('grades-modal').classList.remove('hidden');
    const secSelect = document.getElementById('grade-section-select');
    secSelect.innerHTML = '<option value="" disabled selected>-- Choose Section --</option>';
    const sections = [...new Set(students.map(s => s.section))].sort();
    sections.forEach(sec => secSelect.add(new Option(sec, sec)));

    document.getElementById('grade-student-select').innerHTML = '<option value="" disabled selected>-- Choose Student --</option>';
    document.getElementById('grade-student-select').disabled = true;

    const dynArea = document.getElementById('grade-form-dynamic-area');
    const visibleSubjects = currentUser.role === 'teacher' ? (currentUser.subject ? currentUser.subject.split(',').map(s => s.trim()) : []) : coreSubjects;

    dynArea.innerHTML = `
        <h4 class="text-[10px] font-bold text-primary uppercase mb-3 tracking-wider border-b border-green-200 pb-2">Final Subject Grades</h4>
        <div class="grid grid-cols-2 gap-3 mb-4">
            ${visibleSubjects.map(sub => `
                <div><label class="text-[10px] font-bold text-gray-500 uppercase block mb-1">${sub}</label><input type="number" id="grade-fin-${sub}" min="60" max="100" class="w-full px-2 py-1.5 border rounded outline-none focus:border-primary text-sm bg-white" oninput="calcOverallGWA()"></div>
            `).join('')}
        </div>
        <div class="grid grid-cols-2 gap-4 border-t border-green-200 pt-4">
            <div><label class="text-[10px] font-bold text-gray-500 uppercase block mb-1">Attendance %</label><input type="number" id="grade-att" min="0" max="100" class="w-full px-2 py-2 border rounded outline-none focus:border-primary text-sm bg-white font-bold" ${currentUser.role === 'teacher' ? 'disabled title="Only Advisers/Admins can edit attendance"' : ''}></div>
            <div class="p-2 bg-white border border-gray-200 rounded-lg flex flex-col justify-center items-center shadow-inner">
                <span class="text-[10px] font-bold text-gray-400 uppercase">Overall GWA</span>
                <span class="text-xl font-bold text-primary" id="calc-display">--</span>
            </div>
        </div>
    `;
}

function closeGradesModal() { document.getElementById('grades-modal').classList.add('hidden'); }

function filterStudentsBySectionModal() {
    const section = document.getElementById('grade-section-select').value;
    const stuSelect = document.getElementById('grade-student-select');
    stuSelect.innerHTML = '<option value="" disabled selected>-- Choose Student --</option>';
    const filtered = students.filter(s => s.section === section).sort((a, b) => a.name.localeCompare(b.name));
    if (filtered.length > 0) {
        filtered.forEach(s => stuSelect.add(new Option(s.name, s.lrn)));
        stuSelect.disabled = false;
    } else {
        stuSelect.disabled = true;
    }
}

function populateMasterGradeForm() {
    const lrn = document.getElementById('grade-student-select').value;
    const s = students.find(x => x.lrn === lrn);
    if (!s) return;

    const visibleSubjects = currentUser.role === 'teacher' ? (currentUser.subject ? currentUser.subject.split(',').map(s => s.trim()) : []) : coreSubjects;

    visibleSubjects.forEach(sub => {
        const subData = s.subjects.find(x => x.n === sub);
        document.getElementById(`grade-fin-${sub}`).value = subData && subData.g ? subData.g : '';
    });
    document.getElementById('grade-att').value = s.attendance || '';
    calcOverallGWA();
}

function calcOverallGWA() {
    let total = 0; let count = 0;
    const visibleSubjects = currentUser.role === 'teacher' ? (currentUser.subject ? currentUser.subject.split(',').map(s => s.trim()) : []) : coreSubjects;

    visibleSubjects.forEach(sub => {
        const val = parseFloat(document.getElementById(`grade-fin-${sub}`).value);
        if (!isNaN(val)) { total += val; count++; }
    });
    const display = document.getElementById('calc-display');
    display.innerText = count > 0 ? (total / count).toFixed(2) : '--';
}

function saveMasterGrades(e) {
    e.preventDefault();
    const lrn = document.getElementById('grade-student-select').value;
    if (!lrn) return showMessage("Select a student first.", true);
    const s = students.find(x => x.lrn === lrn);
    if (!s) return;

    const visibleSubjects = currentUser.role === 'teacher' ? (currentUser.subject ? currentUser.subject.split(',').map(s => s.trim()) : []) : coreSubjects;

    visibleSubjects.forEach(sub => {
        const g = parseFloat(document.getElementById(`grade-fin-${sub}`).value);
        let subObj = s.subjects.find(x => x.n === sub);
        if (!isNaN(g)) {
            if (subObj) { subObj.g = g; }
            else { s.subjects.push({ n: sub, g: g }); }
        }
    });

    if (currentUser.role === 'admin') {
        s.attendance = parseFloat(document.getElementById('grade-att').value) || s.attendance;
    }
    computeStudentGWA(s);
    logActivity(`Encoded master grades for ${s.name}`);

    // Persist each subject grade to DB
    const savePromises = visibleSubjects.map(sub => {
        const subObj = s.subjects.find(x => x.n === sub);
        if (!subObj || subObj.g === undefined) return Promise.resolve();
        const scores = {};
        for (let i = 1; i <= MAX_WW; i++) scores['ww' + i] = subObj['ww' + i] ?? null;
        for (let i = 1; i <= MAX_PT; i++) scores['pt' + i] = subObj['pt' + i] ?? null;
        scores.qa = subObj.qa ?? null;
        return fetch('/api/grades/save-bulk', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
            body: JSON.stringify({ lrn, subject: sub, scores, grade: subObj.g ?? null, gwa: s.gwa ?? null })
        }).catch(() => { });
    });
    Promise.all(savePromises); // fire & forget

    showMessage("Master Evaluation Saved Successfully!");
    closeGradesModal();
    renderRecords(document.getElementById('content-area'));
}

// --- AI SCANNER ---
function openScanner(mode) {
    currentMode = mode;
    document.getElementById('camera-modal').classList.remove('hidden');
    document.getElementById('camera-title').innerText = mode === 'STUDENT_LIST' ? 'AI Student Registration' : 'AI Grade Extraction';
    document.getElementById('doc-upload').value = '';
    document.getElementById('doc-preview').classList.add('hidden');
    document.getElementById('doc-placeholder').classList.remove('hidden');
    document.getElementById('process-btn').disabled = true;
    document.getElementById('processing-status').classList.add('hidden');

    let hint = mode === 'STUDENT_LIST' ? 'Upload Class List Image' : 'Upload Overall Class Record';
    if (mode === 'CLASS_RECORD' && currentSubjectView) hint = `Upload ${currentSubjectView} Details Record`;
    document.getElementById('camera-hint').innerText = hint;
}

function closeCameraModal() { document.getElementById('camera-modal').classList.add('hidden'); }

function handleDocPreview(input) {
    if (input.files && input.files[0]) {
        const reader = new FileReader();
        reader.onload = function (e) {
            const img = new Image();
            img.onload = function () {
                const cvs = document.getElementById('canvas-tool');
                const ctx = cvs.getContext('2d');
                const SCALE = 1024;
                let w = img.width, h = img.height;
                if (w > h) { if (w > SCALE) { h *= SCALE / w; w = SCALE; } }
                else { if (h > SCALE) { w *= SCALE / h; h = SCALE; } }
                cvs.width = w; cvs.height = h;
                ctx.drawImage(img, 0, 0, w, h);
                base64Image = cvs.toDataURL('image/jpeg', 0.8);
                document.getElementById('doc-preview').src = base64Image;
                document.getElementById('doc-preview').classList.remove('hidden');
                document.getElementById('doc-placeholder').classList.add('hidden');
                document.getElementById('process-btn').disabled = false;
            };
            img.src = e.target.result;
        };
        reader.readAsDataURL(input.files[0]);
    }
}

async function processAI() {
    document.getElementById('process-btn').disabled = true;
    document.getElementById('processing-status').classList.remove('hidden');

    let prompt = "";
    const subjectScope = currentUser.role === 'teacher' ? `for ${currentUser.subject} only` : `for all subjects (${coreSubjects.join(', ')})`;

    if (currentMode === 'STUDENT_LIST') {
        prompt = "Extract student names from this list. Format as JSON array of objects: {name: 'Last, First M.', lrn: 'unique_random_8_digits', section: 'Detected'}";
    } else if (currentMode === 'CLASS_RECORD' && currentSubjectView) {
        prompt = `Extract student names and their ${currentSubjectView} breakdown scores: Quiz 1-5 (ww1, ww2, ww3, ww4, ww5), Task 1-5 (pt1, pt2, pt3, pt4, pt5), Exam (qa). Format as JSON array: {name: 'Student Name', ww1: number, ww2: number, pt1: number, qa: number}`;
    } else {
        prompt = `Extract student names, their individual subject grades ${subjectScope}, and ATTENDANCE from this class record image. Format as JSON array: {name: 'Student Name', subjects: [{n:'Math', g:90}, ...], attendance: number}`;
    }

    try {
        const res = await callGemini(prompt, base64Image);
        const data = JSON.parse(res.replace(/```json|```/g, '').trim());

        if (currentMode === 'STUDENT_LIST') {
            data.forEach(x => students.push({ ...x, gwa: 0, attendance: 0, subjects: [] }));
            logActivity(`AI registered ${data.length} new students via list scan.`);
            showMessage(`AI detected and added ${data.length} student profiles.`);
            navigate('add-student');
        } else if (currentMode === 'CLASS_RECORD' && currentSubjectView) {
            let count = 0;
            data.forEach(item => {
                const s = students.find(x => x.name.toLowerCase().includes(item.name.toLowerCase().split(',')[0]));
                if (s) {
                    let subObj = s.subjects.find(x => x.n === currentSubjectView);
                    if (!subObj) { subObj = { n: currentSubjectView }; s.subjects.push(subObj); }

                    for (let i = 1; i <= MAX_WW; i++) if (item['ww' + i]) subObj['ww' + i] = item['ww' + i];
                    for (let i = 1; i <= MAX_PT; i++) if (item['pt' + i]) subObj['pt' + i] = item['pt' + i];
                    if (item.qa) subObj.qa = item.qa;

                    recalcStudentSubject(s, currentSubjectView);
                    computeStudentGWA(s);
                    count++;
                }
            });
            logActivity(`AI extracted ${currentSubjectView} detailed raw grades for ${count} students.`);
            showMessage(`AI updated detailed raw records for ${count} students in ${currentSubjectView}.`);
            renderRecords(document.getElementById('content-area'));
        } else {
            let count = 0;
            data.forEach(item => {
                const s = students.find(x => x.name.toLowerCase().includes(item.name.toLowerCase().split(',')[0]));
                if (s) {
                    if (item.subjects) {
                        item.subjects.forEach(newSub => {
                            let subObj = s.subjects.find(x => x.n === newSub.n);
                            if (subObj) subObj.g = newSub.g;
                            else s.subjects.push({ n: newSub.n, g: newSub.g });
                        });
                    }
                    s.attendance = item.attendance || s.attendance;
                    computeStudentGWA(s);
                    count++;
                }
            });
            logActivity(`AI extracted master grades for ${count} students.`);
            showMessage(`AI extracted master records for ${count} students.`);
            renderRecords(document.getElementById('content-area'));
        }
        closeCameraModal();
    } catch (e) {
        showMessage("AI failed to read document. Please ensure high image quality.", true);
        document.getElementById('process-btn').disabled = false;
        document.getElementById('processing-status').classList.add('hidden');
    }
}

// --- STUDENT QR VIEWER ---
let html5QrCode;

function startCameraScanner() {
    document.getElementById('qr-entry-zone').classList.add('hidden');
    document.getElementById('qr-reader').classList.remove('hidden');
    document.getElementById('stop-scan-btn').classList.remove('hidden');

    html5QrCode = new Html5Qrcode("qr-reader");
    html5QrCode.start(
        { facingMode: "environment" },
        { fps: 10, qrbox: { width: 250, height: 250 } },
        (decodedText) => {
            stopCameraScanner();
            handleScannedLRN(decodedText);
        },
        (errorMessage) => {
            // Ignore background scan errors
        }
    ).catch((err) => {
        showMessage("Camera access denied or not available.", true);
        stopCameraScanner();
    });
}

function stopCameraScanner() {
    if (html5QrCode) {
        html5QrCode.stop().then(() => {
            html5QrCode.clear();
        }).catch(err => console.log(err));
    }
    document.getElementById('qr-reader').classList.add('hidden');
    document.getElementById('qr-entry-zone').classList.remove('hidden');
    document.getElementById('stop-scan-btn').classList.add('hidden');
}

function triggerQrFile() {
    stopCameraScanner();
    document.getElementById('qr-input').click();
}

function handleQrScan(input) {
    if (input.files && input.files[0]) {
        const file = input.files[0];
        document.getElementById('qr-loading').classList.remove('hidden');

        const fileQrCode = new Html5Qrcode("qr-reader");
        fileQrCode.scanFile(file, true)
            .then(decodedText => {
                document.getElementById('qr-loading').classList.add('hidden');
                handleScannedLRN(decodedText);
            })
            .catch(err => {
                document.getElementById('qr-loading').classList.add('hidden');
                showMessage("Could not detect a QR Code in the image.", true);
            });

        input.value = '';
    }
}

function handleScannedLRN(lrn) {
    const s = students.find(x => x.lrn === lrn);
    if (s) {
        showMessage(`Accessing records for: ${s.name}`);
        showReport(s);
    } else {
        showMessage(`No records found for LRN: ${lrn}`, true);
    }
}

function showReport(s) {
    const modal = document.getElementById('report-modal');
    const content = document.getElementById('report-content');

    const subs = s.subjects && s.subjects.length > 0 ? s.subjects : coreSubjects.map(sub => ({ n: sub, g: null }));

    content.innerHTML = `
        <div class="hidden print:block text-center mb-6 border-b-2 border-black pb-2">
            <h2 class="text-xl font-bold text-black uppercase">City National High School</h2>
            <p class="text-xs text-black">Student Academic Performance Report</p>
        </div>

        <div class="flex justify-between items-start border-b-2 border-gray-100 print-border pb-4 mb-6">
            <div>
                <h3 class="text-2xl font-bold text-gray-900 print-text-black">${s.name}</h3>
                <p class="text-sm text-gray-500 font-mono print-text-black">LRN: ${s.lrn} | Section: ${s.section}</p>
            </div>
            <div class="text-right flex flex-col items-end gap-2">
                <div id="qr-container" class="p-2 bg-white border border-gray-200 rounded-lg shadow-sm print:shadow-none print-border flex justify-center items-center bg-white" title="Student QR Identity"></div>
                <div class="text-right mt-1">
                    <p class="text-[10px] text-gray-400 font-bold uppercase print-text-black">General Average</p>
                    <p class="text-4xl font-bold text-primary print-text-black">${s.gwa || '--'}</p>
                </div>
            </div>
        </div>

        <div class="grid grid-cols-1 gap-3">
            ${subs.map(sub => `
                <div class="flex justify-between items-center p-3 bg-gray-50 rounded-lg print:bg-transparent print:border-b print:border-gray-200">
                    <span class="text-sm font-medium text-gray-700 print-text-black">${sub.n}</span>
                    <span class="font-bold print-text-black ${sub.g && sub.g < 75 ? 'text-red-500' : 'text-gray-900'}">${sub.g || 'Pending'}</span>
                </div>
            `).join('')}
        </div>

        <div class="mt-8 flex justify-between items-center text-[10px] text-gray-400 font-bold uppercase tracking-wider print-text-black">
            <span>Attendance: ${s.attendance > 0 ? s.attendance + '%' : 'Pending'}</span>
            <span>System Generated Record</span>
        </div>

        <div class="mt-8 flex justify-end gap-3 no-print">
            <button onclick="window.print()" class="px-5 py-2.5 bg-blue-600 text-white rounded-lg text-xs font-bold hover:bg-blue-700 transition shadow-sm flex items-center gap-2">
                <i class="fas fa-print"></i> Print Report / Save as PDF
            </button>
            <button onclick="closeReport()" class="px-5 py-2.5 bg-gray-200 text-gray-800 rounded-lg text-xs font-bold hover:bg-gray-300 transition shadow-sm">
                Close
            </button>
        </div>
    `;
    modal.classList.remove('hidden');

    document.getElementById("qr-container").innerHTML = "";
    new QRCode(document.getElementById("qr-container"), {
        text: s.lrn,
        width: 70,
        height: 70,
        colorDark: "#166534",
        colorLight: "#ffffff",
        correctLevel: QRCode.CorrectLevel.H
    });
}

function closeReport() { document.getElementById('report-modal').classList.add('hidden'); }

// PURE ID CARD MODAL
function showQRModal(lrn) {
    const s = students.find(x => x.lrn === lrn);
    if (!s) return;
    const modal = document.getElementById('id-card-modal');
    const content = document.getElementById('id-card-content');

    content.innerHTML = `
        <div class="border-2 border-gray-800 p-6 rounded-xl text-center bg-white shadow-sm w-full max-w-xs print:border-black print:p-4">
            <h2 class="text-xl font-bold text-black uppercase mb-1">CNHS Student ID</h2>
            <div class="w-full h-px bg-gray-300 mb-4 print:bg-black"></div>
            <div class="flex justify-center mb-4">
                <div id="pure-qr-container" class="p-2 border-4 border-primary rounded-lg bg-white print:border-black" title="Student QR Identity"></div>
            </div>
            <h3 class="text-2xl font-bold text-gray-900 print-text-black mb-1">${s.name}</h3>
            <p class="text-sm text-gray-600 font-mono print-text-black mb-1">LRN: ${s.lrn}</p>
            <p class="text-sm text-gray-600 print-text-black">Section: <span class="font-bold text-gray-800 print-text-black">${s.section}</span></p>
            <p class="text-xs text-gray-500 mt-4 print-text-black italic">Scan to view academic performance</p>
        </div>
        <div class="mt-6 flex justify-center gap-3 no-print w-full">
            <button onclick="window.print()" class="w-full px-5 py-3 bg-blue-600 text-white rounded-lg text-sm font-bold hover:bg-blue-700 transition shadow-sm flex justify-center items-center gap-2">
                <i class="fas fa-print"></i> Print ID Card
            </button>
        </div>
    `;
    modal.classList.remove('hidden');

    document.getElementById("pure-qr-container").innerHTML = "";
    new QRCode(document.getElementById("pure-qr-container"), {
        text: s.lrn,
        width: 140,
        height: 140,
        colorDark: "#166534",
        colorLight: "#ffffff",
        correctLevel: QRCode.CorrectLevel.H
    });
}

function closeQRModal() { document.getElementById('id-card-modal').classList.add('hidden'); }

// --- GEMINI API ---
async function callGemini(prompt, b64) {
    // API Key explicitly supports Gemini 2.x
    const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${API_KEY}`;
    const parts = [{ text: prompt }];
    if (b64) parts.push({ inlineData: { mimeType: "image/jpeg", data: b64.split(',')[1] } });

    const response = await fetch(url, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ contents: [{ parts: parts }] }) });
    const result = await response.json();
    return result.candidates[0].content.parts[0].text;
}

// --- CHATBOT ---
function toggleChat() { document.getElementById('chat-window').classList.toggle('hidden'); }

async function sendChat() {
    const input = document.getElementById('chat-input');
    const msg = input.value.trim();
    if (!msg) return;

    const area = document.getElementById('chat-messages');
    area.innerHTML += `<div class="chat-bubble chat-user">${msg}</div>`;
    input.value = '';
    area.scrollTop = area.scrollHeight;

    // Show typing indicator
    const typingId = 'typing-' + Date.now();
    area.innerHTML += `<div class="chat-bubble chat-ai" id="${typingId}" style="opacity:0.6;">⏳ AI is thinking...</div>`;
    area.scrollTop = area.scrollHeight;

    try {
        const shortContext = students.slice(0, 10).map(s => ({
            n: s.name, sec: s.section, gwa: s.gwa, cls: s.classification
        }));

        const response = await fetch('/api/chat', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
            body: JSON.stringify({
                message: msg,
                context: JSON.stringify(shortContext) // Dramatically reduced token usage
            })
        });

        // Remove typing indicator
        document.getElementById(typingId)?.remove();

        if (!response.ok) {
            const err = await response.json().catch(() => ({}));
            area.innerHTML += `<div class="chat-bubble chat-ai" style="color:#ef4444;">❌ ${err.error || 'AI error. Please try again.'}</div>`;
        } else {
            const data = await response.json();
            const reply = data.reply || 'Sorry, no response.';
            area.innerHTML += `<div class="chat-bubble chat-ai">${marked.parse(reply)}</div>`;
        }
    } catch (e) {
        document.getElementById(typingId)?.remove();
        area.innerHTML += `<div class="chat-bubble chat-ai" style="color:#ef4444;">❌ Network error. Make sure the app server is running.</div>`;
    }

    area.scrollTop = area.scrollHeight;
}

function toggleSidebar() {
    document.getElementById('sidebar').classList.toggle('mobile-hidden');

    const overlay = document.getElementById('mobile-overlay');
    if (overlay) {
        if (overlay.classList.contains('hidden')) {
            overlay.classList.remove('hidden');
            overlay.classList.remove('pointer-events-none');
            // Slight delay for transition to trigger
            setTimeout(() => overlay.classList.remove('opacity-0'), 10);
        } else {
            overlay.classList.add('opacity-0');
            overlay.classList.add('pointer-events-none');
            setTimeout(() => overlay.classList.add('hidden'), 300);
        }
    }
}

// Session Recovery on Page Load
document.addEventListener('DOMContentLoaded', async () => {
    const activeSession = sessionStorage.getItem('cnhs_session');
    if (activeSession) {
        try {
            const savedUser = JSON.parse(activeSession);

            // Mask login screen, show app
            document.getElementById('login-screen').classList.add('hidden');
            document.getElementById('app-container').classList.remove('hidden');

            // Load backend data
            await initAppData();

            // Migrate session data into the running State
            currentUser.role = savedUser.role;
            currentUser.name = savedUser.name;
            currentUser.id = savedUser.id;
            currentUser.subject = savedUser.subject;

            // Reapply Admin privileges if necessary
            if (currentUser.role === 'admin') {
                document.getElementById('nav-manage-teachers').classList.remove('hidden');
                document.getElementById('nav-logs').classList.remove('hidden');
            }

            // Reconstruct User Profile UI
            document.getElementById('role-tag').innerText = currentUser.role.toUpperCase();
            document.getElementById('user-display-name').innerText = currentUser.name;
            document.getElementById('user-display-role').innerText = currentUser.role;
            document.getElementById('user-display-avatar').src = `https://ui-avatars.com/api/?name=${currentUser.name}&background=166534&color=fff&font-size=0.4`;

            navigate('dashboard');
        } catch (e) {
            console.error("Session recovery failed", e);
            sessionStorage.removeItem('cnhs_session');
        }
    }
});
