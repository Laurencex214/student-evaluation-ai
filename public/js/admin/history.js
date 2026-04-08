/**
 * admin/history.js — History & Analytics Page
 */

let historySearch = '';

function renderHistory(container) {
    container.innerHTML = `
        <div class="animate-fade-in max-w-6xl mx-auto">
            <div class="mb-6 flex justify-between items-end">
                <div>
                    <h2 class="text-2xl font-bold text-gray-800 tracking-tight">Student History & Analytics</h2>
                    <p class="text-sm text-gray-400 mt-1">Search the masterlist to view complete academic history and grade analytics.</p>
                </div>
            </div>
            
            <div class="bg-white p-6 rounded-3xl shadow-sm border border-gray-100 mb-6 flex gap-4">
                <div class="relative w-full">
                    <i class="fas fa-search absolute left-4 top-3.5 text-gray-400"></i>
                    <input type="text" value="${historySearch}" id="history-search-input" onkeyup="searchHistoryTable(this.value)" placeholder="Search any student by Name or LRN..." class="w-full pl-11 pr-4 py-3 border border-gray-200 rounded-xl bg-gray-50 focus:bg-white text-sm outline-none focus:border-primary transition shadow-sm">
                </div>
            </div>
            
            <div class="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden" id="history-content-area">
                <div class="p-6 text-center text-gray-400 py-20">
                    <i class="fas fa-search text-6xl mb-4 text-gray-200"></i>
                    <p>Search and select a student to view their history and analytics.</p>
                </div>
            </div>
        </div>
    `;

    // Auto-search if restoring state or if not empty
    if (historySearch) {
        searchHistoryTable(historySearch);
    } else {
        // Automatically list all students if search is empty
        searchHistoryTable('');
    }
}

function searchHistoryTable(val) {
    historySearch = val.toLowerCase();
    const area = document.getElementById('history-content-area');
    if (!area) return;

    // Filter matching students (or all if search is empty)
    let matched = students;
    if (historySearch) {
        matched = students.filter(s => s.name.toLowerCase().includes(historySearch) || String(s.lrn).includes(historySearch));
    }

    if (matched.length === 0) {
        area.innerHTML = `<div class="p-6 pb-10 text-center text-red-400 italic py-20"><i class="fas fa-times-circle text-4xl mb-4 text-red-200 block"></i> No students match your search.</div>`;
        return;
    }

    // Show results list
    area.innerHTML = `
        <div class="p-4 md:p-6 border-b border-gray-100 bg-gray-50/50 flex justify-between items-center">
            <h3 class="font-bold text-gray-800 text-sm md:text-base">${historySearch ? 'Search Results' : 'General Masterlist'} (${matched.length})</h3>
            <span class="text-[10px] text-gray-400 uppercase font-bold tracking-wider hidden sm:block">Select a student record</span>
        </div>
        <div class="divide-y divide-gray-50 max-h-[60vh] overflow-y-auto">
            ${matched.map(s => `
                <div class="p-4 md:p-5 hover:bg-gray-50 flex flex-col md:flex-row md:items-center justify-between transition group cursor-pointer border-l-4 border-transparent hover:border-primary" onclick="viewStudentHistory('${s.lrn}')">
                    <div class="mb-3 md:mb-0">
                        <p class="font-bold text-gray-800 text-sm group-hover:text-primary transition">${s.name}</p>
                        <p class="text-[10px] sm:text-xs text-gray-400 font-mono mt-1">LRN: ${s.lrn} &nbsp;&bull;&nbsp; Sec: <span class="text-gray-600 font-semibold">${s.section || 'Unassigned'}</span> &nbsp;&bull;&nbsp; GWA: <span class="${s.gwa >= 75 ? 'text-green-600 font-bold' : (s.gwa > 0 ? 'text-red-500 font-bold' : 'font-bold text-gray-600')}">${s.gwa || 'N/A'}</span></p>
                    </div>
                    <button class="w-full md:w-auto px-4 py-2 bg-blue-50 text-blue-600 rounded-lg text-xs font-bold hover:bg-blue-100 transition shadow-sm border border-blue-100 flex items-center justify-center gap-2 shrink-0">
                        <i class="fas fa-chart-line"></i> View History & Analytics
                    </button>
                </div>
            `).join('')}
        </div>
    `;
}

