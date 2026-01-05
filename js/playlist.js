// ========================================================================
// PLAYLIST SYSTEM
// ========================================================================

// Single playlist storage
let playlist = {
    songs: []
};
let currentPlaylistIndex = 0;
let isPlayingPlaylist = false;

function createPlaylist() {
    const statusEl = document.getElementById('voiceStatus');
    
    // Clear existing playlist
    playlist.songs = [];
    currentPlaylistIndex = 0;
    
    if (statusEl) {
        statusEl.textContent = '📋 Playlist created!';
        statusEl.style.color = '#4ade80';
    }
    
    if (typeof playConfirmationBeep === 'function') {
        playConfirmationBeep('success');
    }
    
    // Refresh display if on music player page
    if (typeof refreshPlaylistDisplay === 'function') {
        refreshPlaylistDisplay();
    }
    
    console.log('Playlist created');
    return true;
}

function addToPlaylist(songUrl) {
    const statusEl = document.getElementById('voiceStatus');
    
    // Check if playlist exists (create if not)
    if (!playlist) {
        playlist = { songs: [] };
    }
    
    // Check if song already in playlist
    if (playlist.songs.includes(songUrl)) {
        if (statusEl) {
            statusEl.textContent = '📋 Song already in playlist!';
            statusEl.style.color = '#fbbf24';
        }
        return false;
    }
    
    // Add song to playlist
    playlist.songs.push(songUrl);
    
    if (statusEl) {
        statusEl.textContent = `📋 Added to playlist! (${playlist.songs.length} songs)`;
        statusEl.style.color = '#4ade80';
    }
    
    if (typeof playConfirmationBeep === 'function') {
        playConfirmationBeep('success');
    }
    
    // Refresh display if on music player page
    if (typeof refreshPlaylistDisplay === 'function') {
        refreshPlaylistDisplay();
    }
    
    console.log(`Added song to playlist`);
    return true;
}

async function playPlaylist() {
    const statusEl = document.getElementById('voiceStatus');
    
    if (!playlist || playlist.songs.length === 0) {
        if (statusEl) {
            statusEl.textContent = '📋 Playlist is empty! Add songs first.';
            statusEl.style.color = '#fbbf24';
        }
        return false;
    }
    
    // Stop current music
    if (typeof stopMusic === 'function') {
        stopMusic();
    }
    if (typeof stopClownMusic === 'function') {
        stopClownMusic();
    }
    
    // Reset playlist index
    currentPlaylistIndex = 0;
    isPlayingPlaylist = true;
    
    // Play first song
    await playPlaylistSong(playlist.songs[0], 0);
    
    if (statusEl) {
        statusEl.textContent = `📋 Playing playlist (${playlist.songs.length} songs)`;
        statusEl.style.color = '#4ade80';
    }
    
    // Refresh display and set up periodic updates
    if (typeof refreshPlaylistDisplay === 'function') {
        refreshPlaylistDisplay();
        // Update display periodically while playing
        const updateInterval = setInterval(() => {
            if (isPlayingPlaylist) {
                refreshPlaylistDisplay();
            } else {
                clearInterval(updateInterval);
            }
        }, 1000);
    }
    
    return true;
}

async function playPlaylistSong(songUrl, index) {
    if (!isPlayingPlaylist || !playlist) return;
    
    const audioContext = typeof getAudioContext === 'function' ? getAudioContext() : null;
    if (!audioContext) {
        console.error('Audio context not available');
        return;
    }
    
    try {
        // Create HTML Audio element
        const audioElement = new Audio(songUrl);
        audioElement.crossOrigin = 'anonymous';
        audioElement.volume = 0.5;
        
        // Wait for audio to load
        await new Promise((resolve, reject) => {
            audioElement.oncanplaythrough = resolve;
            audioElement.onerror = reject;
            audioElement.load();
        });
        
        // Create MediaElementAudioSourceNode
        const audioSource = audioContext.createMediaElementSource(audioElement);
        const musicGain = audioContext.createGain();
        musicGain.gain.value = 0.5;
        
        audioSource.connect(musicGain);
        musicGain.connect(audioContext.destination);
        
        // Store reference for stop functionality (if function exists)
        if (typeof setCurrentMusicElement === 'function') {
            setCurrentMusicElement(audioElement, audioSource);
        } else {
            // Fallback: store in global music variables if accessible
            if (typeof window !== 'undefined') {
                window.currentPlaylistAudio = audioElement;
                window.currentPlaylistSource = audioSource;
            }
        }
        
        // Handle when song ends - play next
        audioElement.onended = () => {
            if (isPlayingPlaylist && playlist) {
                const nextIndex = index + 1;
                if (nextIndex < playlist.songs.length) {
                    // Play next song
                    currentPlaylistIndex = nextIndex;
                    playPlaylistSong(playlist.songs[nextIndex], nextIndex);
                } else {
                    // Playlist finished
                    isPlayingPlaylist = false;
                    currentPlaylistIndex = 0;
                    const statusEl = document.getElementById('voiceStatus');
                    if (statusEl) {
                        statusEl.textContent = `📋 Playlist finished!`;
                        statusEl.style.color = '#60a5fa';
                    }
                }
            }
        };
        
        // Play the audio
        await audioElement.play();
        
        const statusEl = document.getElementById('voiceStatus');
        if (statusEl) {
            statusEl.textContent = `🎵 Playing song ${index + 1}/${playlist.songs.length} from playlist`;
            statusEl.style.color = '#4ade80';
        }
        
    } catch (error) {
        console.error('Error playing playlist song:', error);
        // Try next song if current fails
        if (isPlayingPlaylist && playlist) {
            const nextIndex = index + 1;
            if (nextIndex < playlist.songs.length) {
                currentPlaylistIndex = nextIndex;
                playPlaylistSong(playlist.songs[nextIndex], nextIndex);
            } else {
                // No more songs
                isPlayingPlaylist = false;
                currentPlaylistIndex = 0;
            }
        }
    }
}

