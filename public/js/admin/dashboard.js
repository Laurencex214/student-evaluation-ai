/**
 * admin/dashboard.js — Dashboard page render functions
 */

let dashboardCharts = [];

function renderDashboard(container) {
    const evaluated = students.filter(s => s.gwa > 0).length;
    const atRisk = students.filter(s => s.gwa > 0 && s.gwa < 75).length;
    const avgAttendance = students.length > 0 ? Math.round(students.reduce((a, b) => a + b.attendance, 0) / students.length) : 0;

    container.innerHTML = `
        <div class="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8 animate-fade-in">
            <div onclick="setFilter('total')" id="card-total" class="stat-card bg-white p-6 rounded-2xl shadow-sm border-b-4 border-primary cursor-pointer hover:shadow-xl hover:-translate-y-1 active:scale-[0.98] transition-all duration-300">
                <p class="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Total Students</p>
                <h3 class="text-3xl font-bold text-gray-800">${students.length}</h3>
            </div>
            <div onclick="setFilter('attendance')" id="card-attendance" class="stat-card bg-white p-6 rounded-2xl shadow-sm border-b-4 border-blue-500 cursor-pointer hover:shadow-xl hover:-translate-y-1 active:scale-[0.98] transition-all duration-300">
                <p class="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Avg Attendance</p>
                <h3 class="text-3xl font-bold text-gray-800">${avgAttendance}%</h3>
            </div>
            <div onclick="setFilter('risk')" id="card-risk" class="stat-card bg-white p-6 rounded-2xl shadow-sm border-b-4 border-red-500 cursor-pointer hover:shadow-xl hover:-translate-y-1 active:scale-[0.98] transition-all duration-300">
                <p class="text-[10px] font-bold text-gray-400 uppercase tracking-widest">At-Risk Student</p>
                <h3 class="text-3xl font-bold text-red-600">${atRisk}</h3>
            </div>
            <div onclick="setFilter('eval')" id="card-eval" class="stat-card bg-white p-6 rounded-2xl shadow-sm border-b-4 border-accent cursor-pointer hover:shadow-xl hover:-translate-y-1 active:scale-[0.98] transition-all duration-300">
                <p class="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Evaluation Done</p>
                <h3 class="text-3xl font-bold text-gray-800">${evaluated}</h3>
            </div>
        </div>

        </div>

        <div class="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8 animate-slide-up" style="animation-delay: 0.1s;">
            <!-- Chart 1: Grade Distribution -->
            <div class="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex flex-col">
                <h3 class="text-xs font-bold text-gray-800 mb-4 uppercase tracking-widest"><i class="fas fa-chart-pie text-accent mr-2"></i>Grade Distribution</h3>
                <div class="flex-1 relative min-h-[200px]">
                    <canvas id="gradeDistributionChart"></canvas>
                </div>
            </div>
            
            <!-- Chart 2: Section Performance -->
            <div class="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex flex-col">
                <h3 class="text-xs font-bold text-gray-800 mb-4 uppercase tracking-widest"><i class="fas fa-chart-bar text-blue-500 mr-2"></i>Section Average (GWA)</h3>
                <div class="flex-1 relative min-h-[200px]">
                    <canvas id="sectionPerformanceChart"></canvas>
                </div>
            </div>

            <!-- AI Insights Panel -->
            <div class="bg-white p-6 rounded-2xl shadow-sm border-t-4 border-primary flex flex-col relative overflow-hidden">
                <div class="absolute -right-6 -top-6 text-primary opacity-5">
                    <i class="fas fa-robot text-9xl"></i>
                </div>
                <div class="flex justify-between items-center mb-4 relative z-10 w-full">
                    <h3 class="text-xs font-bold text-gray-800 uppercase tracking-widest"><i class="fas fa-brain text-primary mr-2"></i>AI Intelligent Insight</h3>
                    <button onclick="generateDashboardInsights()" id="btn-generate-insights" class="text-[10px] bg-primary text-white px-3 py-1.5 rounded-lg hover:bg-primaryDark transition shadow flex items-center gap-1">
                        <i class="fas fa-magic"></i> Analyze
                    </button>
                </div>
                <div id="ai-insights-content" class="flex-1 text-xs text-gray-600 relative z-10 bg-gray-50 rounded-xl p-4 border border-gray-100 italic flex items-center justify-center">
                    Click "Analyze" to generate an executive AI summary of current student performance.
                </div>
            </div>
        </div>

        <div class="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden animate-slide-up">
            <div class="p-6 border-b flex flex-col xl:flex-row justify-between items-center gap-4 bg-gray-50/50">
                <div class="flex flex-wrap gap-2 justify-center">
                    <button onclick="setFilter('highest')" id="btn-highest" class="filter-btn px-4 py-1.5 rounded-full text-[10px] font-bold border hover:bg-primary hover:text-white transition whitespace-nowrap">HIGHEST HONOR</button>
                    <button onclick="setFilter('high')" id="btn-high" class="filter-btn px-4 py-1.5 rounded-full text-[10px] font-bold border hover:bg-primary hover:text-white transition whitespace-nowrap">HIGH HONOR</button>
                    <button onclick="setFilter('with')" id="btn-with" class="filter-btn px-4 py-1.5 rounded-full text-[10px] font-bold border hover:bg-primary hover:text-white transition whitespace-nowrap">WITH HONOR</button>
                    <button onclick="setFilter('total')" id="btn-total" class="filter-btn px-4 py-1.5 rounded-full text-[10px] font-bold border bg-gray-200 whitespace-nowrap">CLEAR ALL</button>
                </div>
                <div class="relative w-full xl:w-64">
                    <i class="fas fa-search absolute left-3 top-2.5 text-gray-300 text-xs"></i>
                    <input type="text" onkeyup="searchTable(this.value)" placeholder="Search LRN or Name..." class="w-full pl-9 pr-4 py-2 bg-white border border-gray-200 rounded-lg text-xs outline-none focus:border-primary transition">
                </div>
            </div>
            <div class="overflow-x-auto">
                <table class="w-full text-left text-xs">
                    <thead class="bg-white text-gray-400 uppercase font-bold border-b">
                        <tr>
                            <th class="px-6 py-4">LRN</th>
                            <th class="px-6 py-4">Full Name</th>
                            <th class="px-6 py-4">Section</th>
                            <th class="px-6 py-4 hidden xl:table-cell">Adviser</th>
                            <th class="px-6 py-4">GWA</th>
                            <th class="px-6 py-4">Attendance</th>
                            <th class="px-6 py-4">Classification</th>
                            <th class="px-6 py-4">Action</th>
                        </tr>
                    </thead>
                    <tbody id="dash-table-body" class="divide-y divide-gray-50"></tbody>
                </table>
            </div>
        </div>
        </div>
    `;
    refreshTable();
    initDashboardCharts(); // Initialize the dynamic Chart.js visualizations
}

