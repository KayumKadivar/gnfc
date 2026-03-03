const DashboardConfig = {
    DEFAULT_PLANTS: [
        'AA', 'AAQM', 'AMM', 'ANIPF', 'ANITDI', 'ASGP', 'BAGG', 'BOILER', 'CMS', 'CPSU', 'DM', 'EA', 'FA', 'INST WS', 'M1', 'M2', 'UREA', 'UTIL', 'DCS', 'MF'
    ],
    PLANT_DISPLAY: {
        'AA': { label: 'AA Section', status: 'Operational', color: '#73BF69' },
        'AAQM': { label: 'AAQM', status: 'Operational', color: '#73BF69' },
        'AMM': { label: 'Ammonia', status: 'Operational', color: '#73BF69' },
        'ANIPF': { label: 'ANIPF', status: 'Maintenance', color: '#FF9900' },
        'ANITDI': { label: 'ANITDI', status: 'Operational', color: '#73BF69' },
        'ASGP': { label: 'ASGP', status: 'Operational', color: '#73BF69' },
        'BAGG': { label: 'Bagging', status: 'Operational', color: '#73BF69' },
        'BOILER': { label: 'BOILER', status: 'Critical', color: '#F2495C' },
        'CMS': { label: 'CMS', status: 'Operational', color: '#73BF69' },
        'CPSU': { label: 'CPSU', status: 'Operational', color: '#73BF69' },
        'DM': { label: 'DM Plant', status: 'Operational', color: '#73BF69' },
        'EA': { label: 'EA', status: 'Operational', color: '#73BF69' },
        'FA': { label: 'FA Section', status: 'Operational', color: '#73BF69' },
        'INST WS': { label: 'Inst W/S', status: 'Active', color: '#5794F2' },
        'M1': { label: 'Methanol-1', status: 'Operational', color: '#73BF69' },
        'M2': { label: 'Methanol-2', status: 'Maintenance', color: '#FF9900' },
        'UREA': { label: 'Urea', status: 'Operational', color: '#73BF69' },
        'UTIL': { label: 'Utility', status: 'Operational', color: '#73BF69' },
        'DCS': { label: 'DCS', status: 'Active', color: '#5794F2' },
        'MF': { label: 'MF', status: 'Operational', color: '#73BF69' }
    }
};

// --- Pure Functional Utilities ---
const DashboardUtils = {
    formatTime: (date) => {
        const hh = String(date.getHours()).padStart(2, '0');
        const mm = String(date.getMinutes()).padStart(2, '0');
        const ss = String(date.getSeconds()).padStart(2, '0');
        return `${hh}:${mm}:${ss}`;
    },

    formatDate: (date) => {
        const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
        const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
        return `${days[date.getDay()]}, ${date.getDate()} ${months[date.getMonth()]} ${date.getFullYear()}`;
    },

    getGreeting: (hour) => {
        return hour < 12 ? 'Morning' : hour < 17 ? 'Afternoon' : 'Evening';
    },

    animateCounter: (el, target) => {
        if (!el) return;
        let current = 0;
        const step = Math.max(1, Math.ceil(target / 20));
        const interval = setInterval(() => {
            current += step;
            if (current >= target) {
                current = target;
                clearInterval(interval);
            }
            el.textContent = current;
        }, 40);
    },

    normalizeStatus: (status) => String(status || '').trim().toUpperCase(),
    isCompletedStatus: (status) => DashboardUtils.normalizeStatus(status).includes('OVER'),
    isInProgressStatus: (status) => DashboardUtils.normalizeStatus(status) === 'IN PROGRESS'
};

// --- Object-Oriented Managers ---
class ClockManager {
    constructor() {
        this.clockEl = document.getElementById('live-clock');
        this.dateEl = document.getElementById('live-date');
        this.greetingEl = document.getElementById('greeting-time');
        
        if (this.clockEl && this.dateEl && this.greetingEl) {
           this.start();     
        }
    }

