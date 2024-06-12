const sidebar = document.getElementById('sidebar');
const sidebarLinks = document.querySelectorAll('#sidebar a');
const levels = document.querySelectorAll('.level');
const artworks = document.querySelectorAll('.artwork');

function goToLevel(levelId) {
    scrollToLevel(levelId);
    if (levelId !== 'attic') {
        showSidebar();
    } else {
        hideSidebar();
    }
}

function showSidebar() {
    sidebar.classList.remove('hidden');
    sidebar.classList.add('visible');
}

function hideSidebar() {
    sidebar.classList.remove('visible');
    sidebar.classList.add('hidden');
}

function scrollToLevel(levelId) {
    levels.forEach(level => {
        if (level.id === levelId) {
            level.scrollIntoView({ behavior: 'smooth' });

            // Animate artworks for the current level
            const levelArtworks = level.querySelectorAll('.artwork');
            levelArtworks.forEach((artwork, index) => {
                setTimeout(() => {
                    artwork.style.transform = 'translateX(0)';
                    artwork.style.opacity = '1';
                }, index * 100); // Stagger the animations
            });
        } else {
            // Reset artworks for other levels
            const otherArtworks = level.querySelectorAll('.artwork');
            otherArtworks.forEach(artwork => {
                artwork.style.transform = 'translateX(100%)';
                artwork.style.opacity = '0';
            });
        }
    });
}

sidebarLinks.forEach(link => {
    link.addEventListener('click', function (event) {
        event.preventDefault();
        const targetId = this.getAttribute('data-target');
        goToLevel(targetId);
    });
});

// Check the initial scroll position and show/hide the sidebar accordingly
document.addEventListener('DOMContentLoaded', () => {
    const initialLevel = Array.from(levels).find(level => {
        const rect = level.getBoundingClientRect();
        return rect.top === 0;
    });

    if (initialLevel && initialLevel.id !== 'attic') {
        showSidebar();
    } else {
        hideSidebar();
    }
});

// Initial state: hide the sidebar
hideSidebar();
