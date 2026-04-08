/**
 * student/dashboard.js — Student Portal Logic
 */

document.addEventListener('DOMContentLoaded', () => {
    initStudentDashboard();
});

function getStudentSession() {
    const session = sessionStorage.getItem('cnhs_student_session');
    if (!session) return null;
    try {
        return JSON.parse(session);
    } catch {
        return null;
    }
}

function logoutStudent() {
    sessionStorage.removeItem('cnhs_student_session');
    window.location.href = '/login/student';
}

window.studentData = null;
window.activeQuarter = null; // null means 'All Quarters' or default to 1

async function initStudentDashboard() {
    const student = getStudentSession();
    if (!student || student.role !== 'student') {
        window.location.href = '/login/student';
        return;
    }

    // Populate Header
    document.getElementById('nav-student-name').innerText = student.name;
    document.getElementById('nav-student-lrn').innerText = student.lrn;
    
    document.getElementById('student-name').innerText = student.name;
    document.getElementById('student-lrn').innerText = student.lrn;
    
    const unameEl = document.getElementById('student-username');
    if(unameEl) unameEl.innerText = student.lrn;
    
    // Set Avatar securely
    const avatarUrl = student.profile_picture || `https://ui-avatars.com/api/?name=${encodeURIComponent(student.name)}&background=166534&color=fff&font-size=0.4&bold=true`;
    document.getElementById('profile-avatar').src = avatarUrl;
    
    if (student.has_qr_pin) {
        document.getElementById('pin-status-text').innerText = 'Change QR PIN';
        document.getElementById('pin-status-text').previousElementSibling.className = 'fas fa-fingerprint text-green-500';
    }

    try {
        // Fetch specific student subjects and compute overall display
        const res = await fetch(`/api/students/${student.lrn}/subjects?with_name=1`, {
            headers: { 'Accept': 'application/json' }
        });

        if (!res.ok) throw new Error("Could not fetch academic records.");
        
        window.studentData = await res.json();
        
        // Populate Enrollment Selector Menu
        const selector = document.getElementById('enrollment-selector');
        let history = window.studentData.enrollment_history || [];
        
        // Check if there's an active current year enrollment not explicitly in history (from primary student table)
        if (history.length === 0 && window.studentData.section) {
            history.push({
                school_year: window.currentRecordSchoolYear || '2025-2026',
                section: window.studentData.section,
                adviser: window.studentData.adviser || 'Pending Assignment'
            });
        }
        
        // Also ensure any subjects we fetched have their school years in the dropdown, even if not explicitly in enrollment array
        const subjectYears = new Set(window.studentData.subjects.map(s => s.school_year).filter(Boolean));
        subjectYears.forEach(y => {
            if (!history.find(h => h.school_year === y)) {
                history.push({ school_year: y, section: 'Unknown Section', adviser: 'Pending Assignment' });
            }
        });

        // Sort history descending by year (basic string sort works for YYYY-YYYY format)
        history.sort((a, b) => b.school_year.localeCompare(a.school_year));
        
        if (history.length > 0) {
            selector.innerHTML = history.map((h, i) => `<option value="${i}">SY ${h.school_year} — ${h.section}</option>`).join('');
            selector.classList.remove('hidden');
        } else {
            selector.classList.add('hidden');
            document.getElementById('student-section').innerText = 'Unassigned';
            document.getElementById('student-adviser').innerText = 'Pending Assignment';
        }

        renderEnrolledGrades();

    } catch (e) {
        console.error("Dashboard init error:", e);
        document.getElementById('grades-table-body').innerHTML = `<tr><td colspan="5" class="py-8 text-center text-sm font-bold text-red-500 bg-red-50">Error pulling records: ${e.message}</td></tr>`;
    } finally {
        calculateQuarterAverages();
        // Default to the current quarter or 1
        const latestQ = window.studentData?.subjects?.length ? Math.max(...window.studentData.subjects.map(s => parseInt(s.quarter))) : 1;
        setActiveQuarter(latestQ);

        document.getElementById('loading-spinner').classList.add('hidden');
        document.getElementById('dashboard-content').classList.remove('hidden');
    }
}

function calculateQuarterAverages() {
    if (!window.studentData || !window.studentData.subjects) return;
    
    for (let q = 1; q <= 4; q++) {
        const qSubjects = window.studentData.subjects.filter(s => parseInt(s.quarter) === q && s.g);
        const avgEl = document.getElementById(`q${q}-avg`);
        
        if (qSubjects.length > 0) {
            const sum = qSubjects.reduce((acc, s) => acc + parseFloat(s.g), 0);
            const avg = (sum / qSubjects.length).toFixed(2);
            if (avgEl) avgEl.innerText = avg;
        } else {
            if (avgEl) avgEl.innerText = '--';
        }
    }
}