function viewStudentHistory(lrn) {
    const s = students.find(x => String(x.lrn) === String(lrn));
    if (!s) return;

    const area = document.getElementById('history-content-area');

    const labelData = [];
    const scoreData = [];

    if (s.subjects && s.subjects.length > 0) {
        s.subjects.forEach(sub => {
            if (sub.n && sub.g != null && sub.g > 0) { // check > 0 to omit blank grades from graph
                labelData.push(sub.n);
                scoreData.push(parseFloat(sub.g));
            }
        });
    }

    area.innerHTML = `
        <div class="p-6 md:p-8 border-b border-gray-100 flex flex-col md:flex-row justify-between md:items-center bg-gradient-to-r from-gray-50 to-white relative overflow-hidden gap-4">
            <div class="absolute right-0 top-0 opacity-5 text-9xl text-primary pointer-events-none"><i class="fas fa-graduation-cap pt-10 pr-10"></i></div>
            <div class="relative z-10 w-full md:w-auto">
                <button onclick="searchHistoryTable(historySearch)" class="text-[10px] md:text-xs text-gray-500 hover:text-primary mb-3 bg-white px-3 py-1.5 rounded shadow-sm border border-gray-200 inline-flex items-center gap-1.5 font-bold transition-all hover:bg-gray-50"><i class="fas fa-arrow-left"></i> Back to List</button>
                <h3 class="text-2xl md:text-3xl font-black text-gray-800 tracking-tight">${s.name}</h3>
                <div class="flex flex-wrap items-center gap-3 mt-2">
                    <span class="text-xs font-mono text-gray-600 bg-gray-100 px-2 py-0.5 rounded border border-gray-200"><i class="fas fa-id-badge text-gray-400 mr-1"></i>${s.lrn}</span>
                    <span class="text-xs font-bold text-primary bg-green-50 px-2 py-0.5 rounded border border-green-100"><i class="fas fa-layer-group text-primary/50 mr-1"></i>${s.section || 'Unassigned'}</span>
                </div>
            </div>
            <div class="relative z-10 flex text-left md:text-right md:justify-end gap-6 md:gap-8 items-center bg-white p-4 rounded-2xl shadow-sm border border-gray-100">
                <div class="flex flex-col">
                    <div class="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-0.5">Attendance</div>
                    <div class="text-2xl font-black text-gray-700">${s.attendance > 0 ? s.attendance + '%' : '--'}</div>
                </div>
                <div class="w-px h-10 bg-gray-100"></div>
                <div class="flex flex-col">
                    <div class="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-0.5">Gen. Average</div>
                    <div class="text-3xl font-black ${s.gwa >= 75 ? 'text-green-600' : (s.gwa > 0 ? 'text-red-500' : 'text-gray-300')}">${s.gwa > 0 ? parseFloat(s.gwa).toFixed(2) : '--'}</div>
                </div>
            </div>
        </div>
        
        <div class="grid grid-cols-1 lg:grid-cols-2">
            <!-- Left side: Analytics Chart -->
            <div class="p-6 border-b lg:border-b-0 lg:border-r border-gray-100 flex flex-col bg-white">
                <h4 class="text-xs font-bold text-gray-500 uppercase tracking-wider mb-6 flex items-center gap-2"><i class="fas fa-chart-radar text-primary text-sm"></i> Subject Performance Analytics</h4>
                <div class="flex-1 relative min-h-[300px] w-full flex items-center justify-center">
                    ${scoreData.length >= 3 ? '<canvas id="historyChart"></canvas>' : '<div class="text-gray-400 italic text-sm py-10 text-center"><i class="fas fa-info-circle text-2xl mb-2 text-gray-200 block"></i>Not enough subject grades recorded for radar analysis (need at least 3).</div>'}
                </div>
            </div>
            
            <!-- Right side: Quick Grades List & Report Button -->
            <div class="p-6 bg-gray-50/50 flex flex-col">
                <div class="flex justify-between items-end mb-6">
                    <div>
                        <h4 class="text-xs font-bold text-gray-500 uppercase tracking-wider mb-1 flex items-center gap-1.5"><i class="fas fa-list-ol text-primary"></i> Recorded Grades</h4>
                        <p class="text-[10px] text-gray-400">Final grades by subject</p>
                    </div>
                    <button onclick="showReport(students.find(x => String(x.lrn) === '${s.lrn}'))" class="px-3.5 py-2 bg-blue-600 text-white rounded-xl text-xs font-bold hover:bg-blue-700 transition shadow-md hover:shadow-lg flex items-center gap-1.5 transform hover:-translate-y-0.5">
                        <i class="fas fa-print text-sm"></i> Academic Report
                    </button>
                </div>
                
                <div class="flex-1 max-h-[300px] overflow-y-auto pr-1">
                    ${labelData.length > 0 ? `
                        <div class="bg-white rounded-xl border border-gray-200 shadow-sm divide-y divide-gray-100">
                            ${labelData.map((lbl, idx) => `
                                <div class="flex justify-between items-center px-4 py-3 hover:bg-blue-50/50 transition text-sm">
                                    <span class="font-semibold text-gray-700">${lbl}</span>
                                    <span class="font-bold text-xs ${scoreData[idx] >= 75 ? 'text-green-700 bg-green-50 border-green-200' : 'text-red-600 bg-red-50 border-red-200'} border px-2.5 py-1 rounded shadow-sm">${scoreData[idx]}</span>
                                </div>
                            `).join('')}
                        </div>
                    ` : '<div class="text-center p-8 bg-white rounded-xl border border-gray-200 text-sm text-gray-400 italic shadow-sm"><i class="fas fa-folder-open text-3xl mb-3 text-gray-200 block"></i>This student has no graded subjects yet.</div>'}
                </div>
            </div>
        </div>
    `;

    if (scoreData.length >= 3) {
        setTimeout(() => {
            const ctx = document.getElementById('historyChart');
            if (ctx) {
                new Chart(ctx, {
                    type: 'radar',
                    data: {
                        labels: labelData,
                        datasets: [{
                            label: 'Subject Grades',
                            data: scoreData,
                            backgroundColor: 'rgba(16, 185, 129, 0.2)', // primary green
                            borderColor: 'rgba(16, 185, 129, 1)',
                            pointBackgroundColor: 'rgba(16, 185, 129, 1)',
                            pointBorderColor: '#fff',
                            pointHoverBackgroundColor: '#fff',
                            pointHoverBorderColor: 'rgba(16, 185, 129, 1)',
                            borderWidth: 2,
                            fill: true
                        }]
                    },
                    options: {
                        responsive: true,
                        maintainAspectRatio: false,
                        scales: {
                            r: {
                                angleLines: { color: 'rgba(0,0,0,0.1)' },
                                grid: { color: 'rgba(0,0,0,0.1)' },
                                pointLabels: { font: { size: 10, family: "'Inter', sans-serif", weight: 'bold' }, color: '#4b5563' },
                                min: 60,
                                max: 100,
                                ticks: { stepSize: 10, display: false, count: 5 }
                            }
                        },
                        plugins: { legend: { display: false } }
                    }
                });
            }
        }, 100);
    }
}
