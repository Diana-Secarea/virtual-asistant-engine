// ========================================================================
// MUSIC PLAYBACK SYSTEM
// ========================================================================

// Music playback variables
let audioSource;
let musicAudioElement;
let isMusicPlaying = false;
let currentMusicUrl = null;

// Clown music variables
let clownAudioSource;
let clownAudioElement;
let isClownPlaying = false;

// Audio context for music (will use shared audioContext from main.js if available)
let musicAudioContext = null;

function getAudioContext() {
    // Use shared audioContext from main.js if available, otherwise create new one
    if (typeof audioContext !== 'undefined' && audioContext) {
        return audioContext;
    }
    if (!musicAudioContext) {
        musicAudioContext = new (window.AudioContext || window.webkitAudioContext)();
    }
    return musicAudioContext;
}

async function playMusic() {
    // Stop any currently playing music
    stopMusic();
    stopClownMusic();
    
    if (isMusicPlaying) {
        const statusEl = document.getElementById('voiceStatus');
        if (statusEl) {
            statusEl.textContent = '🎵 Music is already playing!';
            statusEl.style.color = '#60a5fa';
        }
        return;
    }
    
    const audioContext = getAudioContext();
    
    try {
        // Update status
        const statusEl = document.getElementById('voiceStatus');
        if (statusEl) {
            statusEl.textContent = '🎵 Loading music...';
            statusEl.style.color = '#60a5fa';
        }
        
        // Use CORS-enabled audio URL (GitHub raw files work well)
        // Replace with your own CORS-enabled audio URL
        const audioUrl = 'https://raw.githubusercontent.com/mdn/webaudio-examples/main/audio-analyser/viper.mp3';
        currentMusicUrl = audioUrl;
        
        // Create HTML Audio element (handles CORS better)
        musicAudioElement = new Audio(audioUrl);
        musicAudioElement.crossOrigin = 'anonymous';
        musicAudioElement.volume = 0.5; // 50% volume
        
        // Wait for audio to load
        await new Promise((resolve, reject) => {
            musicAudioElement.oncanplaythrough = resolve;
            musicAudioElement.onerror = reject;
            musicAudioElement.load();
        });
        
        // Create MediaElementAudioSourceNode (still Web Audio API!)
        audioSource = audioContext.createMediaElementSource(musicAudioElement);
        
        // Create gain node for music volume control
        const musicGain = audioContext.createGain();
        musicGain.gain.value = 0.5; // 50% volume
        
        // Connect: audioSource -> gain -> speakers (Web Audio API graph)
        audioSource.connect(musicGain);
        musicGain.connect(audioContext.destination);
        
        // Handle when music ends
        musicAudioElement.onended = () => {
            isMusicPlaying = false;
            audioSource = null;
            musicAudioElement = null;
            currentMusicUrl = null;
            const statusEl = document.getElementById('voiceStatus');
            if (statusEl) {
                statusEl.textContent = '🎵 Music finished. Say "Play music" to play again.';
                statusEl.style.color = '#60a5fa';
            }
        };
        
        // Play the audio
        await musicAudioElement.play();
        isMusicPlaying = true;
        
        // Update status
        if (statusEl) {
            statusEl.textContent = '🎵 Music playing! Say "Stop music" to stop.';
            statusEl.style.color = '#4ade80';
        }
        
        // Play confirmation beep if function exists
        if (typeof playConfirmationBeep === 'function') {
            playConfirmationBeep('success');
        }
        
    } catch (error) {
        console.error('Error playing music:', error);
        const statusEl = document.getElementById('voiceStatus');
        if (statusEl) {
            statusEl.textContent = '❌ Error playing music. Please try again.';
            statusEl.style.color = '#ef4444';
        }
        if (typeof playConfirmationBeep === 'function') {
            playConfirmationBeep('error');
        }
        musicAudioElement = null;
    }
}

