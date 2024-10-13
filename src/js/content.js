if (window.location.hostname === 'elearning.ovgu.de') {

// CSS Management Functions
const loadCSS = (file) => {
    const link = document.createElement("link");
    link.href = chrome.runtime.getURL(file);
    link.id = "moodleCustomStyle";
    link.type = "text/css";
    link.rel = "stylesheet";
    document.head.appendChild(link);
};

const reloadCSS = () => {
    const oldLink = document.getElementById("moodleCustomStyle");
    if (oldLink) {
        oldLink.href = `${chrome.runtime.getURL('/src/css/styles.css')}?v=${new Date().getTime()}`;
    } else {
        loadCSS('/src/css/styles.css');
    }
};


// Load and apply settings
chrome.storage.sync.get(['darkMode', 'customNavbar'], function(result) {
    if (result.darkMode) {
        applyDarkMode();
    }
    if (result.customNavbar) {
        applyCustomNavbar();
    }
});



// Custom Navbar Functions
const createNavbarHTML = () => `
    <div class="container-fluid">
        <a href="https://elearning.ovgu.de" class="navbar-brand d-flex align-items-center">
            <img src="${chrome.runtime.getURL('images/logo_ovgu.png')}" alt="OVGU Logo" height="30" class="mr-2">
        </a>
        <ul class="navbar-nav mr-auto">
            <li class="nav-item"><a class="nav-link" href="https://elearning.ovgu.de">Home</a></li>
            <li class="nav-item"><a class="nav-link" href="https://elearning.ovgu.de/my/">Dashboard</a></li>
            <!-- My courses dropdown will be inserted here -->
            <li class="nav-item"><a class="nav-link" href="https://elearning.ovgu.de/calendar/view.php?view=month">Calendar</a></li>
        </ul>
        <ul class="navbar-nav ml-auto">
            <!-- Notification, messages, and user menu items will be moved here -->
        </ul>
    </div>
`;

const injectCustomNavbar = () => {
    const customNavbar = document.createElement('nav');
    customNavbar.className = 'fixed-top navbar navbar-dark bg-primary navbar-expand-md moodle-has-zindex custom-navbar';
    customNavbar.setAttribute('aria-label', 'Site navigation');
    customNavbar.innerHTML = createNavbarHTML();

    const existingNavbar = document.querySelector('.navbar');
    if (existingNavbar) {
        moveNavbarElements(existingNavbar, customNavbar);
        existingNavbar.parentNode.replaceChild(customNavbar, existingNavbar);
    } else {
        document.body.insertBefore(customNavbar, document.body.firstChild);
    }
};

const moveNavbarElements = (existingNavbar, customNavbar) => {
    const leftNav = customNavbar.querySelector('.navbar-nav.mr-auto');
    const rightNav = customNavbar.querySelector('.navbar-nav.ml-auto');

    const myCoursesDropdown = existingNavbar.querySelector('.nav-item.dropdown:has(a[title="My courses"])');
    if (myCoursesDropdown) {
        leftNav.insertBefore(myCoursesDropdown, leftNav.children[2]);
    }

    const languageMenu = existingNavbar.querySelector('.nav-item.dropdown:has(a[title="Language"])');
    if (languageMenu) rightNav.appendChild(languageMenu);

    existingNavbar.querySelectorAll('.popover-region').forEach(region => rightNav.appendChild(region));

    const userMenuItem = existingNavbar.querySelector('.usermenu');
    if (userMenuItem) rightNav.appendChild(userMenuItem);
};

// Theme Management Functions
const applyDarkMode = (darkMode) => {
    document.body.classList.toggle('dark-mode', darkMode);
    reloadCSS();
};

const toggleCustomNavbar = (enable) => {
    const existingCustomNavbar = document.querySelector('.custom-navbar');
    const existingDefaultNavbar = document.querySelector('.navbar:not(.custom-navbar)');

    if (enable) {
        if (!existingCustomNavbar) injectCustomNavbar();
        if (existingDefaultNavbar) existingDefaultNavbar.style.display = 'none';
    } else {
        if (existingCustomNavbar) existingCustomNavbar.remove();
        if (existingDefaultNavbar) existingDefaultNavbar.style.display = '';
    }
};

// Event Listeners and Observers
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    if (request.action === "reloadCSS") {
        reloadCSS();
    } else if (request.action === "updateTheme") {
        applyDarkMode(request.darkMode);
        toggleCustomNavbar(request.customNavbar);
    }
});

const observeDOMChanges = () => {
    const observer = new MutationObserver((mutations) => {
        chrome.storage.sync.get(['darkMode', 'customNavbar'], (result) => {
            if (result.darkMode) {
                mutations.forEach((mutation) => {
                    if (mutation.type === 'childList') {
                        mutation.addedNodes.forEach((node) => {
                            if (node.nodeType === Node.ELEMENT_NODE) {
                                node.classList.add('dark-mode-element');
                            }
                        });
                    }
                });
            }
            if (result.customNavbar && !document.querySelector('.custom-navbar')) {
                injectCustomNavbar();
            }
        });
    });

    observer.observe(document.body, { childList: true, subtree: true });
};

// Initialization
const init = () => {
    loadCSS('/src/css/styles.css');
    chrome.storage.sync.get(['darkMode', 'customNavbar'], (result) => {
        if (result.darkMode) document.body.classList.add('dark-mode');
        if (result.customNavbar) injectCustomNavbar();
    });
    observeDOMChanges();
};

init();
}