// ========================================================================
// REMINDER SYSTEM
// ========================================================================

// Reminder variables
let reminders = [];
let reminderIdCounter = 0;
let remindersMuted = false;
let reminderSoundElement = null;

// Initialize reminder sound element
function initReminderSound() {
    if (!reminderSoundElement) {
        reminderSoundElement = new Audio('assets/SoundHelix-Song-2.mp3');
        reminderSoundElement.volume = 0.7; // 70% volume
        reminderSoundElement.preload = 'auto';
        
        // Load the audio to avoid autoplay restrictions
        reminderSoundElement.load();
        
        // Handle errors
        reminderSoundElement.addEventListener('error', (e) => {
            console.error('Error loading reminder sound:', e);
        });
        
        console.log('Reminder sound initialized');
    }
}

// Initialize on page load
if (typeof window !== 'undefined') {
    // Initialize when DOM is ready
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initReminderSound);
    } else {
        initReminderSound();
    }
}

function parseAndSetReminder(command) {
    const statusEl = document.getElementById('voiceStatus');
    
    // Pattern: "set reminder to X in Y seconds/minutes/hours"
    // More flexible pattern that handles variations:
    // - "set reminder to" or "remind me to" or "reminder to"
    // - Allows flexible spacing and word variations
    const pattern = /(?:set\s+reminder\s+to|remind\s+me\s+to|reminder\s+to)\s+(.+?)\s+in\s+(\d+)\s*(second|seconds|minute|minutes|hour|hours)/i;
    
    const match = command.match(pattern);
    
    if (match) {
        const message = match[1].trim();
        const timeValue = parseInt(match[2]);
        const timeUnit = match[3].toLowerCase();
        
        if (message && timeValue > 0) {
            let timeInMs = 0;
            if (timeUnit.startsWith('second')) {
                timeInMs = timeValue * 1000;
            } else if (timeUnit.startsWith('minute')) {
                timeInMs = timeValue * 60 * 1000;
            } else if (timeUnit.startsWith('hour')) {
                timeInMs = timeValue * 60 * 60 * 1000;
            }
            
            if (timeInMs > 0) {
                setReminder(message, timeInMs);
                return;
            }
        }
    }
    
    // If parsing failed, show help
    if (statusEl) {
        statusEl.textContent = '⏰ Say: "Set reminder to [task] in [number] [seconds/minutes/hours]"';
        statusEl.style.color = '#fbbf24';
    }
}

function setReminder(message, delayMs) {
    const statusEl = document.getElementById('voiceStatus');
    
    // Format the delay for display
    let timeDisplay = '';
    if (delayMs >= 3600000) {
        timeDisplay = `${Math.round(delayMs / 3600000)} hour(s)`;
    } else if (delayMs >= 60000) {
        timeDisplay = `${Math.round(delayMs / 60000)} minute(s)`;
    } else {
        timeDisplay = `${Math.round(delayMs / 1000)} second(s)`;
    }
    
    const reminderId = ++reminderIdCounter;
    
    // Set the timeout to trigger reminder
    const timeoutId = setTimeout(() => {
        triggerReminder(reminderId, message);
    }, delayMs);
    
    // Store the reminder with additional metadata
    const reminder = {
        id: reminderId,
        message: message,
        timeoutId: timeoutId,
        triggered: false,
        createdAt: new Date(),
        triggerTime: new Date(Date.now() + delayMs)
    };
    reminders.push(reminder);
    
    // Show confirmation popup
    showReminderSetConfirmation(message, timeDisplay);
    
    // Update status
    if (statusEl) {
        statusEl.textContent = `⏰ Reminder set: "${message}" in ${timeDisplay}`;
        statusEl.style.color = '#4ade80';
    }
    
    // Play confirmation beep
    if (typeof playConfirmationBeep === 'function') {
        playConfirmationBeep('success');
    }
    
    console.log(`Reminder #${reminderId} set: "${message}" in ${timeDisplay}`);
}