function initDashboardCharts() {
    // Prevent "Canvas is already in use" errors on re-render
    dashboardCharts.forEach(c => c.destroy());
    dashboardCharts = [];

    // 1. Calculate Grade Distribution
    let highest = 0, high = 0, withHonor = 0, regular = 0, failing = 0, noGrades = 0;
    students.forEach(s => {
        if (s.gwa >= 98) highest++;
        else if (s.gwa >= 95) high++;
        else if (s.gwa >= 90) withHonor++;
        else if (s.gwa >= 75) regular++;
        else if (s.gwa > 0 && s.gwa < 75) failing++;
        else noGrades++;
    });

    const distCtx = document.getElementById('gradeDistributionChart');
    if (distCtx) {
        dashboardCharts.push(new Chart(distCtx, {
            type: 'doughnut',
            data: {
                labels: ['Highest Honor', 'High Honor', 'With Honor', 'Regular', 'Failing', 'No Grades'],
                datasets: [{
                    data: [highest, high, withHonor, regular, failing, noGrades],
                    backgroundColor: ['#fef08a', '#e9d5ff', '#bfdbfe', '#f3f4f6', '#fecaca', '#e5e7eb'],
                    borderColor: ['#eab308', '#a855f7', '#3b82f6', '#9ca3af', '#ef4444', '#9ca3af'],
                    borderWidth: 1
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                cutout: '65%',
                plugins: {
                    legend: { position: 'right', labels: { boxWidth: 12, font: { size: 10, family: "'Inter', sans-serif" }, usePointStyle: true } },
                    tooltip: {
                        backgroundColor: 'rgba(17, 24, 39, 0.9)',
                        padding: 12,
                        titleFont: { size: 13, weight: 'bold' },
                        bodyFont: { size: 12 },
                        cornerRadius: 8,
                        displayColors: true
                    }
                },
                animation: { animateScale: true, animateRotate: true, duration: 1500, easing: 'easeOutBounce' },
                hover: { mode: 'index', intersect: false }
            }
        }));
    }

    // 2. Section Performance (Average GWA)
    const sections = {};
    students.forEach(s => {
        if (!sections[s.section]) sections[s.section] = { sum: 0, count: 0 };
        if (s.gwa > 0) {
            sections[s.section].sum += parseFloat(s.gwa);
            sections[s.section].count++;
        }
    });

    const secLabels = [];
    const secData = [];
    for (const [sec, data] of Object.entries(sections)) {
        secLabels.push(sec || 'Unassigned');
        secData.push(data.count > 0 ? (data.sum / data.count).toFixed(2) : 0);
    }

    const perfCtx = document.getElementById('sectionPerformanceChart');
    if (perfCtx) {
        const ctx2d = perfCtx.getContext('2d');
        const gradient = ctx2d.createLinearGradient(0, 0, 0, 300);
        gradient.addColorStop(0, '#10b981'); // Emerald 500
        gradient.addColorStop(1, '#064e3b'); // Emerald 900

        dashboardCharts.push(new Chart(perfCtx, {
            type: 'bar',
            data: {
                labels: secLabels,
                datasets: [{
                    label: 'Average GWA',
                    data: secData,
                    backgroundColor: gradient,
                    borderRadius: 6,
                    borderSkipped: false,
                    barPercentage: 0.6
                }]
            },
            options: {
                responsive: true, maintainAspectRatio: false,
                plugins: {
                    legend: { display: false },
                    tooltip: {
                        backgroundColor: 'rgba(17, 24, 39, 0.9)',
                        padding: 12,
                        titleFont: { size: 13, weight: 'bold' },
                        bodyFont: { size: 12 },
                        cornerRadius: 8,
                        displayColors: false
                    }
                },
                interaction: { mode: 'index', intersect: false },
                scales: {
                    x: { grid: { display: false }, ticks: { font: { size: 10, family: "'Inter', sans-serif" }, color: '#64748b' } },
                    y: { border: { dash: [4, 4] }, grid: { color: '#f1f5f9' }, beginAtZero: true, min: 0, max: 100, ticks: { font: { size: 10, family: "'Inter', sans-serif" }, color: '#64748b', stepSize: 20 } }
                },
                animation: { duration: 1200, easing: 'easeOutQuart' }
            }
        }));
    }
}

async function generateDashboardInsights() {
    const btn = document.getElementById('btn-generate-insights');
    const content = document.getElementById('ai-insights-content');
    if (!btn || !content) return;

    btn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Analyz...';
    btn.disabled = true;
    content.innerHTML = '<div class="text-center w-full text-primary font-bold animate-pulse p-4 rounded-xl"><i class="fas fa-circle-notch fa-spin text-3xl mb-3"></i><br>Generating Intelligent Insights...</div>';

    // Build minimal cohort data Context
    const summaryData = students.map(s => ({ s: s.section, g: s.gwa, a: s.attendance })).filter(s => s.g > 0);
    const prompt = `Act as an expert Academic Data Analyst for the 'AI-Driven Student Evaluation System'. Analyze this student cohort data and provide a concise, 2-to-3 sentence executive summary. Highlight any notable anomalies, strong performing sections, or areas needing pedagogical attention. Keep it highly professional. Do not use markdown styling. Data: ${JSON.stringify(summaryData)}`;

    try {
        const response = await fetch('/api/chat', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
            body: JSON.stringify({ message: prompt, context: "" })
        });

        if (!response.ok) {
            const errData = await response.json().catch(() => ({}));
            throw new Error(errData.error || 'Failed to reach AI');
        }
        const data = await response.json();

        content.innerHTML = `<span class="text-gray-800 font-medium leading-relaxed">"${data.reply}"</span>`;
    } catch (e) {
        content.innerHTML = `<span class="text-red-500"><i class="fas fa-exclamation-triangle mr-2"></i>Error generating insights: ${e.message}</span>`;
    } finally {
        btn.innerHTML = '<i class="fas fa-magic"></i> Analyze';
        btn.disabled = false;
    }
}

function setFilter(type) {
    activeFilter = type;
    refreshTable();
    document.querySelectorAll('.stat-card').forEach(c => c.classList.remove('active'));
    document.getElementById(`card-${type}`)?.classList.add('active');
    document.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('bg-primary', 'text-white'));
    document.getElementById(`btn-${type}`)?.classList.add('bg-primary', 'text-white');
}

