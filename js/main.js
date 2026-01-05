// Create stars dynamically
function createStars() {
    const starsContainer = document.getElementById('stars');
    const numStars = 50;
    
    for (let i = 0; i < numStars; i++) {
        const star = document.createElement('div');
        star.className = 'star';
        
        // Random size between 1-3px
        const size = Math.random() * 2 + 1;
        star.style.width = size + 'px';
        star.style.height = size + 'px';
        
        // Random position
        star.style.left = Math.random() * 100 + '%';
        star.style.top = Math.random() * 100 + '%';
        
        // Random animation duration
        star.style.animationDuration = (Math.random() * 2 + 1) + 's';
        
        starsContainer.appendChild(star);
    }
}

// this  is page navigation
function showPage(pageId) {
    // Cleanup voice assistant when leaving the page
    const currentPage = document.querySelector('.page.active');
    if (currentPage && currentPage.id === 'voiceAssistantPage' && pageId !== 'voiceAssistantPage') {
        if (isListening) {
            isListening = false;
            stopMicrophoneCapture();
            const btn = document.getElementById('startVoiceBtn');
            if (btn) {
                btn.textContent = 'Start Listening';
                btn.classList.remove('active');
            }
        }
        if (animationFrameId) {
            cancelAnimationFrame(animationFrameId);
            animationFrameId = null;
        }
    }
    
    // Hide all pages
    document.querySelectorAll('.page').forEach(page => {
        page.classList.remove('active');
    });
    
    // Show selected page
    document.getElementById(pageId).classList.add('active');
    
    // Initialize voice canvas if voice assistant page is shown
    if (pageId === 'voiceAssistantPage') {
        initVoiceCanvas();
    }
}

// 
//
// Flow:
// 1. getUserMedia() -> Get microphone access
// 2. MediaStreamSource -> Connect microphone to Web Audio API
// 3. AnalyserNode -> Perform FFT analysis on audio data
// 4. getByteFrequencyData() -> Get frequency data (0-255 per frequency bin)
// 5. Canvas visualization -> Draw real-time audio visualization
// ========================================================================

// Canvas and animation variables
let voiceCanvas, voiceCtx;
let isListening = false;
let animationFrameId;
let time = 0;

// Web Audio API variables
let audioContext;
let analyser;
let microphone;
let gainNode;
let dataArray;
let timeDataArray;
let bufferLength;
let mediaStream;

// Speech Recognition variables
let recognition;
let isRecognizing = false;



function initVoiceCanvas() {
    voiceCanvas = document.getElementById('voiceCanvas');
    if (!voiceCanvas) return;
    
    voiceCtx = voiceCanvas.getContext('2d');
    
    // Set canvas size
    function resizeCanvas() {
        const rect = voiceCanvas.getBoundingClientRect();
        voiceCanvas.width = rect.width;
        voiceCanvas.height = rect.height;
    }
    
    resizeCanvas();
    
    // Handle window resize
    window.addEventListener('resize', resizeCanvas);
    
    // Start animation
    if (animationFrameId) {
        cancelAnimationFrame(animationFrameId);
    }
    animateVoiceCanvas();
}