function showReminderSetConfirmation(message, timeDisplay) {
    // Remove any existing confirmation popup
    const existingPopup = document.getElementById('reminderSetConfirmation');
    if (existingPopup) {
        existingPopup.remove();
    }
    
    // Create popup overlay
    const overlay = document.createElement('div');
    overlay.id = 'reminderSetConfirmation';
    overlay.style.cssText = `
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background: rgba(0, 0, 0, 0.6);
        display: flex;
        justify-content: center;
        align-items: center;
        z-index: 9998;
    `;
    
    // Create popup container
    const popup = document.createElement('div');
    popup.style.cssText = `
        background: linear-gradient(135deg, #1a1a2e 0%, #16213e 100%);
        padding: 30px;
        border-radius: 20px;
        box-shadow: 0 20px 60px rgba(0, 0, 0, 0.6);
        text-align: center;
        max-width: 400px;
        width: 90%;
        border: 2px solid rgba(76, 222, 128, 0.5);
    `;
    
    // Create icon
    const icon = document.createElement('div');
    icon.textContent = '✅';
    icon.style.cssText = `
        font-size: 3rem;
        margin-bottom: 15px;
    `;
    
    // Create title
    const title = document.createElement('h3');
    title.textContent = 'Reminder Set!';
    title.style.cssText = `
        color: #4ade80;
        font-size: 1.5rem;
        font-weight: 700;
        margin-bottom: 15px;
    `;
    
    // Create message
    const messageDiv = document.createElement('div');
    messageDiv.textContent = `"${message}"`;
    messageDiv.style.cssText = `
        color: #ffffff;
        font-size: 1.1rem;
        margin-bottom: 10px;
        font-weight: 500;
    `;
    
    // Create time display
    const timeDiv = document.createElement('div');
    timeDiv.textContent = `⏰ In ${timeDisplay}`;
    timeDiv.style.cssText = `
        color: rgba(255, 255, 255, 0.7);
        font-size: 0.95rem;
        margin-bottom: 20px;
    `;
    
    // Create OK button
    const okBtn = document.createElement('button');
    okBtn.textContent = 'OK';
    okBtn.style.cssText = `
        background: linear-gradient(135deg, #8c0a22, #ff1a4d);
        color: #ffffff;
        border: none;
        padding: 12px 30px;
        border-radius: 10px;
        font-size: 1rem;
        font-weight: 600;
        cursor: pointer;
        transition: all 0.3s ease;
        box-shadow: 0 4px 16px rgba(140, 10, 34, 0.4);
    `;
    okBtn.onmouseover = () => {
        okBtn.style.transform = 'translateY(-2px)';
        okBtn.style.boxShadow = '0 6px 20px rgba(140, 10, 34, 0.6)';
    };
    okBtn.onmouseout = () => {
        okBtn.style.transform = 'translateY(0)';
        okBtn.style.boxShadow = '0 4px 16px rgba(140, 10, 34, 0.4)';
    };
    okBtn.onclick = () => {
        overlay.remove();
    };
    
    popup.appendChild(icon);
    popup.appendChild(title);
    popup.appendChild(messageDiv);
    popup.appendChild(timeDiv);
    popup.appendChild(okBtn);
    overlay.appendChild(popup);
    
    // Auto-close after 3 seconds
    setTimeout(() => {
        if (document.getElementById('reminderSetConfirmation')) {
            overlay.remove();
        }
    }, 3000);
    
    document.body.appendChild(overlay);
}

function triggerReminder(reminderId, message) {
    // Mark reminder as triggered
    const reminder = reminders.find(r => r.id === reminderId);
    if (reminder) {
        reminder.triggered = true;
    }
    
    // Play sound to get attention
    playReminderSound();
    
    // Show popup notification
    showReminderTriggeredPopup(message);
    
    // Update status
    const statusEl = document.getElementById('voiceStatus');
    if (statusEl) {
        statusEl.textContent = `⏰ Reminder ready: ${message}`;
        statusEl.style.color = '#f59e0b';
    }
    
    console.log(`Reminder triggered: "${message}"`);
}

