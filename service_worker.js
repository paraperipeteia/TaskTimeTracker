chrome.runtime.onInstalled.addListener(function() {
    // Do something after extension is installed
    console.log('Extension installed');
});

chrome.action.onClicked.addListener(function() {
    chrome.tabs.create({ url: 'index.html' });
});
