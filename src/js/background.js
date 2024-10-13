function updateExtensionState(tabId, url) {
    if (url && url.includes('elearning.ovgu.de')) {
      chrome.browserAction.enable(tabId);
    } else {
      chrome.browserAction.disable(tabId);
    }
  }
  
  chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
    if (changeInfo.status === 'complete') {
      updateExtensionState(tabId, tab.url);
    }
  });
  
  chrome.tabs.onActivated.addListener((activeInfo) => {
    chrome.tabs.get(activeInfo.tabId, (tab) => {
      updateExtensionState(tab.id, tab.url);
    });
  });
  
  // Initial state setup for all tabs
  chrome.tabs.query({}, (tabs) => {
    for (let tab of tabs) {
      updateExtensionState(tab.id, tab.url);
    }
  });
  
  // Prevent the popup from opening on non-OVGU pages
  chrome.browserAction.onClicked.addListener((tab) => {
    if (!tab.url.includes('elearning.ovgu.de')) {
      chrome.browserAction.disable(tab.id);
    }
  });