function playReminderSound() {
    // Don't play sound if reminders are muted
    if (remindersMuted) {
        console.log('Reminder sound muted');
        return;
    }
    
    // Initialize sound element if not already done
    if (!reminderSoundElement) {
        initReminderSound();
    }
    
    if (!reminderSoundElement) {
        console.error('Failed to initialize reminder sound element');
        return;
    }
    
    try {
        // Check if audio is ready to play
        if (reminderSoundElement.readyState >= 2) { // HAVE_CURRENT_DATA or higher
            // Reset to beginning and play
            reminderSoundElement.currentTime = 0;
            reminderSoundElement.volume = 0.7; // 70% volume
            
            const playPromise = reminderSoundElement.play();
            
            if (playPromise !== undefined) {
                playPromise
                    .then(() => {
                        console.log('Reminder sound playing');
                    })
                    .catch(error => {
                        console.error('Error playing reminder sound:', error);
                        // Try to play again after a short delay (sometimes helps with autoplay restrictions)
                        setTimeout(() => {
                            if (reminderSoundElement) {
                                reminderSoundElement.play().catch(err => {
                                    console.error('Retry failed to play reminder sound:', err);
                                });
                            }
                        }, 100);
                    });
            }
        } else {
            // Audio not loaded yet, wait for it to load
            console.log('Reminder sound not ready, waiting for load...');
            reminderSoundElement.addEventListener('canplaythrough', function playWhenReady() {
                reminderSoundElement.removeEventListener('canplaythrough', playWhenReady);
                reminderSoundElement.currentTime = 0;
                reminderSoundElement.volume = 0.7;
                reminderSoundElement.play().catch(error => {
                    console.error('Error playing reminder sound after load:', error);
                });
            }, { once: true });
            
            // Force load if not already loading
            if (reminderSoundElement.readyState === 0) {
                reminderSoundElement.load();
            }
        }
    } catch (error) {
        console.error('Error playing reminder sound:', error);
    }
}

function setRemindersMute(muted) {
    remindersMuted = muted;
    console.log(`Reminders ${muted ? 'muted' : 'unmuted'}`);
}

function stopReminderSound() {
    if (reminderSoundElement) {
        try {
            reminderSoundElement.pause();
            reminderSoundElement.currentTime = 0;
            console.log('Reminder sound stopped');
            return true;
        } catch (error) {
            console.error('Error stopping reminder sound:', error);
            return false;
        }
    }
    return false;
}

function parseMuteReminderCommand(command) {
    const normalizedCommand = command.toLowerCase().trim();
    
    // Check for "mute reminder" or "stop reminder sound" commands
    if (normalizedCommand.includes('mute reminder') || 
        normalizedCommand.includes('stop reminder sound') ||
        normalizedCommand.includes('stop reminder music') ||
        normalizedCommand.includes('silence reminder')) {
        const stopped = stopReminderSound();
        const statusEl = document.getElementById('voiceStatus');
        if (statusEl) {
            if (stopped) {
                statusEl.textContent = '🔇 Reminder sound stopped';
                statusEl.style.color = '#60a5fa';
            } else {
                statusEl.textContent = 'ℹ️ No reminder sound playing';
                statusEl.style.color = '#fbbf24';
            }
        }
        return true;
    }
    
    return false;
}

