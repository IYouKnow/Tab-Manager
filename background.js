// Function to update the badge with current tab count
function updateTabCountBadge() {
  chrome.tabs.query({}, (tabs) => {
    const tabCount = tabs.length;
    console.log('Updating badge with tab count:', tabCount);
    
    // Set the badge text (number of tabs)
    chrome.action.setBadgeText({ text: tabCount.toString() });
    
    // Set badge background color based on tab count
    if (tabCount === 0) {
      chrome.action.setBadgeBackgroundColor({ color: '#6b7280' }); // Gray
    } else if (tabCount <= 5) {
      chrome.action.setBadgeBackgroundColor({ color: '#10b981' }); // Green
    } else if (tabCount <= 10) {
      chrome.action.setBadgeBackgroundColor({ color: '#f59e0b' }); // Yellow
    } else {
      chrome.action.setBadgeBackgroundColor({ color: '#ef4444' }); // Red
    }
  });
}

// Update badge when extension loads
updateTabCountBadge();

// Update badge when tabs are created, removed, or updated
chrome.tabs.onCreated.addListener(() => {
  updateTabCountBadge();
});

chrome.tabs.onRemoved.addListener(() => {
  updateTabCountBadge();
});

chrome.tabs.onUpdated.addListener(() => {
  updateTabCountBadge();
});

// Listen for messages from the popup
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  console.log('Background script received message:', request);
  
  if (request.action === "saveTabs") {
    console.log('Processing saveTabs action...');
    
    chrome.tabs.query({}, (tabs) => {
      console.log('Tabs query result:', tabs);
      
      if (tabs.length === 0) {
        console.log("No tabs open.");
        sendResponse({ success: false, message: "No tabs open." });
        return;
      }

      // Map tabs to extract their title and URL
      let tabData = tabs.map(tab => ({
        title: tab.title,
        url: tab.url
      }));

      console.log("Tabs Data Captured:", tabData);

      // Save tab data and timestamp to chrome storage
      const saveData = {
        tabs: tabData,
        lastSaved: new Date().toISOString()
      };
      
      console.log('Saving data to storage:', saveData);
      
      chrome.storage.local.set(saveData, () => {
        console.log("Tabs data saved to storage.");
        sendResponse({ success: true, tabs: tabData });
      });
    });
    
    // Return true to indicate we will send a response asynchronously
    return true;
  }
});