function refreshTable(search = '') {
    const tbody = document.getElementById('dash-table-body');
    if (!tbody) return;

    let filtered = students.filter(s => {
        const matchesSearch = s.name.toLowerCase().includes(search.toLowerCase()) || s.lrn.includes(search);
        if (!matchesSearch) return false;

        if (activeFilter === 'total') return true;
        if (activeFilter === 'attendance') return s.attendance >= 90;
        if (activeFilter === 'risk') return s.gwa > 0 && s.gwa < 75;
        if (activeFilter === 'eval') return s.gwa > 0;
        if (activeFilter === 'highest') return s.gwa >= 98 && s.gwa <= 100;
        if (activeFilter === 'high') return s.gwa >= 95 && s.gwa < 98;
        if (activeFilter === 'with') return s.gwa >= 90 && s.gwa < 95;
        return true;
    });

    tbody.innerHTML = filtered.map(s => {
        let badge = '<span class="px-2 py-0.5 rounded text-[10px] bg-gray-100 text-gray-500">Regular</span>';
        if (s.gwa >= 98) badge = '<span class="px-2 py-0.5 rounded text-[10px] bg-yellow-100 text-yellow-700 font-bold border border-yellow-200">Highest Honor</span>';
        else if (s.gwa >= 95) badge = '<span class="px-2 py-0.5 rounded text-[10px] bg-purple-100 text-purple-700 font-bold border border-purple-200">High Honor</span>';
        else if (s.gwa >= 90) badge = '<span class="px-2 py-0.5 rounded text-[10px] bg-blue-100 text-blue-700 font-bold border border-blue-200">With Honor</span>';
        else if (s.gwa > 0 && s.gwa < 75) badge = '<span class="px-2 py-0.5 rounded text-[10px] bg-red-100 text-red-600 font-bold">Failing</span>';
        else if (s.gwa === 0) badge = '<span class="px-2 py-0.5 rounded text-[10px] bg-gray-100 text-gray-400 font-bold">No Grades</span>';

        // Derive Adviser dynamically
        const adviseTeacher = teachers.find(t => t.is_adviser && (t.section || '').split(',').map(x => x.trim()).includes(s.section));
        const advName = adviseTeacher ? adviseTeacher.name : 'Pending Assignment';

        return `
            <tr class="hover:bg-gray-50 transition">
                <td class="px-6 py-4 font-mono text-gray-400">${s.lrn}</td>
                <td class="px-6 py-4 font-bold text-gray-800">${s.name}</td>
                <td class="px-6 py-4 text-gray-500">${s.section}</td>
                <td class="px-6 py-4 text-gray-400 hidden xl:table-cell">${advName}</td>
                <td class="px-6 py-4 font-bold text-primary">${s.gwa > 0 ? s.gwa : '-'}</td>
                <td class="px-6 py-4">${s.attendance > 0 ? s.attendance + '%' : '-'}</td>
                <td class="px-6 py-4">${badge}</td>
                <td class="px-6 py-4">
                    <button onclick="showReportForLRN('${s.lrn}')" class="px-3 py-1.5 bg-blue-50 text-blue-600 rounded-lg text-[10px] font-bold hover:bg-blue-100 transition shadow-sm border border-blue-100 flex items-center gap-1">
                        <i class="fas fa-print"></i> Academic Report
                    </button>
                </td>
            </tr>
        `;
    }).join('');
}

function searchTable(val) { refreshTable(val); }

function showReportForLRN(lrn) {
    const s = students.find(x => x.lrn === lrn);
    if (s) showReport(s);
}
