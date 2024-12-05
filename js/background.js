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
        if (!pinnedWindowId) {
            // Get display information to properly position the window
            chrome.system.display.getInfo((displays) => {
                if (displays.length > 0) {
                    const primaryDisplay = displays[0];
                    const screenWidth = primaryDisplay.workArea.width;
                    const screenHeight = primaryDisplay.workArea.height;

                    // Calculate centered position
                    const width = 420;
                    const height = 600;
                    const left = Math.round((screenWidth - width) / 2);
                    const top = Math.round((screenHeight - height) / 2);

                    // Create the popup window with fixed dimensions
                    chrome.windows.create({
                        url: chrome.runtime.getURL('popup.html?pinned=true'),
                        type: 'popup',
                        width: width,
                        height: height,
                        left: left,
                        top: top,
                        focused: true
                    }, (window) => {
                        if (chrome.runtime.lastError) {
                            console.error(`Failed to create window: ${chrome.runtime.lastError.message}`);
                        } else {
                            pinnedWindowId = window.id;
                            // Ensure window is not fullscreen
                            chrome.windows.update(pinnedWindowId, { state: 'normal' });
                            // Store the pinnedWindowId for persistence
                            chrome.storage.local.set({ pinnedWindowId: pinnedWindowId });
                        }
                    });
                }
            });
        } else {
            // If already open, just focus the window and ensure it's not fullscreen
            chrome.windows.update(pinnedWindowId, { 
                focused: true,
                state: 'normal',
                width: 420,
                height: 600
            }, () => {
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
        // Check if window still exists
        if (pinnedWindowId) {
            chrome.windows.get(pinnedWindowId, (window) => {
                if (chrome.runtime.lastError) {
                    // Window doesn't exist anymore
                    pinnedWindowId = null;
                    chrome.storage.local.remove('pinnedWindowId');
                    sendResponse({ isPinned: false });
                } else {
                    sendResponse({ isPinned: true });
                }
            });
        } else {
            sendResponse({ isPinned: false });
        }
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