async function startMicrophoneCapture() {
    try {
        // Request microphone access
        mediaStream = await navigator.mediaDevices.getUserMedia({ 
            audio: {
                echoCancellation: true,
                noiseSuppression: true,
                autoGainControl: true
            } 
        });
        
        // Create Audio Context
        audioContext = new (window.AudioContext || window.webkitAudioContext)();
        
        // Create analyser node for FFT analysis
        analyser = audioContext.createAnalyser();
        analyser.fftSize = 512; // FFT size (power of 2)
        analyser.smoothingTimeConstant = 0.8; // Smoothing for visualization
        
        // Create gain node for volume control
        gainNode = audioContext.createGain();
        gainNode.gain.value = 1.0; // Default volume (100%)
        
        // Connect microphone to gain node, then to analyser
        microphone = audioContext.createMediaStreamSource(mediaStream);
        microphone.connect(gainNode);
        gainNode.connect(analyser);
        
        // Get frequency data array size
        bufferLength = analyser.frequencyBinCount;
        dataArray = new Uint8Array(bufferLength);
        timeDataArray = new Uint8Array(bufferLength);
        
        // Setup volume slider
        setupVolumeControl();
        
        // Start speech recognition
        startSpeechRecognition();
        
        // Update status
        const statusEl = document.getElementById('voiceStatus');
        if (statusEl) {
            statusEl.textContent = '✅ Microphone connected! Say "Play music" to start...';
            statusEl.style.color = '#4ade80';
        }
        
        console.log('Microphone capture started successfully');
        return true;
    } catch (error) {
        console.error('Error accessing microphone:', error);
        
        // Update status
        const statusEl = document.getElementById('voiceStatus');
        if (statusEl) {
            statusEl.textContent = '❌ Microphone access denied. Please check permissions.';
            statusEl.style.color = '#ef4444';
        }
        
        alert('Could not access microphone. Please check permissions.');
        return false;
    }
}

function stopMicrophoneCapture() {
    if (mediaStream) {
        mediaStream.getTracks().forEach(track => track.stop());
        mediaStream = null;
    }
    
    if (microphone) {
        microphone.disconnect();
        microphone = null;
    }
    
    if (gainNode) {
        gainNode.disconnect();
        gainNode = null;
    }
    
    if (audioContext) {
        audioContext.close();
        audioContext = null;
    }
    
    analyser = null;
    dataArray = null;
    timeDataArray = null;
    
    // Stop speech recognition
    stopSpeechRecognition();
    
    // Stop music if playing
    if (typeof stopMusic === 'function') {
        stopMusic();
    }
    if (typeof stopClownMusic === 'function') {
        stopClownMusic();
    }
    
    // Hide volume control
    const volumeControl = document.getElementById('volumeControl');
    if (volumeControl) {
        volumeControl.style.display = 'none';
    }
    
    // Update status
    const statusEl = document.getElementById('voiceStatus');
    if (statusEl) {
        statusEl.textContent = 'Microphone stopped. Ready to capture audio...';
        statusEl.style.color = 'var(--text-gray)';
    }
    
    console.log('Microphone capture stopped');
}

function animateVoiceCanvas() {
    if (!voiceCanvas || !voiceCtx) return;
    
    const width = voiceCanvas.width;
    const height = voiceCanvas.height;
    const centerX = width / 2;
    const centerY = height / 2;
    
    // Clear canvas
    voiceCtx.fillStyle = 'rgba(0, 0, 0, 0.1)';
    voiceCtx.fillRect(0, 0, width, height);
    
    // Draw gradient background
    const gradient = voiceCtx.createRadialGradient(centerX, centerY, 0, centerX, centerY, Math.max(width, height) / 2);
    gradient.addColorStop(0, 'rgba(140, 10, 34, 0.3)');
    gradient.addColorStop(0.5, 'rgba(139, 0, 0, 0.2)');
    gradient.addColorStop(1, 'rgba(0, 0, 0, 0.5)');
    voiceCtx.fillStyle = gradient;
    voiceCtx.fillRect(0, 0, width, height);
    
    // Get audio data from FFT if listening
    let audioData = null;
    let averageVolume = 0;
    
    if (isListening && analyser && dataArray && timeDataArray) {
        // Get frequency data (FFT result)
        analyser.getByteFrequencyData(dataArray);
        audioData = Array.from(dataArray);
        
        // Get time domain data (waveform)
        analyser.getByteTimeDomainData(timeDataArray);
        
        // Calculate average volume
        const sum = audioData.reduce((a, b) => a + b, 0);
        averageVolume = sum / audioData.length;
        
        // Update status display
        const statusEl = document.getElementById('voiceStatus');
        if (statusEl) {
            const volumePercent = Math.round((averageVolume / 255) * 100);
            const maxFreq = Math.max(...audioData);
            const statusColor = volumePercent > 50 ? 'var(--accent-red)' : 'var(--text-white)';
            statusEl.style.color = statusColor;
            statusEl.textContent = `🎤 Listening... | Volume: ${volumePercent}% | Max Frequency: ${maxFreq}`;
        }
    }
    
    // Draw microphone icon in center with dynamic size based on volume
    const micSize = isListening ? 80 + (averageVolume / 255) * 40 : 60;
    drawMicrophone(centerX, centerY, micSize);
    
    // Draw sound waves with real audio data
    if (isListening && audioData) {
        drawRealTimeSoundWaves(centerX, centerY, width, height, audioData, averageVolume);
        // Draw time domain waveform at the bottom
        if (timeDataArray) {
            drawTimeDomainWaveform(centerX, centerY, width, height, timeDataArray);
        }
    }
    
    time += 0.05;
    animationFrameId = requestAnimationFrame(animateVoiceCanvas);
}