function setActiveQuarter(q) {
    window.activeQuarter = q;
    
    // Update Card UI
    document.querySelectorAll('.q-card').forEach(card => {
        card.classList.remove('border-primary', 'bg-primary/5', 'shadow-md');
        card.classList.add('border-transparent', 'bg-white', 'shadow-sm');
        card.querySelector('.q-card-icon').classList.remove('bg-primary', 'text-white');
        card.querySelector('.q-card-icon').classList.add('bg-gray-50', 'text-gray-400');
        card.querySelector('.q-card-active-indicator').classList.add('hidden');
        card.querySelector('.q-avg-container').classList.remove('bg-primary/10', 'text-primary');
        card.querySelector('.q-avg-container').classList.add('bg-gray-50', 'text-gray-400');
    });

    const activeCard = document.getElementById(`q-card-${q}`);
    if (activeCard) {
        activeCard.classList.remove('border-transparent', 'bg-white', 'shadow-sm');
        activeCard.classList.add('border-primary', 'bg-primary/5', 'shadow-md');
        activeCard.querySelector('.q-card-icon').classList.remove('bg-gray-50', 'text-gray-400');
        activeCard.querySelector('.q-card-icon').classList.add('bg-primary', 'text-white');
        activeCard.querySelector('.q-card-active-indicator').classList.remove('hidden');
        activeCard.querySelector('.q-avg-container').classList.remove('bg-gray-50', 'text-gray-400');
        activeCard.querySelector('.q-avg-container').classList.add('bg-primary/10', 'text-primary');
    }

    // Update Table Label
    const labels = {1: '1ST QUARTER', 2: '2ND QUARTER', 3: '3RD QUARTER', 4: '4TH QUARTER'};
    document.getElementById('active-quarter-label').innerText = labels[q] || 'SUBJECT GRADES';

    renderEnrolledGrades();
}

