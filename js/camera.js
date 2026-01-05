// ========================================================================
// CAMERA SYSTEM
// ========================================================================

// Camera variables
let cameraStream = null;
let cameraVideoElement = null;
let isCameraOpen = false;

async function openCamera() {
    // Close any existing camera
    closeCamera();
    
    const statusEl = document.getElementById('voiceStatus');
    if (statusEl) {
        statusEl.textContent = '📷 Opening camera...';
        statusEl.style.color = '#60a5fa';
    }
    
    try {
        // Request camera access
        cameraStream = await navigator.mediaDevices.getUserMedia({ 
            video: { 
                width: { ideal: 640 },
                height: { ideal: 480 },
                facingMode: 'user' // Front camera
            },
            audio: false 
        });
        
        // Create popup overlay
        const overlay = document.createElement('div');
        overlay.id = 'cameraPopup';
        overlay.style.cssText = `
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background: rgba(0, 0, 0, 0.85);
            display: flex;
            justify-content: center;
            align-items: center;
            z-index: 9999;
        `;
        
        // Create camera container
        const cameraContainer = document.createElement('div');
        cameraContainer.style.cssText = `
            background: #111;
            padding: 20px;
            border-radius: 16px;
            box-shadow: 0 10px 40px rgba(0, 0, 0, 0.5);
            text-align: center;
            max-width: 90%;
            max-height: 90%;
        `;
        
        // Create title
        const title = document.createElement('p');
        title.textContent = '📷 Camera';
        title.style.cssText = `
            margin-bottom: 15px;
            font-size: 1.2rem;
            color: #fff;
            font-weight: bold;
        `;
        
        // Create video element for camera feed
        cameraVideoElement = document.createElement('video');
        cameraVideoElement.srcObject = cameraStream;
        cameraVideoElement.autoplay = true;
        cameraVideoElement.playsInline = true;
        cameraVideoElement.muted = true; // Mute to prevent feedback
        cameraVideoElement.style.cssText = `
            max-width: 640px;
            max-height: 480px;
            border-radius: 12px;
            width: 100%;
            transform: scaleX(-1); /* Mirror the camera */
        `;
        
        // Create close button
        const closeBtn = document.createElement('button');
        closeBtn.textContent = '✕ Close Camera';
        closeBtn.style.cssText = `
            margin-top: 15px;
            padding: 10px 20px;
            background: #ef4444;
            color: white;
            border: none;
            border-radius: 8px;
            cursor: pointer;
            font-size: 1rem;
            font-weight: bold;
        `;
        closeBtn.onclick = closeCamera;
        
        // Create hint
        const hint = document.createElement('p');
        hint.textContent = 'Say "Take photo" or "Close camera" to exit';
        hint.style.cssText = `
            margin-top: 10px;
            font-size: 0.85rem;
            color: #888;
        `;
        
        cameraContainer.appendChild(title);
        cameraContainer.appendChild(cameraVideoElement);
        cameraContainer.appendChild(closeBtn);
        cameraContainer.appendChild(hint);
        overlay.appendChild(cameraContainer);
        
        // Close on overlay click (not camera container)
        overlay.addEventListener('click', (e) => {
            if (e.target === overlay) {
                closeCamera();
            }
        });
        
        document.body.appendChild(overlay);
        isCameraOpen = true;
        
        if (statusEl) {
            statusEl.textContent = '📷 Camera is open! Say "Close camera" to close.';
            statusEl.style.color = '#4ade80';
        }
        
        // Play confirmation beep if function exists
        if (typeof playConfirmationBeep === 'function') {
            playConfirmationBeep('success');
        }
        console.log('Camera opened');
        
    } catch (error) {
        console.error('Error accessing camera:', error);
        if (statusEl) {
            statusEl.textContent = '📷 ❌ Camera access denied. Please check permissions.';
            statusEl.style.color = '#ef4444';
        }
        if (typeof playConfirmationBeep === 'function') {
            playConfirmationBeep('error');
        }
    }
}

function closeCamera() {
    const popup = document.getElementById('cameraPopup');
    
    // Stop all camera tracks
    if (cameraStream) {
        cameraStream.getTracks().forEach(track => track.stop());
        cameraStream = null;
    }
    
    if (cameraVideoElement) {
        cameraVideoElement.srcObject = null;
        cameraVideoElement = null;
    }
    
    if (popup) {
        popup.remove();
        isCameraOpen = false;
        
        const statusEl = document.getElementById('voiceStatus');
        if (statusEl) {
            statusEl.textContent = '📷 Camera closed.';
            statusEl.style.color = '#60a5fa';
        }
        
        if (typeof playConfirmationBeep === 'function') {
            playConfirmationBeep('success');
        }
        console.log('Camera closed');
    }
}

function takePhoto() {
    const statusEl = document.getElementById('voiceStatus');
    
    if (!cameraVideoElement || !isCameraOpen) {
        if (statusEl) {
            statusEl.textContent = '📷 Open camera first! Say "Open camera"';
            statusEl.style.color = '#fbbf24';
        }
        return;
    }
    
    try {
        // Create canvas to capture frame
        const canvas = document.createElement('canvas');
        canvas.width = cameraVideoElement.videoWidth;
        canvas.height = cameraVideoElement.videoHeight;
        
        // Draw current video frame onto canvas (flip to match mirror view)
        const ctx = canvas.getContext('2d');
        ctx.translate(canvas.width, 0);
        ctx.scale(-1, 1); // Mirror the image
        ctx.drawImage(cameraVideoElement, 0, 0);
        
        // Convert canvas to image URL
        const imageDataUrl = canvas.toDataURL('image/png');
        
        // Create download link
        const link = document.createElement('a');
        const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
        link.download = `photo-${timestamp}.png`;
        link.href = imageDataUrl;
        link.click();
        
        if (statusEl) {
            statusEl.textContent = '📸 Photo saved! Check your downloads.';
            statusEl.style.color = '#4ade80';
        }
        
        if (typeof playConfirmationBeep === 'function') {
            playConfirmationBeep('success');
        }
        console.log('Photo captured and downloaded');
        
    } catch (error) {
        console.error('Error taking photo:', error);
        if (statusEl) {
            statusEl.textContent = '❌ Error taking photo. Please try again.';
            statusEl.style.color = '#ef4444';
        }
        if (typeof playConfirmationBeep === 'function') {
            playConfirmationBeep('error');
        }
    }
}