function drawMicrophone(x, y, size) {
    voiceCtx.save();
    
    // Microphone body
    const bodyWidth = size * 0.4;
    const bodyHeight = size * 0.6;
    const bodyX = x - bodyWidth / 2;
    const bodyY = y - bodyHeight / 2;
    
    // Outer glow
    const glowGradient = voiceCtx.createRadialGradient(x, y, 0, x, y, size);
    glowGradient.addColorStop(0, isListening ? 'rgba(140, 10, 34, 0.8)' : 'rgba(140, 10, 34, 0.4)');
    glowGradient.addColorStop(1, 'rgba(140, 10, 34, 0)');
    voiceCtx.fillStyle = glowGradient;
    voiceCtx.beginPath();
    voiceCtx.arc(x, y, size, 0, Math.PI * 2);
    voiceCtx.fill();
    
    // Microphone circle
    voiceCtx.strokeStyle = isListening ? '#ffffff' : 'rgba(255, 255, 255, 0.8)';
    voiceCtx.lineWidth = 4;
    voiceCtx.beginPath();
    voiceCtx.arc(x, y, size * 0.5, 0, Math.PI * 2);
    voiceCtx.stroke();
    
    // Microphone body (rectangle)
    voiceCtx.fillStyle = isListening ? '#ffffff' : 'rgba(255, 255, 255, 0.9)';
    voiceCtx.fillRect(bodyX, bodyY, bodyWidth, bodyHeight);
    
    // Microphone stand
    const standWidth = size * 0.15;
    const standHeight = size * 0.3;
    voiceCtx.fillRect(x - standWidth / 2, y + bodyHeight / 2, standWidth, standHeight);
    
    // Microphone base
    const baseWidth = size * 0.6;
    const baseHeight = size * 0.1;
    voiceCtx.fillRect(x - baseWidth / 2, y + bodyHeight / 2 + standHeight, baseWidth, baseHeight);
    
    voiceCtx.restore();
}