function showReminderTriggeredPopup(message) {
    // Remove any existing triggered popup
    const existingPopup = document.getElementById('reminderTriggeredPopup');
    if (existingPopup) {
        existingPopup.remove();
    }
    
    // Create popup overlay
    const overlay = document.createElement('div');
    overlay.id = 'reminderTriggeredPopup';
    overlay.style.cssText = `
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background: rgba(0, 0, 0, 0.8);
        display: flex;
        justify-content: center;
        align-items: center;
        z-index: 10000;
    `;
    
    // Create popup container
    const popup = document.createElement('div');
    popup.style.cssText = `
        background: linear-gradient(135deg, #1a1a2e 0%, #16213e 100%);
        padding: 40px;
        border-radius: 24px;
        box-shadow: 0 20px 60px rgba(0, 0, 0, 0.6);
        text-align: center;
        max-width: 450px;
        width: 90%;
        border: 3px solid #f59e0b;
    `;
    
    // Create icon
    const icon = document.createElement('div');
    icon.textContent = '⏰';
    icon.style.cssText = `
        font-size: 4rem;
        margin-bottom: 20px;
    `;
    
    // Create title
    const title = document.createElement('h2');
    title.textContent = 'Reminder!';
    title.style.cssText = `
        color: #f59e0b;
        font-size: 2rem;
        font-weight: 700;
        margin-bottom: 20px;
    `;
    
    // Create message
    const messageDiv = document.createElement('div');
    messageDiv.textContent = message;
    messageDiv.style.cssText = `
        color: #ffffff;
        font-size: 1.3rem;
        margin-bottom: 25px;
        line-height: 1.5;
        font-weight: 500;
    `;
    
    // Create OK button
    const okBtn = document.createElement('button');
    okBtn.textContent = '✓ Got it!';
    okBtn.style.cssText = `
        background: linear-gradient(135deg, #8c0a22, #ff1a4d);
        color: #ffffff;
        border: none;
        padding: 14px 40px;
        border-radius: 12px;
        font-size: 1rem;
        font-weight: 600;
        cursor: pointer;
        transition: all 0.3s ease;
        box-shadow: 0 4px 16px rgba(140, 10, 34, 0.4);
        width: 100%;
    `;
    okBtn.onmouseover = () => {
        okBtn.style.transform = 'translateY(-2px)';
        okBtn.style.boxShadow = '0 6px 20px rgba(140, 10, 34, 0.6)';
    };
    okBtn.onmouseout = () => {
        okBtn.style.transform = 'translateY(0)';
        okBtn.style.boxShadow = '0 4px 16px rgba(140, 10, 34, 0.4)';
    };
    okBtn.onclick = () => {
        overlay.remove();
    };
    
    popup.appendChild(icon);
    popup.appendChild(title);
    popup.appendChild(messageDiv);
    popup.appendChild(okBtn);
    overlay.appendChild(popup);
    
    document.body.appendChild(overlay);
}

