console.log('=== POPUP.JS LOADED ===');
console.log('Current timestamp:', new Date().toISOString());

// Wait for DOM to be fully loaded
document.addEventListener('DOMContentLoaded', () => {
  console.log('Popup DOM loaded, initializing...');
  
  // Check if all required elements exist
  const saveTabsBtn = document.getElementById('saveTabsBtn');
  const openTabsBtn = document.getElementById('openTabsBtn');
  const saveStatus = document.getElementById('saveStatus');
  const openStatus = document.getElementById('openStatus');
  
  console.log('Elements found:', {
    saveTabsBtn: !!saveTabsBtn,
    openTabsBtn: !!openTabsBtn,
    saveStatus: !!saveStatus,
    openStatus: !!openStatus
  });
  
  if (!saveTabsBtn || !openTabsBtn || !saveStatus || !openStatus) {
    console.error('Required elements not found:', {
      saveTabsBtn: !!saveTabsBtn,
      openTabsBtn: !!openTabsBtn,
      saveStatus: !!saveStatus,
      openStatus: !!openStatus
    });
    return;
  }
  
  console.log('All elements found, attaching event listeners...');
  
  // Save tabs functionality
  saveTabsBtn.addEventListener('click', () => {
    console.log('Save tabs button clicked');
    
    console.log('Sending saveTabs message to background script...');
    
    chrome.runtime.sendMessage({ action: "saveTabs" }, (response) => {
      console.log('Received response from background script:', response);
      
      if (chrome.runtime.lastError) {
        console.error('Runtime error:', chrome.runtime.lastError);
        saveStatus.textContent = 'Error: ' + chrome.runtime.lastError.message;
        saveStatus.className = 'status error';
        saveStatus.style.display = 'block';
        return;
      }
      
      if (response && response.success) {
        saveStatus.textContent = `Successfully saved ${response.tabs.length} tabs! Opening Tab Manager...`;
        saveStatus.className = 'status success';
        saveStatus.style.display = 'block';
        
        // Automatically open the tab manager page
        chrome.tabs.create({
          url: chrome.runtime.getURL('tabmanager.html')
        });
        
        // Hide status after 3 seconds
        setTimeout(() => {
          saveStatus.style.display = 'none';
        }, 3000);
      } else {
        const errorMessage = response ? response.message : 'Unknown error';
        console.error('Failed to save tabs:', errorMessage);
        saveStatus.textContent = 'Failed to save tabs: ' + errorMessage;
        saveStatus.className = 'status error';
        saveStatus.style.display = 'block';
      }
    });
  });

  // Open tabs from URLs
  openTabsBtn.addEventListener('click', () => {
    console.log('Open tabs button clicked');
    const urlInput = document.getElementById('urlInput');
    const urls = urlInput.value.trim().split('\n').filter(url => url.trim() !== '');
    
    if (urls.length === 0) {
      openStatus.textContent = 'Please enter at least one URL';
      openStatus.className = 'status error';
      openStatus.style.display = 'block';
      return;
    }
    
    // Validate URLs
    const validUrls = [];
    const invalidUrls = [];
    
    urls.forEach(url => {
      const trimmedUrl = url.trim();
      if (trimmedUrl) {
        // Add protocol if missing
        let fullUrl = trimmedUrl;
        if (!trimmedUrl.startsWith('http://') && !trimmedUrl.startsWith('https://')) {
          fullUrl = 'https://' + trimmedUrl;
        }
        
        try {
          new URL(fullUrl);
          validUrls.push(fullUrl);
        } catch (e) {
          invalidUrls.push(trimmedUrl);
        }
      }
    });
    
    if (invalidUrls.length > 0) {
      openStatus.textContent = `Invalid URLs: ${invalidUrls.join(', ')}`;
      openStatus.className = 'status error';
      openStatus.style.display = 'block';
      return;
    }
    
    // Open all valid URLs
    validUrls.forEach(url => {
      chrome.tabs.create({ url: url });
    });
    
    openStatus.textContent = `Successfully opened ${validUrls.length} tabs!`;
    openStatus.className = 'status success';
    openStatus.style.display = 'block';
    
    // Clear the textarea
    urlInput.value = '';
    
    // Hide status after 3 seconds
    setTimeout(() => {
      openStatus.style.display = 'none';
    }, 3000);
  });
  
  console.log('Event listeners attached successfully');
});