function stopMusic() {
    // Stop playlist if playing
    if (typeof stopPlaylist === 'function') {
        stopPlaylist();
    }
    
    if (musicAudioElement && isMusicPlaying) {
        try {
            musicAudioElement.pause();
            musicAudioElement.currentTime = 0;
            musicAudioElement = null;
            audioSource = null;
            isMusicPlaying = false;
            currentMusicUrl = null;
            
            const statusEl = document.getElementById('voiceStatus');
            if (statusEl) {
                statusEl.textContent = '⏹️ Music stopped. Say "Play music" to play again.';
                statusEl.style.color = '#60a5fa';
            }
            
            if (typeof playConfirmationBeep === 'function') {
                playConfirmationBeep('success');
            }
        } catch (error) {
            console.error('Error stopping music:', error);
        }
    }
}

// Helper functions for playlist integration
function getCurrentSongUrl() {
    return currentMusicUrl;
}

function setCurrentMusicElement(element, source) {
    // Stop previous music if playing
    if (musicAudioElement && isMusicPlaying) {
        try {
            musicAudioElement.pause();
            musicAudioElement.currentTime = 0;
        } catch (e) {}
    }
    
    musicAudioElement = element;
    audioSource = source;
    isMusicPlaying = true;
    if (element && element.src) {
        currentMusicUrl = element.src;
    }
}

async function bringClown() {
    // Stop any currently playing music
    stopMusic();
    stopClownMusic();
    
    if (isClownPlaying) {
        const statusEl = document.getElementById('voiceStatus');
        if (statusEl) {
            statusEl.textContent = '🤡 Clown is already here! 🎪';
            statusEl.style.color = '#fbbf24';
            statusEl.style.fontSize = '1.1rem';
        }
        return;
    }
    
    const audioContext = getAudioContext();
    
    try {
        // Update status with clown emojis
        const statusEl = document.getElementById('voiceStatus');
        if (statusEl) {
            statusEl.textContent = '🤡 Loading clown music... 🤡';
            statusEl.style.color = '#fbbf24';
            statusEl.style.fontSize = '1.1rem';
        }
        
        // Clown music from GitHub (CORS-enabled)
        clownAudioElement = new Audio();
        clownAudioElement.crossOrigin = 'anonymous';
        clownAudioElement.src = 'https://raw.githubusercontent.com/effacestudios/Royalty-Free-Music-Pack/master/THE%20CLOWN.mp3';
        clownAudioElement.volume = 0.5; // 50% volume
        
        // Wait for audio to load
        await new Promise((resolve, reject) => {
            clownAudioElement.oncanplaythrough = resolve;
            clownAudioElement.onerror = reject;
            clownAudioElement.load();
        });
        
        // Create MediaElementAudioSourceNode (still Web Audio API!)
        clownAudioSource = audioContext.createMediaElementSource(clownAudioElement);
        
        // Create gain node for music volume control
        const musicGain = audioContext.createGain();
        musicGain.gain.value = 0.5; // 50% volume
        
        // Connect: audioSource -> gain -> speakers (Web Audio API graph)
        clownAudioSource.connect(musicGain);
        musicGain.connect(audioContext.destination);
        
        // Handle when music ends
        clownAudioElement.onended = () => {
            isClownPlaying = false;
            clownAudioSource = null;
            clownAudioElement = null;
            // Hide clown popup when music ends
            hideClownPopup();
            const statusEl = document.getElementById('voiceStatus');
            if (statusEl) {
                statusEl.textContent = '🤡 Clown music finished! 🎪';
                statusEl.style.color = '#fbbf24';
                statusEl.style.fontSize = '1.1rem';
            }
        };
        
        // Play the audio
        await clownAudioElement.play();
        isClownPlaying = true;
        
        // Show clown popup
        showClownPopup();
        
        // Update status
        if (statusEl) {
            statusEl.textContent = '🤡 Clown music playing! Say "Stop clown" to stop. 🎪';
            statusEl.style.color = '#4ade80';
            statusEl.style.fontSize = '1.1rem';
        }
        
        // Play confirmation beep if function exists
        if (typeof playConfirmationBeep === 'function') {
            playConfirmationBeep('success');
        }
        
    } catch (error) {
        console.error('Error playing clown music:', error);
        const statusEl = document.getElementById('voiceStatus');
        if (statusEl) {
            statusEl.textContent = '🤡 ❌ Error loading clown music. Please try again.';
            statusEl.style.color = '#ef4444';
            statusEl.style.fontSize = '1.1rem';
        }
        if (typeof playConfirmationBeep === 'function') {
            playConfirmationBeep('error');
        }
        clownAudioElement = null;
    }
}