function showRemindersPopup() {
    // Remove any existing popup
    const existingPopup = document.getElementById('remindersPopup');
    if (existingPopup) {
        existingPopup.remove();
    }
    
    // Get all triggered reminders
    const triggeredReminders = reminders.filter(r => r.triggered);
    const activeReminders = reminders.filter(r => !r.triggered);
    
    // Create popup overlay
    const overlay = document.createElement('div');
    overlay.id = 'remindersPopup';
    overlay.style.cssText = `
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background: rgba(0, 0, 0, 0.75);
        display: flex;
        justify-content: center;
        align-items: center;
        z-index: 9999;
    `;
    
    // Create popup container
    const popup = document.createElement('div');
    popup.style.cssText = `
        background: linear-gradient(135deg, #1a1a2e 0%, #16213e 100%);
        padding: 40px;
        border-radius: 24px;
        box-shadow: 0 20px 60px rgba(0, 0, 0, 0.6);
        text-align: center;
        max-width: 500px;
        width: 90%;
        max-height: 80vh;
        overflow-y: auto;
        border: 2px solid rgba(140, 10, 34, 0.5);
    `;
    
    // Create header
    const header = document.createElement('div');
    header.style.cssText = `
        margin-bottom: 30px;
    `;
    
    const icon = document.createElement('div');
    icon.textContent = '⏰';
    icon.style.cssText = `
        font-size: 3.5rem;
        margin-bottom: 15px;
    `;
    
    const title = document.createElement('h2');
    title.textContent = 'Reminders';
    title.style.cssText = `
        color: #ffffff;
        font-size: 2rem;
        font-weight: 700;
        margin: 0;
        background: linear-gradient(135deg, #ffffff 0%, #f59e0b 100%);
        -webkit-background-clip: text;
        -webkit-text-fill-color: transparent;
        background-clip: text;
    `;
    
    header.appendChild(icon);
    header.appendChild(title);
    popup.appendChild(header);
    
    // Create content area
    const content = document.createElement('div');
    content.style.cssText = `
        text-align: left;
        margin-bottom: 30px;
    `;
    
    // Show triggered reminders
    if (triggeredReminders.length > 0) {
        const triggeredSection = document.createElement('div');
        triggeredSection.style.cssText = `margin-bottom: 25px;`;
        
        const triggeredTitle = document.createElement('h3');
        triggeredTitle.textContent = '⏰ Ready:';
        triggeredTitle.style.cssText = `
            color: #f59e0b;
            font-size: 1.3rem;
            font-weight: 600;
            margin-bottom: 15px;
            text-align: center;
        `;
        triggeredSection.appendChild(triggeredTitle);
        
        triggeredReminders.forEach((reminder, index) => {
            // Format trigger time
            const triggerTime = reminder.triggerTime ? new Date(reminder.triggerTime) : new Date();
            const timeStr = triggerTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });
            
            const reminderItem = document.createElement('div');
            reminderItem.style.cssText = `
                background: rgba(245, 158, 11, 0.15);
                border-left: 4px solid #f59e0b;
                padding: 15px 20px;
                margin-bottom: 12px;
                border-radius: 8px;
                color: #ffffff;
                font-size: 1.1rem;
                line-height: 1.5;
            `;
            
            const messageDiv = document.createElement('div');
            messageDiv.textContent = `• ${reminder.message}`;
            messageDiv.style.cssText = `margin-bottom: 8px; font-weight: 500;`;
            
            const timeDiv = document.createElement('div');
            timeDiv.textContent = `⏰ Triggered at: ${timeStr}`;
            timeDiv.style.cssText = `
                color: rgba(255, 255, 255, 0.7);
                font-size: 0.9rem;
            `;
            
            reminderItem.appendChild(messageDiv);
            reminderItem.appendChild(timeDiv);
            triggeredSection.appendChild(reminderItem);
        });
        
        content.appendChild(triggeredSection);
    }
    
    // Show active reminders
    if (activeReminders.length > 0) {
        const activeSection = document.createElement('div');
        
        const activeTitle = document.createElement('h3');
        activeTitle.textContent = '⏳ Active:';
        activeTitle.style.cssText = `
            color: #60a5fa;
            font-size: 1.3rem;
            font-weight: 600;
            margin-bottom: 15px;
            text-align: center;
        `;
        activeSection.appendChild(activeTitle);
        
        activeReminders.forEach((reminder, index) => {
            // Calculate time remaining
            const timeRemaining = reminder.triggerTime - Date.now();
            let timeRemainingDisplay = '';
            
            if (timeRemaining > 0) {
                const hours = Math.floor(timeRemaining / 3600000);
                const minutes = Math.floor((timeRemaining % 3600000) / 60000);
                const seconds = Math.floor((timeRemaining % 60000) / 1000);
                
                if (hours > 0) {
                    timeRemainingDisplay = `${hours}h ${minutes}m left`;
                } else if (minutes > 0) {
                    timeRemainingDisplay = `${minutes}m ${seconds}s left`;
                } else {
                    timeRemainingDisplay = `${seconds}s left`;
                }
            }
            
            // Format trigger time
            const triggerTime = reminder.triggerTime ? new Date(reminder.triggerTime) : new Date();
            const triggerTimeStr = triggerTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });
            
            const reminderItem = document.createElement('div');
            reminderItem.style.cssText = `
                background: rgba(96, 165, 250, 0.15);
                border-left: 4px solid #60a5fa;
                padding: 15px 20px;
                margin-bottom: 12px;
                border-radius: 8px;
                color: #ffffff;
                font-size: 1rem;
                line-height: 1.5;
                opacity: 0.9;
            `;
            
            const messageDiv = document.createElement('div');
            messageDiv.textContent = `• ${reminder.message}`;
            messageDiv.style.cssText = `margin-bottom: 8px; font-weight: 500;`;
            
            const timeInfoDiv = document.createElement('div');
            timeInfoDiv.style.cssText = `
                color: rgba(255, 255, 255, 0.7);
                font-size: 0.9rem;
                display: flex;
                flex-direction: column;
                gap: 4px;
            `;
            
            const timeRemainingSpan = document.createElement('span');
            timeRemainingSpan.textContent = `⏳ ${timeRemainingDisplay}`;
            
            const triggerTimeSpan = document.createElement('span');
            triggerTimeSpan.textContent = `⏰ Will trigger at: ${triggerTimeStr}`;
            
            timeInfoDiv.appendChild(timeRemainingSpan);
            timeInfoDiv.appendChild(triggerTimeSpan);
            
            reminderItem.appendChild(messageDiv);
            reminderItem.appendChild(timeInfoDiv);
            activeSection.appendChild(reminderItem);
        });
        
        content.appendChild(activeSection);
    }
    
    // Show empty state
    if (triggeredReminders.length === 0 && activeReminders.length === 0) {
        const emptyState = document.createElement('div');
        emptyState.style.cssText = `
            color: rgba(255, 255, 255, 0.6);
            font-size: 1.1rem;
            padding: 40px 20px;
        `;
        emptyState.textContent = 'No reminders set. Say "Set reminder to..." to create one.';
        content.appendChild(emptyState);
    }
    
    popup.appendChild(content);
    
    // Create close button
    const closeBtn = document.createElement('button');
    closeBtn.textContent = '✓ Close';
    closeBtn.style.cssText = `
        background: linear-gradient(135deg, #8c0a22, #ff1a4d);
        color: #ffffff;
        border: none;
        padding: 14px 40px;
        border-radius: 12px;
        font-size: 1rem;
        font-weight: 600;
        cursor: pointer;
        transition: all 0.3s ease;
        box-shadow: 0 4px 16px rgba(140, 10, 34, 0.4);
        width: 100%;
    `;
    closeBtn.onmouseover = () => {
        closeBtn.style.transform = 'translateY(-2px)';
        closeBtn.style.boxShadow = '0 6px 20px rgba(140, 10, 34, 0.6)';
    };
    closeBtn.onmouseout = () => {
        closeBtn.style.transform = 'translateY(0)';
        closeBtn.style.boxShadow = '0 4px 16px rgba(140, 10, 34, 0.4)';
    };
    closeBtn.onclick = () => {
        // Remove triggered reminders after viewing
        reminders = reminders.filter(r => !r.triggered);
        overlay.remove();
    };
    
    popup.appendChild(closeBtn);
    overlay.appendChild(popup);
    
    // Close on overlay click (outside popup)
    overlay.addEventListener('click', (e) => {
        if (e.target === overlay) {
            reminders = reminders.filter(r => !r.triggered);
            overlay.remove();
        }
    });
    
    document.body.appendChild(overlay);
}

