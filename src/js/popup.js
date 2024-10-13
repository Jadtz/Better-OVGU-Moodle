document.addEventListener('DOMContentLoaded', function() {
    const darkModeToggle = document.getElementById('darkModeToggle');
    const customNavbarToggle = document.getElementById('customNavbarToggle');
    const reloadCSSButton = document.getElementById('reloadCSS');

    // Load saved settings
    chrome.storage.sync.get(['darkMode', 'customNavbar'], function(result) {
        darkModeToggle.checked = result.darkMode || false;
        customNavbarToggle.checked = result.customNavbar || false;
    });

    // Function to apply changes
    function applyChanges(shouldReload = false) {
        const darkMode = darkModeToggle.checked;
        const customNavbar = customNavbarToggle.checked;
        chrome.storage.sync.set({darkMode: darkMode, customNavbar: customNavbar}, function() {
            chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
                if (shouldReload) {
                    chrome.tabs.reload(tabs[0].id);
                } else {
                    chrome.tabs.sendMessage(tabs[0].id, {
                        action: "updateTheme",
                        darkMode: darkMode,
                        customNavbar: customNavbar
                    });
                }
            });
        });
    }

    // Apply changes when dark mode toggle is switched
    darkModeToggle.addEventListener('change', () => applyChanges(false));

    // Apply changes and reload page when custom menu toggle is switched off
    customNavbarToggle.addEventListener('change', function() {
        applyChanges(!this.checked);
    });

    reloadCSSButton.addEventListener('click', function() {
        chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
            chrome.tabs.sendMessage(tabs[0].id, {action: "reloadCSS"});
        });
    });
});