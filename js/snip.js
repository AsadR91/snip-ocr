// js/snip.js
if (!window.__snip_active) {
    window.__snip_active = true;
  
    const overlay = document.createElement('div');
    overlay.style.position = 'fixed';
    overlay.style.left = 0;
    overlay.style.top = 0;
    overlay.style.width = '100vw';
    overlay.style.height = '100vh';
    overlay.style.background = 'rgba(0,0,0,0.2)';
    overlay.style.zIndex = 999999;
    overlay.style.cursor = 'crosshair';
    document.body.appendChild(overlay);
  
    let startX, startY, endX, endY, selectionBox;
  
    function mouseDown(e) {
      startX = e.clientX;
      startY = e.clientY;
  
      selectionBox = document.createElement('div');
      selectionBox.style.position = 'fixed';
      selectionBox.style.border = '2px dashed #fff';
      selectionBox.style.background = 'rgba(255,255,255,0.2)';
      selectionBox.style.left = startX + 'px';
      selectionBox.style.top = startY + 'px';
      selectionBox.style.zIndex = 1000000;
      document.body.appendChild(selectionBox);
  
      overlay.addEventListener('mousemove', mouseMove);
      overlay.addEventListener('mouseup', mouseUp);
    }
  
    function mouseMove(e) {
      endX = e.clientX;
      endY = e.clientY;
      selectionBox.style.left = Math.min(startX, endX) + 'px';
      selectionBox.style.top = Math.min(startY, endY) + 'px';
      selectionBox.style.width = Math.abs(endX - startX) + 'px';
      selectionBox.style.height = Math.abs(endY - startY) + 'px';
    }
  
    function mouseUp(e) {
      overlay.removeEventListener('mousemove', mouseMove);
      overlay.removeEventListener('mouseup', mouseUp);
  
      const x = Math.min(startX, endX);
      const y = Math.min(startY, endY);
      const width = Math.abs(endX - startX);
      const height = Math.abs(endY - startY);
  
      document.body.removeChild(overlay);
      document.body.removeChild(selectionBox);
      window.__snip_active = false;
  
      chrome.runtime.sendMessage({
        type: 'CAPTURE_SNIP',
        x, y, width, height,
        scrollX: window.scrollX,
        scrollY: window.scrollY,
        devicePixelRatio: window.devicePixelRatio
      });
    }
  
    overlay.addEventListener('mousedown', mouseDown);
  }

// Listen for overlay display message from background
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.type === 'SHOW_OCR_OVERLAY') {
    // Remove any existing overlay
    const oldOverlay = document.getElementById('__ocr_result_overlay');
    if (oldOverlay) oldOverlay.remove();

    // Create overlay
    const overlay = document.createElement('div');
    overlay.id = '__ocr_result_overlay';
    overlay.style.position = 'fixed';
    overlay.style.bottom = '20px';
    overlay.style.right = '20px';
    overlay.style.background = 'rgba(0,0,0,0.85)';
    overlay.style.color = '#fff';
    overlay.style.padding = '16px 24px 16px 16px';
    overlay.style.borderRadius = '8px';
    overlay.style.zIndex = 10000001;
    overlay.style.maxWidth = '400px';
    overlay.style.fontSize = '16px';
    overlay.style.boxShadow = '0 2px 8px rgba(0,0,0,0.3)';
    overlay.style.display = 'flex';
    overlay.style.alignItems = 'flex-start';

    // Text
    const text = document.createElement('div');
    text.textContent = message.text;
    text.style.flex = '1';
    text.style.whiteSpace = 'pre-wrap';
    overlay.appendChild(text);

    // Close button
    const closeBtn = document.createElement('button');
    closeBtn.textContent = '×';
    closeBtn.style.marginLeft = '12px';
    closeBtn.style.background = 'transparent';
    closeBtn.style.color = '#fff';
    closeBtn.style.border = 'none';
    closeBtn.style.fontSize = '20px';
    closeBtn.style.cursor = 'pointer';
    closeBtn.onclick = () => overlay.remove();
    overlay.appendChild(closeBtn);

    document.body.appendChild(overlay);
  }
});