function stopAllReminders() {
    const statusEl = document.getElementById('voiceStatus');
    
    // Count active reminders before clearing
    const activeCount = reminders.filter(r => !r.triggered).length;
    const triggeredCount = reminders.filter(r => r.triggered).length;
    const totalCount = reminders.length;
    
    // Clear all timeout timers for active reminders
    reminders.forEach(reminder => {
        if (reminder.timeoutId && !reminder.triggered) {
            clearTimeout(reminder.timeoutId);
        }
    });
    
    // Clear all reminders
    reminders = [];
    reminderIdCounter = 0;
    
    // Update status
    if (statusEl) {
        if (totalCount > 0) {
            statusEl.textContent = `⏰ Stopped ${totalCount} reminder(s) (${activeCount} active, ${triggeredCount} triggered)`;
            statusEl.style.color = '#f59e0b';
        } else {
            statusEl.textContent = '⏰ No reminders to stop';
            statusEl.style.color = '#fbbf24';
        }
    }
    
    // Play confirmation beep
    if (typeof playConfirmationBeep === 'function') {
        playConfirmationBeep('success');
    }
    
    console.log(`Stopped all reminders (${totalCount} total)`);
}

function parseStopReminder(command) {
    const normalizedCommand = command.toLowerCase().trim();
    
    // Check for "stop reminder" or "cancel reminder" commands
    if (normalizedCommand.includes('stop reminder') || 
        normalizedCommand.includes('cancel reminder') ||
        normalizedCommand.includes('clear reminder') ||
        normalizedCommand === 'stop reminders' ||
        normalizedCommand === 'cancel reminders' ||
        normalizedCommand === 'clear reminders') {
        stopAllReminders();
        return true;
    }
    
    return false;
}