function drawRealTimeSoundWaves(centerX, centerY, width, height, audioData, averageVolume) {
    voiceCtx.save();
    
    // Draw circular frequency bars based on FFT data
    const numBars = Math.min(audioData.length, 128); // Limit to 128 bars for performance
    const barRadius = 120;
    const maxBarLength = 100;
    
    for (let i = 0; i < numBars; i++) {
        const angle = (i / numBars) * Math.PI * 2;
        const barX = centerX + Math.cos(angle) * barRadius;
        const barY = centerY + Math.sin(angle) * barRadius;
        
       
        const amplitude = audioData[i] / 255;
        const barLength = amplitude * maxBarLength;
        
        const endX = centerX + Math.cos(angle) * (barRadius + barLength);
        const endY = centerY + Math.sin(angle) * (barRadius + barLength);
        
        
        const hue = 340; // this is Red hue
        const saturation = 80 + amplitude * 20;
        const lightness = 40 + amplitude * 40;
        
        const barGradient = voiceCtx.createLinearGradient(barX, barY, endX, endY);
        barGradient.addColorStop(0, `hsla(${hue}, ${saturation}%, ${lightness}%, 0.8)`);
        barGradient.addColorStop(1, `hsla(${hue}, ${saturation}%, ${lightness + 20}%, 0.3)`);
        
        voiceCtx.strokeStyle = barGradient;
        voiceCtx.lineWidth = 4;
        voiceCtx.lineCap = 'round';
        voiceCtx.beginPath();
        voiceCtx.moveTo(barX, barY);
        voiceCtx.lineTo(endX, endY);
        voiceCtx.stroke();
    }
  
    const numWaves = 3;
    for (let wave = 0; wave < numWaves; wave++) {
        const baseRadius = 150 + wave * 50;
        const volumeEffect = (averageVolume / 255) * 30;
        const radius = baseRadius + volumeEffect + Math.sin(time * 2 + wave) * 10;
        const opacity = (0.4 - wave * 0.1) * (averageVolume / 255);
        
        const waveGradient = voiceCtx.createRadialGradient(
            centerX, centerY, radius - 10,
            centerX, centerY, radius + 10
        );
        waveGradient.addColorStop(0, `rgba(255, 26, 77, ${opacity})`);
        waveGradient.addColorStop(0.5, `rgba(140, 10, 34, ${opacity * 0.7})`);
        waveGradient.addColorStop(1, `rgba(140, 10, 34, 0)`);
        
        voiceCtx.strokeStyle = waveGradient;
        voiceCtx.lineWidth = 3;
        voiceCtx.beginPath();
        voiceCtx.arc(centerX, centerY, radius, 0, Math.PI * 2);
        voiceCtx.stroke();
    }
    
    // Draw frequency spectrum as waveform
    voiceCtx.beginPath();
    voiceCtx.lineWidth = 3;
    voiceCtx.strokeStyle = 'rgba(255, 255, 255, 0.6)';
    
    const waveformRadius = 80;
    const samplesPerSegment = Math.floor(audioData.length / 64);
    
    for (let i = 0; i < 64; i++) {
        const angle = (i / 64) * Math.PI * 2;
        
       
        let sum = 0;
        for (let j = 0; j < samplesPerSegment; j++) {
            const index = i * samplesPerSegment + j;
            if (index < audioData.length) {
                sum += audioData[index];
            }
        }
        const avgAmplitude = (sum / samplesPerSegment) / 255;
        
        const radius = waveformRadius + avgAmplitude * 40;
        const x = centerX + Math.cos(angle) * radius;
        const y = centerY + Math.sin(angle) * radius;
        
        if (i === 0) {
            voiceCtx.moveTo(x, y);
        } else {
            voiceCtx.lineTo(x, y);
        }
    }
    
    voiceCtx.closePath();
    voiceCtx.stroke();
    
    voiceCtx.restore();
}

function drawTimeDomainWaveform(centerX, centerY, width, height, timeData) {
    voiceCtx.save();
    
    // Draw waveform at the bottom of canvas
    const waveformY = height - 80;
    const waveformHeight = 60;
    const sliceWidth = width / bufferLength;
    
    voiceCtx.strokeStyle = 'rgba(255, 26, 77, 0.8)';
    voiceCtx.lineWidth = 2;
    voiceCtx.beginPath();
    
    let x = 0;
    for (let i = 0; i < bufferLength; i++) {
        const v = timeData[i] / 128.0;
        const y = waveformY + (v * waveformHeight / 2);
        
        if (i === 0) {
            voiceCtx.moveTo(x, y);
        } else {
            voiceCtx.lineTo(x, y);
        }
        
        x += sliceWidth;
    }
    
    voiceCtx.stroke();
    
    // Draw center line
    voiceCtx.strokeStyle = 'rgba(255, 255, 255, 0.3)';
    voiceCtx.lineWidth = 1;
    voiceCtx.beginPath();
    voiceCtx.moveTo(0, waveformY);
    voiceCtx.lineTo(width, waveformY);
    voiceCtx.stroke();
    
    voiceCtx.restore();
}

