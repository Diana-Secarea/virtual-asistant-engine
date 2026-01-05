# Virtual Assistant Engine

A modern web-based virtual assistant that responds to voice commands for managing reminders, playing music, controlling media, and more.

## Features

- 🎤 **Voice Recognition**: Speak commands naturally using your microphone with Web Speech API
- 🎨 **Real-Time Audio Visualization**: Live audio visualization using FFT (Fast Fourier Transform) analysis
- 📊 **Canvas API Integration**: Beautiful real-time visual feedback when speaking
- 🔊 **Audio Analysis**: Advanced audio processing with Web Audio API
- ⏰ **Reminder System**: Set and manage reminders with voice commands
- 🎵 **Music Player**: Play, stop, and control music with voice commands
- 📋 **Playlist System**: Create playlists and manage your music collection
- 📹 **Camera Control**: Open camera, take photos with voice commands
- 🎬 **Video Playback**: Play videos in popups with voice control
- 🤡 **Clown Music**: Special fun feature with clown music and popup
- 🔊 **Volume Control**: Adjust volume up/down with voice commands
- 🔇 **Mute/Unmute**: Control audio muting for music and reminders
- 💎 **Modern UI**: Beautiful, responsive interface with smooth animations
- 📱 **Mobile Friendly**: Works on desktop and mobile devices

## Audio Visualization

The Voice Assistant page features a real-time audio visualization system that uses:

- **getUserMedia API**: Captures audio from your microphone
- **Web Audio API**: Processes audio data in real-time
- **FFT Analysis**: Performs Fast Fourier Transform to extract frequency data
- **Canvas API**: Renders beautiful visualizations based on audio input

### How It Works

1. Click on the microphone icon in the navigation bar to access Voice Assistant
2. Click "Start Listening" to grant microphone permissions
3. Speak or make sounds - watch the visualization react in real-time!
4. The visualization shows:
   - Circular frequency bars (128 bars representing different frequencies)
   - Pulsing waves based on volume
   - Dynamic waveform around the microphone icon
   - Real-time volume and frequency statistics

## Voice Commands

### Reminders
- **"Set reminder to [task] in [number] [seconds/minutes/hours]"**
  - Example: "Set reminder to wash my hands in 30 seconds"
  - Example: "Remind me to call mom in 5 minutes"
- **"Stop reminder"** or **"Cancel reminder"** - Cancels all active reminders
- **"Show reminders"** - View all active reminders (via Reminders button)

### Music Control
- **"Play music"** or **"Play song"** - Starts playing music
- **"Stop music"** or **"Stop song"** or **"Pause music"** - Stops current music
- **"Volume up"** or **"Turn up"** or **"Louder"** - Increases volume
- **"Volume down"** or **"Turn down"** or **"Quieter"** or **"Lower"** - Decreases volume
- **"Mute"** - Mutes music and reminders
- **"Unmute"** - Unmutes music and reminders

### Playlist Management
- **"Create playlist"** - Creates a new empty playlist
- **"Add to playlist"** - Adds current song to the playlist
- **"Play playlist"** - Plays all songs in the playlist sequentially

### Camera Control
- **"Open camera"** or **"Show camera"** or **"Start camera"** - Opens camera in popup
- **"Close camera"** or **"Stop camera"** or **"Turn off camera"** - Closes camera
- **"Take photo"** or **"Take picture"** or **"Capture"** - Captures and downloads a photo

### Video Playback
- **"Play video"** or **"Show video"** - Opens video player in popup
- **"Stop video"** or **"Close video"** - Closes video player
- **"Restart video"** or **"Start video over"** - Restarts video from beginning

### Special Features
- **"Bring clown"** or **"Bring the clown"** - Plays clown music with popup
- **"Stop clown"** or **"Stop the clown"** - Stops clown music
- **"Change background"** or **"Change the background"** - Changes page background to blue gradient

## Setup Instructions

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd virtual-asistant-engine
   ```

2. **Open in browser**
   - Simply open `index.html` in a modern web browser
   - For best experience, use Chrome, Firefox, or Edge

3. **Enable microphone permissions**
   - When prompted, allow microphone access for voice recognition
   - Ensure you're using HTTPS or localhost for microphone access

## Browser Compatibility

- Chrome 25+ (Recommended for best audio visualization performance)
- Firefox 44+
- Safari 14.1+
- Edge 79+

**Note**: HTTPS or localhost is required for microphone access. The Web Audio API and getUserMedia require a secure context.

## Technical Details

### Audio Processing Parameters

- **FFT Size**: 512 (provides 256 frequency bins)
- **Frequency Bins**: 256 discrete frequency ranges analyzed
- **Smoothing**: 0.8 (smooths visualization for better visual appeal)
- **Sample Rate**: Determined by audio context (typically 44.1kHz or 48kHz)
- **Visualization Bars**: 128 circular bars displaying frequency spectrum
- **Audio Enhancement**: Echo cancellation, noise suppression, and auto-gain control enabled

## Technologies Used

- **HTML5**: Structure and semantic markup
- **CSS3**: Modern styling with animations and responsive design
- **JavaScript (ES6+)**: Voice recognition, command processing, and functionality
- **Web Speech API**: Browser-native speech recognition
- **Web Audio API**: Real-time audio processing and FFT analysis
- **Canvas API**: Hardware-accelerated 2D graphics for visualization
- **MediaStream API (getUserMedia)**: Microphone access and audio capture
- **MediaDevices API**: Camera access for photo capture

## Project Structure

```
virtual-asistant-engine/
├── index.html              # Main HTML file
├── styles/
│   └── main.css           # Main stylesheet
├── js/
│   ├── main.js            # Main application logic and voice recognition
│   ├── reminders.js       # Reminder system functionality
│   ├── music.js            # Music playback and control
│   ├── playlist.js         # Playlist management system
│   ├── camera.js           # Camera control and photo capture
│   └── video.js            # Video playback functionality
├── assets/
│   ├── clown_image.jpg     # Clown popup image
│   └── SoundHelix-Song-2.mp3  # Reminder sound effect
├── README.md               # Documentation
└── .gitignore              # Git ignore rules (if needed)
```

### Code Organization

The project follows a modular architecture:

- **HTML**: Single-page application structure with multiple page views (Home, Features, Voice Assistant, Music Player)
- **CSS**: Separated into `styles/main.css` for better maintainability
- **JavaScript**: Modular structure with separate files for each feature:
  - `main.js`: Core application, voice recognition, page navigation, audio visualization
  - `reminders.js`: Reminder creation, management, and popup notifications
  - `music.js`: Music playback, volume control, mute/unmute, clown music
  - `playlist.js`: Playlist creation, song management, sequential playback
  - `camera.js`: Camera access, video feed display, photo capture
  - `video.js`: Video playback in popup, video controls

## Usage

1. Open the application in your browser
2. Click "Get Started" or the microphone button to access Voice Assistant
3. Click "Start Listening" to activate voice recognition
4. Speak your command clearly
5. The assistant will process and respond to your request

### Navigation

- **Home Page**: Main landing page with feature overview
- **Features Page**: Detailed list of available features
- **Voice Assistant Page**: Voice recognition interface with audio visualization
- **Music Player Page**: View and manage your playlist (accessible via Music Player button)

## Development

To contribute or modify the project:

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## License

This project is open source and available under the MIT License.

## Multimedia Project

Ownership of Diana Secarea and Estera Smeu. We do accept contributions but do not tell our teacher about it :)

## Support

For support, please open an issue in the repository.