    update() {
        const now = new Date();
        if (this.clockEl) this.clockEl.textContent = DashboardUtils.formatTime(now);
        if (this.dateEl) this.dateEl.textContent = DashboardUtils.formatDate(now);
        if (this.greetingEl) this.greetingEl.textContent = DashboardUtils.getGreeting(now.getHours());
    }

    start() {
        this.update();
        setInterval(() => this.update(), 1000);
    }
}

class KPIManager {
    constructor() {
        this.loadData();
    }

    loadData() {
        // Data Retrieval
        const state = window.ElogbookStore ? ElogbookStore.loadState() : { plants: {} };
        const allJobs = [];

        DashboardConfig.DEFAULT_PLANTS.forEach(plant => {
            const jobs = (state.plants[plant] && state.plants[plant].jobs) || [];
            jobs.forEach(job => allJobs.push({ ...job, _plant: plant }));
        });

        // Compute Statistics
        const todayIso = new Date().toISOString().slice(0, 10);
        this.todayTotalJobs = allJobs.filter(j => (j.targetDate || '').slice(0, 10) === todayIso).length;
        this.isoJobs = allJobs.filter(j => String(j.jobType || '').toUpperCase().includes('ISO')).length;
        this.completedJobs = allJobs.filter(j => DashboardUtils.isCompletedStatus(j.status)).length;
        this.pendingJobs = allJobs.filter(j => !DashboardUtils.isCompletedStatus(j.status) && !DashboardUtils.isInProgressStatus(j.status)).length;

        // Calibration Statistics
        const calDueItems = window.CalibrationStore ? CalibrationStore.getDueItems() : [];
        this.calCount = calDueItems.length;

        this.render();
    }

    render() {
        setTimeout(() => {
            DashboardUtils.animateCounter(document.getElementById('kpi-total'), this.todayTotalJobs);
            DashboardUtils.animateCounter(document.getElementById('kpi-completed'), this.completedJobs);
            DashboardUtils.animateCounter(document.getElementById('kpi-iso'), this.isoJobs);
            DashboardUtils.animateCounter(document.getElementById('kpi-pending'), this.pendingJobs);

            if (this.calCount > 0) {
                const calCard = document.getElementById('kpi-card-cal');
                if (calCard) {
                    calCard.classList.remove('hidden');
                    DashboardUtils.animateCounter(document.getElementById('kpi-cal-count'), this.calCount);
                }
            }
        }, 200);
    }
}

class NoticeboardManager {
    constructor() {
        this.container = document.getElementById('noticeboard-container');
        this.notices = [
            {
                id: 1,
                title: "Plant Shutdown Schedule - Q2",
                content: "Please note the updated maintenance schedule for the Ammonia plant starting April 15th.",
                author: "Plant Manager",
                date: "23 Feb 2026",
                priority: "urgent",
                pinned: true
            },
            {
                id: 2,
                title: "Safety Drill Today",
                content: "Standard safety drill scheduled for 14:00 today. All personnel must report to designated assembly points.",
                author: "Safety Officer",
                date: "23 Feb 2026",
                priority: "normal",
                pinned: false
            },
            {
                id: 3,
                title: "New Instrument Calibration Kit",
                content: "Newly received Fluke 754 calibrators are now available in the workshop for checkout.",
                author: "Workshop In-charge",
                date: "22 Feb 2026",
                priority: "important",
                pinned: false
            }
        ];

        this.render();
    }

    getPriorityClass(priority) {
        switch (priority) {
            case 'urgent': return 'border-l-4 border-red-500 bg-red-500/5';
            case 'important': return 'border-l-4 border-orange-500 bg-orange-500/5';
            default: return 'border-l-4 border-blue-500 bg-blue-500/5';
        }
    }

