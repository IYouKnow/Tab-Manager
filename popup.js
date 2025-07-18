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
  const settingsBtn = document.getElementById('settingsBtn');
  const settingsPage = document.getElementById('settingsPage');
  const mainContent = document.getElementById('mainContent');
  const backBtn = document.getElementById('backBtn');
  // Settings elements (always inside settingsPage)
  const openWithDelay = document.getElementById('openWithDelay');
  const delayInput = document.getElementById('delayInput');
  const themeToggle = document.getElementById('themeToggle');
  const batchSizeInput = document.getElementById('batchSizeInput');
  const openInBackground = document.getElementById('openInBackground');
  
  console.log('Elements found:', {
    saveTabsBtn: !!saveTabsBtn,
    openTabsBtn: !!openTabsBtn,
    saveStatus: !!saveStatus,
    openStatus: !!openStatus,
    settingsBtn: !!settingsBtn,
    settingsPage: !!settingsPage,
    mainContent: !!mainContent,
    backBtn: !!backBtn,
    delayInput: !!delayInput,
    themeToggle: !!themeToggle,
    batchSizeInput: !!batchSizeInput,
    openInBackground: !!openInBackground,
    // Removed openDiscarded from log
  });
  
  if (!saveTabsBtn || !openTabsBtn || !saveStatus || !openStatus || !settingsBtn || !settingsPage || !mainContent || !backBtn || !delayInput || !themeToggle || !batchSizeInput || !openInBackground) {
    console.error('Required elements not found:', {
      saveTabsBtn: !!saveTabsBtn,
      openTabsBtn: !!openTabsBtn,
      saveStatus: !!saveStatus,
      openStatus: !!openStatus,
      settingsBtn: !!settingsBtn,
      settingsPage: !!settingsPage,
      mainContent: !!mainContent,
      backBtn: !!backBtn,
      delayInput: !!delayInput,
      themeToggle: !!themeToggle,
      batchSizeInput: !!batchSizeInput,
      openInBackground: !!openInBackground,
      // Removed openDiscarded from error log
    });
    return;
  }
  
  console.log('All elements found, attaching event listeners...');
  
  // Show settings page
  settingsBtn.addEventListener('click', () => {
    mainContent.style.display = 'none';
    settingsPage.style.display = 'block';
  });
  // Back to main content
  backBtn.addEventListener('click', () => {
    settingsPage.style.display = 'none';
    mainContent.style.display = 'block';
  });

  // Settings elements (now inside settingsPage)
  
  console.log('All elements found, attaching event listeners...');
  
  // Load settings from storage
  chrome.storage.local.get(['openWithDelay', 'delayInput', 'batchSize', 'openInBackground'], (data) => {
    if (typeof data.openWithDelay === 'boolean') openWithDelay.checked = data.openWithDelay;
    if (typeof data.delayInput === 'number') delayInput.value = data.delayInput;
    if (typeof data.batchSize === 'number') batchSizeInput.value = data.batchSize;
    if (typeof data.openInBackground === 'boolean') openInBackground.checked = data.openInBackground;
  });

  // Save settings on change
  openWithDelay.addEventListener('change', () => {
    chrome.storage.local.set({ openWithDelay: openWithDelay.checked });
  });
  delayInput.addEventListener('change', () => {
    const val = parseInt(delayInput.value, 10);
    chrome.storage.local.set({ delayInput: isNaN(val) ? 150 : val });
  });
  batchSizeInput.addEventListener('change', () => {
    const val = parseInt(batchSizeInput.value, 10);
    chrome.storage.local.set({ batchSize: isNaN(val) ? 5 : val });
  });
  openInBackground.addEventListener('change', () => {
    chrome.storage.local.set({ openInBackground: openInBackground.checked });
  });

  // Load theme from storage and apply
  chrome.storage.local.get(['theme'], (data) => {
    if (data.theme === 'light') {
      document.body.classList.add('light-theme');
      themeToggle.checked = false;
    } else {
      document.body.classList.remove('light-theme');
      themeToggle.checked = true;
    }
  });

  // Save theme on change
  themeToggle.addEventListener('change', () => {
    if (themeToggle.checked) {
      document.body.classList.remove('light-theme');
      chrome.storage.local.set({ theme: 'dark' });
    } else {
      document.body.classList.add('light-theme');
      chrome.storage.local.set({ theme: 'light' });
    }
  });

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
  const urlInput = document.getElementById('urlInput');
  const tabCountInfo = document.getElementById('tabCountInfo');
  // Update tab count when typing
  function updateTabCount() {
    const urls = urlInput.value.trim().split('\n').filter(url => url.trim() !== '');
    tabCountInfo.textContent = `Tabs to open: ${urls.length}`;
  }
  urlInput.addEventListener('input', updateTabCount);
  updateTabCount();

  // Remove empty lines on paste
  urlInput.addEventListener('paste', function(e) {
    setTimeout(() => {
      const lines = urlInput.value.split('\n').filter(line => line.trim() !== '');
      urlInput.value = lines.join('\n');
      updateTabCount();
    }, 0);
  });

  openTabsBtn.addEventListener('click', async () => {
    console.log('Open tabs button clicked');
    
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
    
    const openTabsInBackground = openInBackground && openInBackground.checked;

    if (openWithDelay && openWithDelay.checked) {
      // Get delay and batch size from input, default to 150ms and 5 if invalid
      let delay = parseInt(delayInput && delayInput.value, 10);
      if (isNaN(delay) || delay < 0) delay = 150;
      let batchSize = parseInt(batchSizeInput && batchSizeInput.value, 10);
      if (isNaN(batchSize) || batchSize < 1) batchSize = 5;
      // Open tabs in batches
      for (let i = 0; i < validUrls.length; i += batchSize) {
        const batch = validUrls.slice(i, i + batchSize);
        for (const url of batch) {
          chrome.tabs.create({ url: url, active: !openTabsInBackground });
        }
        if (i + batchSize < validUrls.length) {
          await new Promise(res => setTimeout(res, delay));
        }
      }
    } else {
      // Open all valid URLs at once (default browser behavior)
      validUrls.forEach(url => {
        chrome.tabs.create({ url: url, active: !openTabsInBackground });
      });
    }
    
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
