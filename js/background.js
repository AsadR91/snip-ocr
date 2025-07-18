// js/background.js

let lastSnip = null;

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.type === 'CAPTURE_SNIP') {
    chrome.tabs.captureVisibleTab(null, {format: 'png'}, (dataUrl) => {
      lastSnip = {
        dataUrl,
        x: message.x,
        y: message.y,
        width: message.width,
        height: message.height,
        scrollX: message.scrollX,
        scrollY: message.scrollY,
        devicePixelRatio: message.devicePixelRatio
      };
      // Store the tabId for later use
      lastSnip.tabId = sender.tab && sender.tab.id;
    });
  }
  if (message.type === 'REQUEST_SNIP_SCREENSHOT') {
    if (lastSnip) {
      sendResponse(lastSnip);
      lastSnip = null; // Clear after sending
    } else {
      sendResponse(null);
    }
    return true; // Indicate async response
  }
  if (message.type === 'SHOW_OVERLAY') {
    chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
      if (tabs[0]) {
        chrome.tabs.sendMessage(tabs[0].id, {type: 'SHOW_OCR_OVERLAY', text: message.text});
      }
    });
  }
  if (message.type === 'SHOW_NOTIFICATION') {
    chrome.notifications && chrome.notifications.create && chrome.notifications.create({
      type: 'basic',
      iconUrl: 'icon.png',
      title: 'OCR Result',
      message: 'Copied to Clipboard'
    });
  }
});