    render() {
        if (!this.container) return;

        this.container.innerHTML = this.notices.map(notice => {
            const priorityClass = this.getPriorityClass(notice.priority);
            const pinIcon = notice.pinned ? '<i class="ph-fill ph-push-pin color-orange font-14px"></i>' : '';

            return `
            <div class="bg-dark-panel border border-dark-border rounded-lg p-4 shadow-sm hover:shadow-md transition-all group ${priorityClass} cursor-pointer hover:border-blue-500/50" onclick="window.noticeboardManager.openModal(${notice.id})">
              <div class="flex items-start justify-between mb-2 gap-3">
                <h3 class="font-15px fw-bold color-primary group-hover:color-blue transition-colors leading-tight">${notice.title}</h3>
                <div class="shrink-0 mt-0.5">${pinIcon}</div>
              </div>
              <p class="font-14px color-label leading-relaxed mb-4 line-clamp-2">${notice.content}</p>
              <div class="flex items-center justify-between border-t border-dark-border/50 pt-3">
                <div class="flex items-center gap-1.5 text-xs color-secondary">
                  <i class="ph ph-user"></i>
                  <span>${notice.author}</span>
                </div>
                <div class="flex items-center gap-1.5 text-xs color-secondary font-mono">
                  <i class="ph ph-calendar"></i>
                  <span>${notice.date}</span>
                </div>
              </div>
            </div>`;
        }).join('');
    }

    openModal(id) {
        const notice = this.notices.find(n => n.id === id);
        if (!notice) return;

        const modalHtml = `
          <div id="notice-modal" class="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200" onclick="if(event.target === this) this.remove()">
            <div class="bg-dark-panel border border-dark-border w-full max-w-lg rounded-xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200">
              <div class="p-6 border-b border-dark-border flex items-center justify-between">
                <div class="flex items-center gap-3">
                  <div class="w-10 h-10 rounded-lg bg-gnfc-blue/10 flex items-center justify-center">
                    <i class="ph-fill ph-megaphone color-blue text-xl"></i>
                  </div>
                  <div>
                    <h2 class="font-16px fw-bold color-primary">${notice.title}</h2>
                    <p class="font-12px color-label mt-0.5">Announcement Details</p>
                  </div>
                </div>
                <button onclick="document.getElementById('notice-modal').remove()" class="w-8 h-8 rounded-full hover:bg-white/5 flex items-center justify-center transition-colors">
                  <i class="ph ph-x color-secondary font-18px"></i>
                </button>
              </div>
              <div class="p-6">
                <div class="bg-dark-bg/50 border border-dark-border rounded-lg p-4 mb-6">
                  <p class="font-15px color-primary leading-relaxed">${notice.content}</p>
                </div>
                <div class="flex items-center justify-between bg-white/2 rounded-lg px-4 py-3">
                  <div class="flex items-center gap-2">
                    <div class="w-8 h-8 rounded-full bg-dark-border flex items-center justify-center">
                      <i class="ph-fill ph-user-circle color-secondary text-lg"></i>
                    </div>
                    <div>
                      <p class="font-12px fw-bold color-primary">${notice.author}</p>
                      <p class="font-10px color-label uppercase tracking-wider ls-wide">Posted By</p>
                    </div>
                  </div>
                  <div class="text-right">
                    <p class="font-12px fw-bold color-primary font-mono">${notice.date}</p>
                    <p class="font-10px color-label uppercase tracking-wider ls-wide">Date</p>
                  </div>
                </div>
              </div>
              <div class="p-4 bg-white/2 border-t border-dark-border flex justify-end">
                <button onclick="document.getElementById('notice-modal').remove()" class="bg-gnfc-blue hover:bg-blue-600 color-white px-6 py-2 rounded-md font-13px fw-bold transition-all shadow-md active:scale-95">
                  Understood
                </button>
              </div>
            </div>
          </div>
        `;
        document.body.insertAdjacentHTML('beforeend', modalHtml);
    }
}

// --- Application Initialization ---
document.addEventListener('DOMContentLoaded', () => {
    new ClockManager();
    new KPIManager();
    window.noticeboardManager = new NoticeboardManager();
});
