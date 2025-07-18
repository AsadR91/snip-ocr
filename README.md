### Snip OCR Extension

A luxurious, modern Chrome extension to snip any region of your browser, extract text using your own local OCR server, and instantly copy the result to your clipboard.  
Features a premium UI, floating overlay, and robust Linux server setup.

---

## ✨ Features

- **Snip any region** of your browser window and extract text instantly.
- **Modern, elegant UI** with glassmorphism and gold accents.
- **Result shown as a floating overlay** on the page, in the popup, and copied to your clipboard.
- **Automatic notifications** for successful copy.
- **Works with your own local OCR server** for privacy and speed.

---

## 🚀 Getting Started

### 1. Clone the Repository

```
git clone https://github.com/AsadR91/snip-ocr.git
cd textgrab-revised
```

---

### 2. Set Up the Local OCR Server (Linux)

The extension expects an OCR server running at `http://localhost:5000/process` that accepts a POST request with a base64 image and returns JSON with a `full_text` field.

#### **A. Install Dependencies**

```
sudo apt update
sudo apt install tesseract-ocr
pip install flask pillow pytesseract
```

#### **B. Create the OCR Server Script**

Create a file named `ocr_server.py` in your project directory:

```
from flask import Flask, request, jsonify
from PIL import Image
import pytesseract
import io
import base64

app = Flask(__name__)

@app.route('/process', methods=['POST'])
def process():
    data = request.get_json()
    image_data = data['imageData'].split(',')[1]
    image = Image.open(io.BytesIO(base64.b64decode(image_data)))
    text = pytesseract.image_to_string(image)
    return jsonify({'full_text': text.strip()})

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5000)
```

---

#### **C. Run the Server (Development/Quick Start)**

```
python3 ocr_server.py
```

---

#### **D. Run the Server as a systemd Service (Recommended for Production)**

1. **Create the service file:**

   ```
   sudo nano /etc/systemd/system/ocr_server.service
   ```

   Paste the following (update paths/user if needed):

   ```ini
   [Unit]
   Description=Local OCR Server for Snip OCR Extension
   After=network.target

   [Service]
   Type=simple
   User=darkmac
   WorkingDirectory=/home/darkmac/Documents/copypilot
   ExecStart=/usr/bin/python3 ocr_server.py
   Restart=on-failure

   [Install]
   WantedBy=multi-user.target
   ```

2. **Reload systemd and start the service:**

   ```
   sudo systemctl daemon-reload
   sudo systemctl start ocr_server
   ```

3. **Enable on boot:**

   ```
   sudo systemctl enable ocr_server
   ```

4. **Check status/logs:**

   ```
   sudo systemctl status ocr_server
   journalctl -u ocr_server -f
   ```

---

### 3. Load the Extension in Chrome

1. Go to `chrome://extensions/`
2. Enable **Developer mode** (top right)
3. Click **Load unpacked**
4. Select the `snip-ocr` folder

---

### 4. Usage

1. Click the extension icon to open the popup.
2. Click **Snip & Extract Text**.
3. Select a region on the page.
4. Click on the Extension to copy to clipboard (It does copy it automatically, but if it doesn't you have button to do that.)
5. The recognized text will:
    - Appear as a **floating overlay** on the page (with a close button)
    - Be **copied to your clipboard** automatically
    - Be shown in the **popup** (with a “Copy to Clipboard” button for convenience)
    - Trigger a **notification**: “Copied to Clipboard”

---

### 5. Troubleshooting

- **OCR not working?**
  - Make sure your OCR server is running and accessible at `http://localhost:5000/process`.
  - Refresh the browser. 
  - Check the browser console for errors.
- **Clipboard not working?**
  - Make sure the popup is open and focused when snipping.
- **Notification not showing?**
  - Make sure you have notification permissions enabled in Chrome.

---


## 📝 License

MIT

---

If you have any questions or want to contribute, or have Suggestion feel free to open an issue or pull request!

---