async function renderEnrolledGrades() {
    if (!window.studentData) return;
    
    const selector = document.getElementById('enrollment-selector');
    const history = window.studentData.enrollment_history || [];
    
    let currentEnrollment = null;
    if (selector && selector.value !== '') {
        currentEnrollment = history[selector.value];
    } else if (history.length > 0) {
        currentEnrollment = history[0]; // Default to most recent
    }

    if (currentEnrollment) {
        document.getElementById('student-section').innerText = currentEnrollment.section || 'Unassigned';
        document.getElementById('student-adviser').innerText = currentEnrollment.adviser || 'Pending Assignment';
    } else {
        document.getElementById('student-section').innerText = window.studentData.section || 'Unassigned';
        document.getElementById('student-adviser').innerText = window.studentData.adviser || 'Pending Assignment';
    }

    const syTarget = currentEnrollment ? currentEnrollment.school_year : null;
    
    // Filter subjects by the selected school year
    let subjects = window.studentData.subjects.filter(s => !syTarget || s.school_year === syTarget);
    
    // Filter by Selected Quarter (from Card)
    const selectedQuarter = window.activeQuarter || 'all';
    
    if (selectedQuarter !== 'all') {
        subjects = subjects.filter(s => s.quarter == selectedQuarter);
    }
    
    // Render Grades Table
    const tbody = document.getElementById('grades-table-body');
    tbody.innerHTML = '';

    if (subjects.length === 0) {
        tbody.innerHTML = `<tr><td colspan="5" class="py-8 text-center text-sm font-bold text-gray-400"><i class="fas fa-folder-open mb-2 text-2xl text-gray-300 block"></i>No grades encoded for this school year yet.</td></tr>`;
    } else {
        subjects.forEach(sub => {
            const tr = document.createElement('tr');
            tr.className = 'group hover:bg-gray-50/50 transition-colors border-b border-gray-50 last:border-0';
            
            let gradeHtml = '--';
            if (sub.g) {
                const gradeVal = parseFloat(sub.g);
                if (gradeVal >= 90) gradeHtml = `<div class="inline-flex flex-col items-center"><span class="bg-primary/10 text-primary font-black px-3 py-1 rounded-lg text-sm border border-primary/20">${gradeVal}</span></div>`;
                else if (gradeVal >= 75) gradeHtml = `<div class="inline-flex flex-col items-center"><span class="bg-blue-50 text-blue-700 font-bold px-3 py-1 rounded-lg text-sm border border-blue-100">${gradeVal}</span></div>`;
                else gradeHtml = `<div class="inline-flex flex-col items-center"><span class="bg-red-50 text-red-600 font-bold px-3 py-1 rounded-lg text-sm border border-red-100">${gradeVal}</span></div>`;
            }

            let wwAvg = '--', ptAvg = '--', qaAvg = '--';
            let wwSum = 0, wwCount = 0;
            for (let i=1; i<=10; i++) { if (sub['ww'+i]) { wwSum += parseFloat(sub['ww'+i]); wwCount++; } }
            if (wwCount > 0) wwAvg = wwSum.toFixed(1);

            let ptSum = 0, ptCount = 0;
            for (let i=1; i<=10; i++) { if (sub['pt'+i]) { ptSum += parseFloat(sub['pt'+i]); ptCount++; } }
            if (ptCount > 0) ptAvg = ptSum.toFixed(1);

            if (sub['qa']) qaAvg = parseFloat(sub['qa']).toFixed(1);

            tr.innerHTML = `
                <td class="py-5 px-8">
                    <div class="flex items-center gap-4">
                        <div class="w-10 h-10 rounded-xl bg-gray-50 flex items-center justify-center text-gray-400 group-hover:bg-primary/5 group-hover:text-primary transition-all">
                            <i class="fas fa-book text-sm"></i>
                        </div>
                        <div>
                            <p class="text-sm font-black text-gray-800 tracking-tight">${sub.n}</p>
                            <p class="text-[10px] font-bold text-gray-400 uppercase tracking-widest mt-0.5">SY ${sub.school_year}</p>
                        </div>
                    </div>
                </td>
                <td class="py-5 px-6 text-center text-sm font-bold text-gray-600">${wwAvg}</td>
                <td class="py-5 px-6 text-center text-sm font-bold text-gray-600">${ptAvg}</td>
                <td class="py-5 px-6 text-center text-sm font-bold text-gray-600">${qaAvg}</td>
                <td class="py-5 px-8 text-center">${gradeHtml}</td>
            `;
            tbody.appendChild(tr);
        });
    }

    // Overview Stats relative to selected year
    let totalGrade = 0;
    let countedGrades = 0;
    subjects.forEach(s => {
        if (s.g) {
            totalGrade += parseFloat(s.g);
            countedGrades++;
        }
    });

    const gwaVal = countedGrades > 0 ? (totalGrade / countedGrades) : 0;
    const gwaBadge = document.getElementById('honor-badge');
    
    if (gwaVal > 0) {
        document.getElementById('student-gwa').innerText = gwaVal.toFixed(2);
        
        // Honors Logic
        if (gwaVal >= 98) { gwaBadge.innerText = "With Highest Honors"; gwaBadge.classList.remove('hidden'); }
        else if (gwaVal >= 95) { gwaBadge.innerText = "With High Honors"; gwaBadge.classList.remove('hidden'); }
        else if (gwaVal >= 90) { gwaBadge.innerText = "With Honors"; gwaBadge.classList.remove('hidden'); }
        else { gwaBadge.classList.add('hidden'); }
    } else {
        document.getElementById('student-gwa').innerText = '--';
        gwaBadge.classList.add('hidden');
    }

    // Risk Assessment
    let risk = 'Pending';
    const failingSubjects = subjects.filter(s => s.g && parseFloat(s.g) < 75).length;
    if (countedGrades > 0) {
        if (failingSubjects >= 3) risk = 'High';
        else if (failingSubjects > 0) risk = 'Moderate';
        else risk = 'Low';
    }

    const riskEl = document.getElementById('student-risk');
    const riskIcon = document.getElementById('risk-icon');
    
    riskEl.innerText = risk;
    riskIcon.className = 'w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center text-gray-400';
    riskEl.classList.remove('text-green-600', 'text-yellow-600', 'text-red-500');
    
    if (risk === 'Low') {
        riskEl.classList.add('text-green-600');
        riskIcon.className = 'w-10 h-10 rounded-full bg-green-50 flex items-center justify-center text-green-500';
        riskIcon.innerHTML = '<i class="fas fa-check-circle"></i>';
    } else if (risk === 'Moderate') {
        riskEl.classList.add('text-yellow-600');
        riskIcon.className = 'w-10 h-10 rounded-full bg-yellow-50 flex items-center justify-center text-yellow-500';
        riskIcon.innerHTML = '<i class="fas fa-exclamation-circle"></i>';
    } else if (risk === 'High') {
        riskEl.classList.add('text-red-500');
        riskIcon.className = 'w-10 h-10 rounded-full bg-red-50 flex items-center justify-center text-red-500 animate-pulse';
        riskIcon.innerHTML = '<i class="fas fa-exclamation-triangle"></i>';
    }

    // Attendance (Calculate relative to selected records if available)
    const session = getStudentSession();
    const lrn = session ? session.lrn : null;
    if (lrn) {
        fetch(`/api/attendance/${lrn}`)
            .then(r => r.ok ? r.json() : [])
            .then(attData => {
                let totalMarks = 0;
                let presentMarks = 0;
                
                // Filter attendance to the targeted school year if provided
                const yearlyAtt = syTarget ? attData.filter(a => a.school_year === syTarget) : attData;

                yearlyAtt.forEach(row => {
                    if (row.marks && Array.isArray(row.marks)) {
                        row.marks.forEach(m => {
                            if (m === '/') presentMarks++;
                            if (m !== '') totalMarks++;
                        });
                    }
                });
                
                if (totalMarks > 0) {
                    const pct = ((presentMarks / totalMarks) * 100).toFixed(0);
                    document.getElementById('student-attendance').innerText = pct;
                } else {
                    document.getElementById('student-attendance').innerText = "--"; 
                }
            })
            .catch(() => {
                document.getElementById('student-attendance').innerText = "--";
            });
    }
}

