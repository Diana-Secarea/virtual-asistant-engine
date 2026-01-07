// ========================================================================
// VIDEO PLAYBACK SYSTEM
// ========================================================================

// Video popup variables
let videoElement = null;
let isVideoPlaying = false;

function playVideoPopup() {
    // Close any existing video popup
    closeVideoPopup();
    
    const statusEl = document.getElementById('voiceStatus');
    if (statusEl) {
        statusEl.textContent = '🎬 Loading video...';
        statusEl.style.color = '#60a5fa';
    }
    
    // Create popup overlay
    const overlay = document.createElement('div');
    overlay.id = 'videoPopup';
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
    
    // Create video container
    const videoContainer = document.createElement('div');
    videoContainer.style.cssText = `
        background: #111;
        padding: 20px;
        border-radius: 16px;
        box-shadow: 0 10px 40px rgba(0, 0, 0, 0.5);
        text-align: center;
        max-width: 90%;
        max-height: 90%;
    `;
    
    // Create video element
    videoElement = document.createElement('video');
    videoElement.src = 'https://mdn.github.io/learning-area/html/multimedia-and-embedding/video-and-audio-content/rabbit320.mp4';
    videoElement.controls = true;
    videoElement.autoplay = true;
    videoElement.style.cssText = `
        max-width: 640px;
        max-height: 480px;
        border-radius: 12px;
        width: 100%;
    `;
    
    // Create title
    const title = document.createElement('p');
    title.textContent = '🎬 Video Player';
    title.style.cssText = `
        margin-bottom: 15px;
        font-size: 1.2rem;
        color: #fff;
        font-weight: bold;
    `;
    
    // Create close button
    const closeBtn = document.createElement('button');
    closeBtn.textContent = '✕ Close Video';
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
    closeBtn.onclick = closeVideoPopup;
    
    // Create hint
    const hint = document.createElement('p');
    hint.textContent = 'Say "Stop video" or click Close to exit';
    hint.style.cssText = `
        margin-top: 10px;
        font-size: 0.85rem;
        color: #888;
    `;
    
    videoContainer.appendChild(title);
    videoContainer.appendChild(videoElement);
    videoContainer.appendChild(closeBtn);
    videoContainer.appendChild(hint);
    overlay.appendChild(videoContainer);
    
    // Close on overlay click (not video container)
    overlay.addEventListener('click', (e) => {
        if (e.target === overlay) {
            closeVideoPopup();
        }
    });
    
    document.body.appendChild(overlay);
    isVideoPlaying = true;
    
    // Update status when video plays
    videoElement.onplay = () => {
        if (statusEl) {
            statusEl.textContent = '🎬 Video playing! Say "Stop video" to close.';
            statusEl.style.color = '#4ade80';
        }
    };
    
    // Handle video end
    videoElement.onended = () => {
        if (statusEl) {
            statusEl.textContent = '🎬 Video finished!';
            statusEl.style.color = '#60a5fa';
        }
    };
    
    // Play confirmation beep if function exists
    if (typeof playConfirmationBeep === 'function') {
        playConfirmationBeep('success');
    }
}

function closeVideoPopup() {
    const popup = document.getElementById('videoPopup');
    if (popup) {
        // Stop video if playing
        if (videoElement) {
            videoElement.pause();
            videoElement.src = '';
            videoElement = null;
        }
        popup.remove();
        isVideoPlaying = false;
        
        const statusEl = document.getElementById('voiceStatus');
        if (statusEl) {
            statusEl.textContent = '🎬 Video closed.';
            statusEl.style.color = '#60a5fa';
        }
        
        if (typeof playConfirmationBeep === 'function') {
            playConfirmationBeep('success');
        }
    }
}

function restartVideo() {
    const statusEl = document.getElementById('voiceStatus');
    
    if (!videoElement || !isVideoPlaying) {
        if (statusEl) {
            statusEl.textContent = '🎬 No video is playing to restart.';
            statusEl.style.color = '#fbbf24';
        }
        return;
    }
    
    // Restart video from beginning
    videoElement.currentTime = 0;
    videoElement.play();
    
    if (statusEl) {
        statusEl.textContent = '🎬 Video restarted from the beginning!';
        statusEl.style.color = '#4ade80';
    }
    
    if (typeof playConfirmationBeep === 'function') {
        playConfirmationBeep('success');
    }
    console.log('Video restarted');
}





