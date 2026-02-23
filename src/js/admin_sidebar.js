const adminLinks = [
    { label: 'Privilege', url: '#' },
    { label: 'Default Privilege', url: '#' },
    { label: 'User Privilege', url: '#' },
    { label: 'Plants', url: '#' },
    { label: 'Modules', url: '#' },
    { label: 'User', url: '#' },
    { label: 'User-Plants', url: '#' },
    { label: 'User-Email', url: '#' },
    { label: 'Change Password', url: '#' },
    { label: 'Reset Password', url: '#' },
    { label: 'Admin Member', url: '#' },
    { label: 'New Update Popup', url: '#' },
    { label: 'What\'s new', url: '#' },
    { label: 'Mail Schedule', url: '#' },
    { label: 'Login Info', url: '#' },
    { label: 'Space for Ex-DMS', url: '#' },
    { label: 'Exit', url: '/index.html' }
];

function initAdminSidebar() {
    const container = document.getElementById('adminSidebarContainer');
    const menuBtn = document.getElementById('adminMenuBtn');
    
    if (!container || !menuBtn) return;

    // Build sidebar HTML
    const sidebarHTML = `
        <div id="adminSidebar" class="hidden absolute top-full left-0 bg-[#d8d8c8] border border-gray-500 shadow-xl z-[100] w-44">
            <ul class="flex flex-col">
                ${adminLinks.map(link => `
                    <li class="border-b border-gray-400 last:border-0">
                        <a href="${link.url}" class="block px-3 py-1 text-red-600 text-[11px] font-bold hover:bg-gray-300 transition-colors">
                            ${link.label}
                        </a>
                    </li>
                `).join('')}
            </ul>
        </div>
    `;

    container.innerHTML = sidebarHTML;

    const sidebar = document.getElementById('adminSidebar');

    menuBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        sidebar.classList.toggle('hidden');
    });

    // Close when clicking outside
    document.addEventListener('click', (e) => {
        if (!sidebar.contains(e.target) && e.target !== menuBtn) {
            sidebar.classList.add('hidden');
        }
    });
}
