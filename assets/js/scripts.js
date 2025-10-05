// Theme Toggle Functionality
const themeToggle = document.getElementById('theme-toggle');
const themeIcon = themeToggle.querySelector('i');

// Check for saved theme preference or default to light
const currentTheme = localStorage.getItem('theme') || 'light';
document.documentElement.classList.toggle('dark', currentTheme === 'dark');
updateThemeIcon(currentTheme);

themeToggle.addEventListener('click', () => {
    const isDark = document.documentElement.classList.toggle('dark');
    localStorage.setItem('theme', isDark ? 'dark' : 'light');
    updateThemeIcon(isDark ? 'dark' : 'light');
});

function updateThemeIcon(theme) {
    if (theme === 'dark') {
        themeIcon.classList.remove('fa-moon');
        themeIcon.classList.add('fa-sun');
    } else {
        themeIcon.classList.remove('fa-sun');
        themeIcon.classList.add('fa-moon');
    }
}

// Mobile Menu Functionality
document.addEventListener('DOMContentLoaded', function() {
    const mobileMenuToggle = document.getElementById('mobile-menu-toggle');
    const mobileMenu = document.getElementById('mobile-menu');
    const mobileMenuOverlay = document.getElementById('mobile-menu-overlay');
    const mobileMenuClose = document.getElementById('mobile-menu-close');

    function openMobileMenu() {
        console.log('Opening mobile menu');
        mobileMenu.classList.add('open');
        mobileMenuOverlay.classList.add('open');
        mobileMenuToggle.classList.add('open');
        document.body.style.overflow = 'hidden';
    }

    function closeMobileMenu() {
        console.log('Closing mobile menu');
        mobileMenu.classList.remove('open');
        mobileMenuOverlay.classList.remove('open');
        mobileMenuToggle.classList.remove('open');
        document.body.style.overflow = '';
    }

    // Toggle button click - open/close menu
    mobileMenuToggle.addEventListener('click', function(e) {
        e.stopPropagation();
        if (mobileMenu.classList.contains('open')) {
            closeMobileMenu();
        } else {
            openMobileMenu();
        }
    });

    // Close button click - close menu
    if (mobileMenuClose) {
        mobileMenuClose.addEventListener('click', function(e) {
            e.stopPropagation();
            closeMobileMenu();
        });
    }

    // Overlay click - close menu
    mobileMenuOverlay.addEventListener('click', function(e) {
        e.stopPropagation();
        closeMobileMenu();
    });

    // Close menu when menu links are clicked
    document.querySelectorAll('.mobile-menu-link').forEach(link => {
        link.addEventListener('click', function(e) {
            closeMobileMenu();
        });
    });

    // Close menu on escape key
    document.addEventListener('keydown', function(e) {
        if (e.key === 'Escape' && mobileMenu.classList.contains('open')) {
            closeMobileMenu();
        }
    });

    // Prevent clicks inside the menu from closing it
    mobileMenu.addEventListener('click', function(e) {
        e.stopPropagation();
    });
});

// Smooth scrolling for anchor links
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        e.preventDefault();
        
        const targetId = this.getAttribute('href');
        if (targetId === '#') return;
        
        const targetElement = document.querySelector(targetId);
        if (targetElement) {
            window.scrollTo({
                top: targetElement.offsetTop - 80,
                behavior: 'smooth'
            });
        }
    });
});

// Counter animation for stats
function animateCounter(element) {
    const target = parseInt(element.getAttribute('data-count'));
    const duration = 2000;
    const step = target / (duration / 16);
    let current = 0;
    
    const timer = setInterval(() => {
        current += step;
        if (current >= target) {
            element.textContent = target + '+';
            clearInterval(timer);
        } else {
            element.textContent = Math.floor(current);
        }
    }, 16);
}

// Intersection Observer for animations
const observerOptions = {
    threshold: 0.1,
    rootMargin: '0px 0px -50px 0px'
};

const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            // Animate stats counter
            const statNumbers = entry.target.querySelectorAll('.stat-number');
            if (statNumbers.length > 0) {
                statNumbers.forEach(animateCounter);
            }
            
            // Add loaded class for fade-in animations
            entry.target.classList.add('loaded');
        }
    });
}, observerOptions);

// Observe sections for animations
document.querySelectorAll('.section').forEach(section => {
    observer.observe(section);
});


// Add scroll effect to header
window.addEventListener('scroll', function() {
    const header = document.querySelector('.header');
    if (window.scrollY > 100) {
        header.style.boxShadow = '0 4px 24px rgba(0, 0, 0, 0.1)';
    } else {
        header.style.boxShadow = '0 2px 8px rgba(0, 0, 0, 0.05)';
    }
});

// Initialize animations on load
document.addEventListener('DOMContentLoaded', function() {
    // Add loading class to all interactive elements
    const animatedElements = document.querySelectorAll('.glass-card, .btn, .skill-tag, .timeline-content, .contact-item, .nav-link, .theme-toggle, .social-link, .contact-icon, .skill-icon');
    
    animatedElements.forEach((element, index) => {
        element.classList.add('loading');
        
        setTimeout(() => {
            element.classList.remove('loading');
            element.classList.add('loaded');
        }, 100 + (index * 50));
    });
});

// CV Download functionality
function downloadCV() {
    // Create a temporary link element
    const link = document.createElement('a');
    link.href = 'assets/files/Nikolay_Gerginov_CV.pdf';
    link.download = 'Nikolay_Gerginov_CV.pdf';
    link.target = '_blank';
    
    // Trigger the download
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
}

// Add event listeners to all Download CV elements
function initCVDownload() {
    const downloadElements = document.querySelectorAll('[data-cv-download]');
    
    downloadElements.forEach(element => {
        element.addEventListener('click', downloadCV);
        element.style.cursor = 'pointer';
    });
}

// Call when DOM is loaded
document.addEventListener('DOMContentLoaded', initCVDownload);