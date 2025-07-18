// Load saved tabs when page loads
document.addEventListener('DOMContentLoaded', () => {
  loadSavedTabs();
  setupModal();
  // Apply theme from storage
  chrome.storage.local.get(['theme'], (data) => {
    if (data.theme === 'light') {
      document.body.classList.add('light-theme');
    } else {
      document.body.classList.remove('light-theme');
    }
  });
});

// Load saved tabs from storage
function loadSavedTabs() {
  chrome.storage.local.get(['tabs'], (data) => {
    const savedUrlsTextarea = document.getElementById('savedUrls');
    const tabCountSpan = document.getElementById('tabCount');
    const clearBtn = document.getElementById('clearBtn');
    const hasTabs = data.tabs && data.tabs.length > 0;
    if (savedUrlsTextarea && tabCountSpan) {
      if (hasTabs) {
        // Format URLs for display (one per line)
        const urls = data.tabs.map(tab => tab.url).join('\n');
        savedUrlsTextarea.value = urls;
        tabCountSpan.textContent = data.tabs.length;
      } else {
        savedUrlsTextarea.value = '';
        tabCountSpan.textContent = '0';
      }
    }
    // Enable/disable the clear button
    if (clearBtn) {
      clearBtn.disabled = !hasTabs;
      clearBtn.style.opacity = hasTabs ? '1' : '0.5';
      clearBtn.style.cursor = hasTabs ? 'pointer' : 'not-allowed';
    }
  });
}

// Setup modal functionality
function setupModal() {
  const modal = document.getElementById('confirmModal');
  const cancelBtn = document.getElementById('cancelClear');
  const confirmBtn = document.getElementById('confirmClear');
  
  if (!modal || !cancelBtn || !confirmBtn) return;

  // Show modal function
  function showModal() {
    modal.style.display = 'flex';
  }
  
  // Hide modal function
  function hideModal() {
    modal.style.display = 'none';
  }
  
  // Cancel button
  cancelBtn.addEventListener('click', () => {
    hideModal();
  });
  
  // Confirm button
  confirmBtn.addEventListener('click', () => {
    chrome.storage.local.remove(['tabs', 'lastSaved'], () => {
      loadSavedTabs();
      showStatus('All saved tabs cleared', 'success');
    });
    hideModal();
  });
  
  // Close modal when clicking outside
  modal.addEventListener('click', (e) => {
    if (e.target === modal) {
      hideModal();
    }
  });
  
  // Close modal with Escape key
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && modal.style.display === 'flex') {
      hideModal();
    }
  });
  
  // Make showModal available globally
  window.showClearModal = showModal;
}

// Copy all URLs to clipboard
const copyBtn = document.getElementById('copyBtn');
if (copyBtn) {
  copyBtn.addEventListener('click', () => {
    const savedUrlsTextarea = document.getElementById('savedUrls');
    const statusDiv = document.getElementById('status');
    
    if (!savedUrlsTextarea || savedUrlsTextarea.value.trim() === '') {
      showStatus('No URLs to copy', 'error');
      return;
    }
    
    savedUrlsTextarea.select();
    savedUrlsTextarea.setSelectionRange(0, 99999); // For mobile devices
    
    try {
      document.execCommand('copy');
      showStatus('URLs copied to clipboard!', 'success');
    } catch (err) {
      // Fallback for modern browsers
      navigator.clipboard.writeText(savedUrlsTextarea.value).then(() => {
        showStatus('URLs copied to clipboard!', 'success');
      }).catch(() => {
        showStatus('Failed to copy URLs', 'error');
      });
    }
  });
}

// Refresh saved tabs
const refreshBtn = document.getElementById('refreshBtn');
if (refreshBtn) {
  refreshBtn.addEventListener('click', () => {
    // Save the currently open browser tabs
    chrome.tabs.query({}, (tabs) => {
      if (!tabs || tabs.length === 0) {
        showStatus('No tabs open to save', 'error');
        return;
      }
      let tabData = tabs.map(tab => ({
        title: tab.title,
        url: tab.url
      }));
      const saveData = {
        tabs: tabData,
        lastSaved: new Date().toISOString()
      };
      chrome.storage.local.set(saveData, () => {
        loadSavedTabs();
        showStatus('Saved and refreshed open tabs', 'success');
      });
    });
  });
}

// Clear saved tabs
const clearBtn = document.getElementById('clearBtn');
if (clearBtn) {
  clearBtn.addEventListener('click', () => {
    window.showClearModal();
  });
}

// Show status message
function showStatus(message, type, element = null) {
  const statusDiv = element || document.getElementById('status');
  if (!statusDiv) return;
  statusDiv.textContent = message;
  statusDiv.className = `status ${type}`;
  statusDiv.style.display = 'block';
  
  // Hide status after 3 seconds
  setTimeout(() => {
    statusDiv.style.display = 'none';
  }, 3000);
}

// Listen for storage changes to update the display
chrome.storage.onChanged.addListener((changes, namespace) => {
  if (namespace === 'local' && changes.tabs) {
    loadSavedTabs();
  }
}); 