function stopClownMusic() {
    if (clownAudioElement && isClownPlaying) {
        try {
            clownAudioElement.pause();
            clownAudioElement.currentTime = 0;
            clownAudioElement = null;
            clownAudioSource = null;
            isClownPlaying = false;
            // Hide clown popup
            hideClownPopup();
        } catch (error) {
            console.error('Error stopping clown music:', error);
        }
    }
}

function adjustVolume(change) {
    // Get the currently playing audio element
    let currentAudio = null;
    if (isMusicPlaying && musicAudioElement) {
        currentAudio = musicAudioElement;
    } else if (isClownPlaying && clownAudioElement) {
        currentAudio = clownAudioElement;
    }
    
    const statusEl = document.getElementById('voiceStatus');
    
    if (!currentAudio) {
        if (statusEl) {
            statusEl.textContent = '🔇 No music is playing to adjust volume.';
            statusEl.style.color = '#fbbf24';
        }
        return;
    }
    
    // Adjust volume (clamp between 0 and 1)
    let newVolume = currentAudio.volume + change;
    newVolume = Math.max(0, Math.min(1, newVolume)); // Clamp to 0-1 range
    currentAudio.volume = newVolume;
    
    const volumePercent = Math.round(newVolume * 100);
    const volumeIcon = change > 0 ? '🔊' : '🔉';
    
    if (statusEl) {
        statusEl.textContent = `${volumeIcon} Volume: ${volumePercent}%`;
        statusEl.style.color = '#4ade80';
    }
    
    if (typeof playConfirmationBeep === 'function') {
        playConfirmationBeep('success');
    }
    console.log(`Volume adjusted to ${volumePercent}%`);
}

function setMusicMute(muted) {
    // Get the currently playing audio element
    let currentAudio = null;
    if (isMusicPlaying && musicAudioElement) {
        currentAudio = musicAudioElement;
    } else if (isClownPlaying && clownAudioElement) {
        currentAudio = clownAudioElement;
    }
    
    // Mute/unmute music if playing
    if (currentAudio) {
        currentAudio.muted = muted;
        return true; // Music was muted/unmuted
    }
    
    return false; // No music playing
}

function showClownPopup() {
    // Remove existing popup if any
    hideClownPopup();
    
    // Create popup overlay
    const overlay = document.createElement('div');
    overlay.id = 'clownPopup';
    overlay.style.cssText = `
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background: rgba(0, 0, 0, 0.7);
        display: flex;
        justify-content: center;
        align-items: center;
        z-index: 9999;
        cursor: pointer;
    `;
    
    // Create image container
    const imgContainer = document.createElement('div');
    imgContainer.style.cssText = `
        background: white;
        padding: 20px;
        border-radius: 16px;
        box-shadow: 0 10px 40px rgba(0, 0, 0, 0.5);
        text-align: center;
    `;
    
    // Create clown image
    const img = document.createElement('img');
    img.src = 'assets/clown_image.jpg';
    img.alt = 'Clown';
    img.style.cssText = `
        max-width: 300px;
        max-height: 300px;
        border-radius: 12px;
    `;
    
    // Create text
    const text = document.createElement('p');
    text.textContent = '🎪 The Clown is here! 🤡';
    text.style.cssText = `
        margin-top: 15px;
        font-size: 1.2rem;
        color: #333;
        font-weight: bold;
    `;
    
    // Create close hint
    const hint = document.createElement('p');
    hint.textContent = 'Click anywhere to close';
    hint.style.cssText = `
        margin-top: 8px;
        font-size: 0.9rem;
        color: #666;
    `;
    
    imgContainer.appendChild(img);
    imgContainer.appendChild(text);
    imgContainer.appendChild(hint);
    overlay.appendChild(imgContainer);
    
    // Close on click
    overlay.addEventListener('click', hideClownPopup);
    
    document.body.appendChild(overlay);
}

function hideClownPopup() {
    const popup = document.getElementById('clownPopup');
    if (popup) {
        popup.remove();
    }
}