function parsePlaylistCommand(command) {
    const normalizedCommand = command.toLowerCase().trim();
    const statusEl = document.getElementById('voiceStatus');
    
    // Create playlist: "create playlist"
    if (normalizedCommand.includes('create playlist')) {
        createPlaylist();
        return true;
    }
    
    // Add to playlist: "add to playlist" or "add [song] to playlist"
    if (normalizedCommand.includes('add') && normalizedCommand.includes('to playlist')) {
        let songUrl = '';
        
        // Try to get current song URL if music is playing
        if (typeof getCurrentSongUrl === 'function') {
            songUrl = getCurrentSongUrl();
        }
        
        // Default song URL (current music URL)
        if (!songUrl) {
            songUrl = 'https://raw.githubusercontent.com/mdn/webaudio-examples/main/audio-analyser/viper.mp3';
        }
        
        addToPlaylist(songUrl);
        return true;
    }
    
    // Play playlist: "play playlist"
    if (normalizedCommand.includes('play playlist')) {
        playPlaylist();
        return true;
    }
    
    return false;
}

function stopPlaylist() {
    isPlayingPlaylist = false;
    currentPlaylistIndex = 0;
    
    // Stop any playing playlist audio
    if (typeof window !== 'undefined' && window.currentPlaylistAudio) {
        try {
            window.currentPlaylistAudio.pause();
            window.currentPlaylistAudio.currentTime = 0;
            window.currentPlaylistAudio = null;
            window.currentPlaylistSource = null;
        } catch (e) {
            console.error('Error stopping playlist audio:', e);
        }
    }
}

function getPlaylist() {
    return playlist;
}

function isPlaylistPlaying() {
    return isPlayingPlaylist;
}

function refreshPlaylistDisplay() {
    const playlistSongsEl = document.getElementById('playlistSongs');
    if (!playlistSongsEl) return;
    
    if (!playlist || !playlist.songs || playlist.songs.length === 0) {
        playlistSongsEl.innerHTML = '<p style="color: var(--text-gray); text-align: center; padding: 20px;">No songs in playlist. Say "Create playlist" and "Add to playlist" to get started.</p>';
        return;
    }
    
    let html = '<div style="display: flex; flex-direction: column; gap: 8px;">';
    playlist.songs.forEach((songUrl, index) => {
        const songName = songUrl.split('/').pop() || `Song ${index + 1}`;
        const isCurrent = isPlayingPlaylist && currentPlaylistIndex === index;
        html += `
            <div style="padding: 12px; background: ${isCurrent ? 'rgba(74, 222, 128, 0.2)' : 'rgba(255, 255, 255, 0.05)'}; border-radius: 8px; display: flex; align-items: center; gap: 12px;">
                <span style="color: var(--text-gray); font-size: 0.9rem; min-width: 30px;">${index + 1}.</span>
                <span style="color: ${isCurrent ? 'var(--accent-green)' : 'var(--text-white)'}; flex: 1; font-size: 0.95rem;">${songName}</span>
                ${isCurrent ? '<span style="color: var(--accent-green); font-size: 0.85rem;">▶ Playing</span>' : ''}
            </div>
        `;
    });
    html += '</div>';
    playlistSongsEl.innerHTML = html;
}

// Refresh display when page is shown
if (typeof showPage !== 'undefined') {
    const originalShowPage = showPage;
    window.showPage = function(pageId) {
        originalShowPage(pageId);
        if (pageId === 'musicPlayerPage') {
            setTimeout(() => {
                if (typeof refreshPlaylistDisplay === 'function') {
                    refreshPlaylistDisplay();
                }
            }, 100);
        }
    };
}
