/**
 * admin/activityLogs.js — Activity Logs page render functions
 */

function renderLogs(container) {
    container.innerHTML = `
        <div class="animate-fade-in max-w-4xl mx-auto">
            <div class="mb-6 flex justify-between items-end">
                <div>
                    <h2 class="text-2xl font-bold text-gray-800 tracking-tight">Activity Logs</h2>
                    <p class="text-sm text-gray-500 mt-1">Audit trail of all system actions. ${activityLogs.length} total events.</p>
                </div>
            </div>
            <div class="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                <div class="divide-y divide-gray-50">
                    ${activityLogs.map((log, i) => `
                        <div class="flex items-start gap-4 px-6 py-4 hover:bg-gray-50 transition animate-fade-in" style="animation-delay: ${i * 20}ms">
                            <div class="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center shrink-0 mt-0.5">
                                <i class="fas fa-history text-primary text-xs"></i>
                            </div>
                            <div class="flex-1">
                                <p class="text-sm font-medium text-gray-800">${log.action}</p>
                                <p class="text-xs text-gray-400 mt-0.5">by <span class="font-bold text-gray-600">${log.user}</span> &mdash; ${log.time}</p>
                            </div>
                            <span class="text-[10px] text-gray-300 font-mono">#${log.id}</span>
                        </div>
                    `).join('')}

                    ${activityLogs.length === 0 ? `
                        <div class="py-16 text-center text-gray-400">
                            <i class="fas fa-clipboard-list text-4xl mb-4 block"></i>
                            <p class="text-sm">No activity yet.</p>
                        </div>
                    ` : ''}
                </div>
            </div>
        </div>
    `;
}