function setupVolumeControl() {
    const volumeSlider = document.getElementById('volumeSlider');
    const volumeValue = document.getElementById('volumeValue');
    const volumeControl = document.getElementById('volumeControl');
    
    if (volumeSlider && volumeValue && volumeControl && gainNode) {
        volumeControl.style.display = 'flex';
        
        volumeSlider.addEventListener('input', (e) => {
            const value = parseFloat(e.target.value);
            const gainValue = value / 100; // Convert 0-200 to 0.0-2.0
            gainNode.gain.value = gainValue;
            volumeValue.textContent = Math.round(value) + '%';
        });
    }
}

function playConfirmationBeep(type = 'success') {
    if (!audioContext) return;
    
    try {
        const oscillator = audioContext.createOscillator();
        const gain = audioContext.createGain();
        
        oscillator.connect(gain);
        gain.connect(audioContext.destination);
        
        // Different frequencies for different types
        if (type === 'success') {
            oscillator.frequency.value = 440; // A4 note
            oscillator.type = 'sine';
        } else if (type === 'error') {
            oscillator.frequency.value = 220; // A3 note (lower)
            oscillator.type = 'sawtooth';
        } else if (type === 'start') {
            oscillator.frequency.value = 523.25; // C5 note
            oscillator.type = 'sine';
        }
        
        // Envelope for smooth sound
        const now = audioContext.currentTime;
        gain.gain.setValueAtTime(0, now);
        gain.gain.linearRampToValueAtTime(0.3, now + 0.01);
        gain.gain.exponentialRampToValueAtTime(0.01, now + 0.15);
        
        oscillator.start(now);
        oscillator.stop(now + 0.15);
    } catch (error) {
        console.error('Error playing beep:', error);
    }
}

function startSpeechRecognition() {
    // Check if browser supports Speech Recognition
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    
    if (!SpeechRecognition) {
        console.warn('Speech Recognition not supported in this browser');
        const statusEl = document.getElementById('voiceStatus');
        if (statusEl) {
            statusEl.textContent = '⚠️ Speech recognition not supported. Use Chrome/Edge for best experience.';
            statusEl.style.color = '#fbbf24';
        }
        return;
    }
    
    recognition = new SpeechRecognition();
    recognition.continuous = true;
    recognition.interimResults = false;
    recognition.lang = 'en-US';
    
    recognition.onstart = () => {
        isRecognizing = true;
        console.log('Speech recognition started');
    };
    
    recognition.onresult = (event) => {
        const lastResult = event.results[event.results.length - 1];
        const transcript = lastResult[0].transcript.trim().toLowerCase();
        
        console.log('Recognized:', transcript);
        
        // Update status with recognized command
        const statusEl = document.getElementById('voiceStatus');
        if (statusEl) {
            statusEl.textContent = `🎤 Heard: "${transcript}"`;
            statusEl.style.color = '#60a5fa';
        }
        
        // Process commands
        processVoiceCommand(transcript);
    };
    
    recognition.onerror = (event) => {
        console.error('Speech recognition error:', event.error);
        if (event.error === 'no-speech') {
            // This is normal, just means no speech detected yet
            return;
        }
        const statusEl = document.getElementById('voiceStatus');
        if (statusEl && event.error !== 'no-speech') {
            statusEl.textContent = `⚠️ Recognition error: ${event.error}`;
            statusEl.style.color = '#fbbf24';
        }
    };
    
    recognition.onend = () => {
        isRecognizing = false;
        // Restart recognition if still listening
        if (isListening) {
            try {
                recognition.start();
            } catch (error) {
                console.error('Error restarting recognition:', error);
            }
        }
    };
    
    try {
        recognition.start();
    } catch (error) {
        console.error('Error starting speech recognition:', error);
    }
}

function stopSpeechRecognition() {
    if (recognition && isRecognizing) {
        try {
            recognition.stop();
            isRecognizing = false;
        } catch (error) {
            console.error('Error stopping speech recognition:', error);
        }
    }
}

