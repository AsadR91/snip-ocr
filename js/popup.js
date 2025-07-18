// js/popup.js
document.addEventListener('DOMContentLoaded', function() {
    const snipBtn = document.getElementById('snip-btn');
    const copyBtn = document.getElementById('copy-btn');
    const resultElem = document.getElementById('result');
    if (snipBtn) {
      snipBtn.onclick = () => {
        chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
          chrome.scripting.executeScript({
            target: {tabId: tabs[0].id},
            files: ['js/snip.js']
          });
        });
      };
    }
    if (copyBtn) {
      copyBtn.onclick = () => {
        const text = resultElem.textContent || '';
        if (text) {
          navigator.clipboard.writeText(text);
        }
      };
    }

    // On popup open, request the latest screenshot/snippet from background
    chrome.runtime.sendMessage({type: 'REQUEST_SNIP_SCREENSHOT'}, (snip) => {
      if (snip && snip.dataUrl) {
        cropImage(
          snip.dataUrl,
          snip.x,
          snip.y,
          snip.width,
          snip.height,
          snip.scrollX,
          snip.scrollY,
          snip.devicePixelRatio
        ).then(croppedDataUrl => {
          fetch('http://192.168.1.253:5000/process', {
            method: 'POST',
            headers: {'Content-Type': 'application/json'},
            body: JSON.stringify({imageData: croppedDataUrl})
          })
          .then(res => res.json())
          .then(result => {
            resultElem.textContent = result.full_text || 'No text found.';
            if (result.full_text) {
              navigator.clipboard.writeText(result.full_text).then(() => {
                chrome.runtime.sendMessage({type: 'SHOW_NOTIFICATION', text: 'Copied Successfully'});
              });
              chrome.runtime.sendMessage({type: 'SHOW_OVERLAY', text: result.full_text});
            }
          })
          .catch(err => {
            resultElem.textContent = 'Error: ' + err;
          });
        });
      }
    });

    // Listen for OCR result from background (optional, for future use)
    chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
      if (message.type === 'OCR_RESULT') {
        resultElem.textContent = message.text || 'No text found.';
      }
    });
});

// Cropping logic using DOM APIs
function cropImage(dataUrl, x, y, width, height, scrollX, scrollY, devicePixelRatio) {
  return new Promise((resolve) => {
    const img = new window.Image();
    img.onload = function() {
      const canvas = document.createElement('canvas');
      canvas.width = width * devicePixelRatio;
      canvas.height = height * devicePixelRatio;
      const ctx = canvas.getContext('2d');
      ctx.drawImage(
        img,
        (x + scrollX) * devicePixelRatio,
        (y + scrollY) * devicePixelRatio,
        width * devicePixelRatio,
        height * devicePixelRatio,
        0, 0,
        width * devicePixelRatio,
        height * devicePixelRatio
      );
      resolve(canvas.toDataURL('image/png'));
    };
    img.src = dataUrl;
  });
}