let pinnedWindowId = null;

// Load the pinned window ID from storage if it exists (helpful for restarts)
chrome.storage.local.get(['pinnedWindowId'], (result) => {
    if (result.pinnedWindowId) {
        pinnedWindowId = result.pinnedWindowId;
    }
});

// Handle messages from popup
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    if (message.action === 'keepPopupOpen') {
        // Create a new window if not already created
        if (!pinnedWindowId) {
            chrome.windows.create({
                url: chrome.runtime.getURL('popup.html'),
                type: 'popup',
                width: 420,
                height: 600,
                focused: true
            }, (window) => {
                if (chrome.runtime.lastError) {
                    console.error(`Failed to create window: ${chrome.runtime.lastError.message}`);
                } else {
                    pinnedWindowId = window.id;

                    // Store the pinnedWindowId for persistence across browser restarts
                    chrome.storage.local.set({ pinnedWindowId: pinnedWindowId });
                }
            });
        } else {
            // If already open, just focus the window
            chrome.windows.update(pinnedWindowId, { focused: true }, () => {
                if (chrome.runtime.lastError) {
                    console.error(`Failed to focus window: ${chrome.runtime.lastError.message}`);
                }
            });
        }
    } else if (message.action === 'closePopup') {
        // Close the pinned window if it exists
        if (pinnedWindowId) {
            chrome.windows.remove(pinnedWindowId, () => {
                if (chrome.runtime.lastError) {
                    console.error(`Failed to remove window: ${chrome.runtime.lastError.message}`);
                } else {
                    pinnedWindowId = null;

                    // Remove from storage
                    chrome.storage.local.remove('pinnedWindowId');
                }
            });
        }
    } else if (message.action === 'checkPinned') {
        sendResponse({ isPinned: pinnedWindowId !== null });
        return true; // Keeps the sendResponse valid asynchronously
    }
});

// Clean up if the pinned window is closed by the user manually
chrome.windows.onRemoved.addListener((windowId) => {
    if (windowId === pinnedWindowId) {
        pinnedWindowId = null;

        // Remove from storage since the window is now closed
        chrome.storage.local.remove('pinnedWindowId');
    }
});