function processVoiceCommand(command) {
    // Normalize command - remove extra spaces and convert to lowercase
    const normalizedCommand = command.toLowerCase().trim();
    
    // Check for playlist commands first
    if (typeof parsePlaylistCommand === 'function') {
        if (parsePlaylistCommand(command)) {
            return;
        }
    }
    
    // Check for "play music" command
    if (normalizedCommand.includes('play music') || normalizedCommand.includes('play song')) {
        if (typeof playMusic === 'function') {
            playMusic();
        }
        return;
    }
    
    // Check for "stop music" command
    if (normalizedCommand.includes('stop music') || normalizedCommand.includes('stop song') || normalizedCommand.includes('pause music')) {
        if (typeof stopMusic === 'function') {
            stopMusic();
        }
        return;
    }
    
    // Check for "change background" command
    if (normalizedCommand.includes('change background') || normalizedCommand.includes('change the background')) {
        changeBackgroundToBlue();
        return;
    }
    
    // Check for "bring clown" command
    if (normalizedCommand.includes('bring clown') || normalizedCommand.includes('bring the clown')) {
        if (typeof bringClown === 'function') {
            bringClown();
        }
        return;
    }
    
    // Check for "stop clown" command
    if (normalizedCommand.includes('stop clown') || normalizedCommand.includes('stop the clown')) {
        if (typeof stopClownMusic === 'function') {
            stopClownMusic();
            const statusEl = document.getElementById('voiceStatus');
            if (statusEl) {
                statusEl.textContent = '🤡 Clown music stopped! 🎪';
                statusEl.style.color = '#60a5fa';
                statusEl.style.fontSize = '1.1rem';
            }
            if (typeof playConfirmationBeep === 'function') {
                playConfirmationBeep('success');
            }
        }
        return;
    }
    
    // Check for "volume up" command
    if (normalizedCommand.includes('volume up') || normalizedCommand.includes('turn up') || normalizedCommand.includes('louder')) {
        if (typeof adjustVolume === 'function') {
            adjustVolume(0.1);
        }
        return;
    }
    
    // Check for "volume down" command
    if (normalizedCommand.includes('volume down') || normalizedCommand.includes('turn down') || normalizedCommand.includes('quieter') || normalizedCommand.includes('lower')) {
        if (typeof adjustVolume === 'function') {
            adjustVolume(-0.1);
        }
        return;
    }
    
    // Check for "mute" command
    if (normalizedCommand.includes('mute') && !normalizedCommand.includes('unmute')) {
        setMute(true);
        return;
    }
    
    // Check for "unmute" command
    if (normalizedCommand.includes('unmute')) {
        setMute(false);
        return;
    }
    
    // Check for "play video" command
    if (normalizedCommand.includes('play video') || normalizedCommand.includes('show video')) {
        if (typeof playVideoPopup === 'function') {
            playVideoPopup();
        }
        return;
    }
    
    // Check for "stop video" or "close video" command
    if (normalizedCommand.includes('stop video') || normalizedCommand.includes('close video')) {
        if (typeof closeVideoPopup === 'function') {
            closeVideoPopup();
        }
        return;
    }
    
    // Check for "restart video" command
    if (normalizedCommand.includes('restart video') || normalizedCommand.includes('start video over')) {
        if (typeof restartVideo === 'function') {
            restartVideo();
        }
        return;
    }
    
    // Check for "open camera" command
    if (normalizedCommand.includes('open camera') || normalizedCommand.includes('show camera') || normalizedCommand.includes('start camera')) {
        if (typeof openCamera === 'function') {
            openCamera();
        }
        return;
    }
    
    // Check for "close camera" command
    if (normalizedCommand.includes('close camera') || normalizedCommand.includes('stop camera') || normalizedCommand.includes('turn off camera')) {
        if (typeof closeCamera === 'function') {
            closeCamera();
        }
        return;
    }
    
    // Check for "take photo" command
    if (normalizedCommand.includes('take photo') || normalizedCommand.includes('take picture') || normalizedCommand.includes('capture')) {
        if (typeof takePhoto === 'function') {
            takePhoto();
        }
        return;
    }
    
        // Check for "stop reminder" command
        if (normalizedCommand.includes('stop reminder') || 
            normalizedCommand.includes('cancel reminder') ||
            normalizedCommand.includes('clear reminder')) {
            if (typeof parseStopReminder === 'function') {
                parseStopReminder(normalizedCommand);
            }
            return;
        }
        
        // Check for "set reminder" command
        // Format: "set reminder to [message] in [number] [seconds/minutes/hours]"
        if (normalizedCommand.includes('set reminder') || normalizedCommand.includes('remind me')) {
            if (typeof parseAndSetReminder === 'function') {
                parseAndSetReminder(normalizedCommand);
            }
            return;
        }
    
    // You can add more commands here in the future
    // For now, show that command was not recognized
    const statusEl = document.getElementById('voiceStatus');
    if (statusEl) {
        statusEl.textContent = `❓ Try: "Set reminder to...", "Play music", "Open camera"`;
        statusEl.style.color = '#fbbf24';
    }
}