// --- Profile Upload Logic ---
function triggerProfileUpload() {
    document.getElementById('profile-upload-input').click();
}

async function handleProfileUpload(input) {
    if (!input.files || !input.files[0]) return;

    const file = input.files[0];
    const imgElement = document.getElementById('profile-avatar');
    const originalSrc = imgElement.src;
    imgElement.style.opacity = '0.5';

    try {
        const compressedBlob = await compressImage(file, 400);
        
        const formData = new FormData();
        const student = getStudentSession();
        formData.append('id', student.id);
        formData.append('image', compressedBlob, 'profile.webp');

        const res = await fetch('/api/students/upload-profile', {
            method: 'POST',
            headers: { 'Accept': 'application/json' },
            body: formData
        });

        const data = await res.json();
        if (!res.ok) throw new Error(data.error || 'Upload failed.');

        // Success
        student.profile_picture = data.path;
        sessionStorage.setItem('cnhs_student_session', JSON.stringify(student));

        imgElement.src = data.path;
        imgElement.style.opacity = '1';

    } catch (e) {
        console.error(e);
        imgElement.src = originalSrc;
        imgElement.style.opacity = '1';
        alert("Profile update failed: " + e.message);
    }
}

function compressImage(file, maxSize) {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onload = event => {
            const img = new Image();
            img.src = event.target.result;
            img.onload = () => {
                const canvas = document.createElement('canvas');
                let width = img.width;
                let height = img.height;

                if (width > height) {
                    if (width > maxSize) { height *= maxSize / width; width = maxSize; }
                } else {
                    if (height > maxSize) { width *= maxSize / height; height = maxSize; }
                }

                canvas.width = width; canvas.height = height;
                const ctx = canvas.getContext('2d');
                ctx.drawImage(img, 0, 0, width, height);

                canvas.toBlob(blob => resolve(blob), 'image/webp', 0.8);
            };
            img.onerror = () => reject(new Error("Failed to read image."));
        };
        reader.onerror = () => reject(new Error("File reader error."));
    });
}

// --- QR PIN Logic ---
function openQrPinModal() {
    document.getElementById('qr-pin-input').value = '';
    document.getElementById('qr-pin-error').classList.add('hidden');
    document.getElementById('qr-pin-modal').classList.remove('hidden');
    document.getElementById('qr-pin-input').focus();
}

function closeQrPinModal() {
    document.getElementById('qr-pin-modal').classList.add('hidden');
}

async function saveQrPin() {
    const pin = document.getElementById('qr-pin-input').value;
    const err = document.getElementById('qr-pin-error');
    err.classList.add('hidden');

    if (pin.length !== 6 || !/^\d+$/.test(pin)) {
        err.innerText = "PIN must be exactly 6 numeric digits.";
        err.classList.remove('hidden');
        return;
    }

    const btn = document.getElementById('qr-pin-save-btn');
    const ogText = btn.innerText;
    btn.innerText = "Saving...";
    btn.disabled = true;

    try {
        const student = getStudentSession();
        const res = await fetch('/api/students/setup-qr-pin', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Accept': 'application/json'
            },
            body: JSON.stringify({ lrn: student.lrn, pin: pin })
        });
        
        let data;
        try {
            data = await res.json();
        } catch (je) {
            throw new Error("Server error: Unable to parse response.");
        }

        if(!res.ok) {
            console.error("PIN Save Error Data:", data);
            throw new Error(data.error || data.message || "Failed to save PIN.");
        }
        
        // Update session state
        student.has_qr_pin = true;
        sessionStorage.setItem('cnhs_student_session', JSON.stringify(student));
        
        document.getElementById('pin-status-text').innerText = 'Change QR PIN';
        document.getElementById('pin-status-text').previousElementSibling.className = 'fas fa-fingerprint text-green-500';
        
        closeQrPinModal();
        
    } catch(e) {
        err.innerText = e.message;
        err.classList.remove('hidden');
    } finally {
        btn.innerText = ogText;
        btn.disabled = false;
    }
}

