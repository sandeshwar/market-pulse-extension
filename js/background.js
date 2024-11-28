// Handle messages from popup
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    if (message.action === 'keepPopupOpen') {
        // Keep the popup open
        chrome.action.setPopup({ popup: '' });
    } else if (message.action === 'closePopup') {
        // Restore default popup
        chrome.action.setPopup({ popup: 'popup.html' });
    }
});