function changeBackgroundToBlue() {
    try {
        // Change body background to blue
        const body = document.body;
        body.style.background = 'linear-gradient(135deg, #1e3a8a 0%, #3b82f6 50%, #60a5fa 100%)';
        body.style.backgroundSize = '400% 400%';
        body.style.animation = 'gradientShift 15s ease infinite';
        
        // Update status
        const statusEl = document.getElementById('voiceStatus');
        if (statusEl) {
            statusEl.textContent = '🎨 Background changed to blue!';
            statusEl.style.color = '#60a5fa';
        }
        
        // Play confirmation beep
        playConfirmationBeep('success');
        
        console.log('Background changed to blue');
    } catch (error) {
        console.error('Error changing background:', error);
        const statusEl = document.getElementById('voiceStatus');
        if (statusEl) {
            statusEl.textContent = '❌ Error changing background.';
            statusEl.style.color = '#ef4444';
        }
        playConfirmationBeep('error');
    }
}

function setMute(muted) {
    const statusEl = document.getElementById('voiceStatus');
    
    // Mute/unmute reminders
    if (typeof setRemindersMute === 'function') {
        setRemindersMute(muted);
    }
    
    // Mute/unmute music if playing
    const musicMuted = typeof setMusicMute === 'function' ? setMusicMute(muted) : false;
    
    if (statusEl) {
        if (muted) {
            if (musicMuted) {
                statusEl.textContent = '🔇 Music and reminders muted!';
            } else {
                statusEl.textContent = '🔇 Reminders muted!';
            }
            statusEl.style.color = '#60a5fa';
        } else {
            if (musicMuted) {
                statusEl.textContent = '🔊 Music and reminders unmuted!';
            } else {
                statusEl.textContent = '🔊 Reminders unmuted!';
            }
            statusEl.style.color = '#4ade80';
        }
    }
    
    if (typeof playConfirmationBeep === 'function') {
        playConfirmationBeep('success');
    }
    console.log(`Music and reminders ${muted ? 'muted' : 'unmuted'}`);
}



async function toggleVoiceRecognition() {
    const btn = document.getElementById('startVoiceBtn');
    
    if (!isListening) {
        // Start listening
        btn.disabled = true;
        btn.textContent = 'Initializing...';
        
        const success = await startMicrophoneCapture();
        
        if (success) {
            isListening = true;
            btn.textContent = 'Stop Listening';
            btn.classList.add('active');
            // Play start confirmation beep
            playConfirmationBeep('start');
        } else {
            btn.textContent = 'Start Listening';
            // Play error beep
            playConfirmationBeep('error');
        }
        
        btn.disabled = false;
    } else {
        // Stop listening
        isListening = false;
        stopMicrophoneCapture();
        btn.textContent = 'Start Listening';
        btn.classList.remove('active');
        // Play stop confirmation beep
        playConfirmationBeep('success');
    }
}

// Create stars when page loads
createStars();
