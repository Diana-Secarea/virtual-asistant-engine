# Virtual Assistant Engine

A modern web-based virtual assistant that responds to voice commands for setting reminders, answering questions, and playing music.

## Features

- 🎤 **Voice Recognition**: Speak commands naturally using your microphone
- 🎨 **Real-Time Audio Visualization**: Live audio visualization using FFT (Fast Fourier Transform) analysis
- 📊 **Canvas API Integration**: Beautiful real-time visual feedback when speaking
- 🔊 **Audio Analysis**: Advanced audio processing with Web Audio API
- ⏰ **Reminder System**: Set and manage reminders with voice commands
- 🤖 **Question Answering**: Get answers to various questions
- 🎵 **Music Player**: Play music with voice commands
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
- "Set a reminder for [time] to [task]"
- "Remind me to [task] in [duration]"
- "What are my reminders?"

### Questions
- "What is [topic]?"
- "How do I [action]?"
- "Tell me about [subject]"

### Music
- "Play music"
- "Stop music"
- "Next song"
- "Previous song"

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

## Project Structure

```
virtual-asistant-engine/
├── index.html          # Main HTML file with integrated JavaScript
├── styles/
│   └── main.css        # Main stylesheet (separated from HTML)
├── README.md           # Documentation
└── .gitignore          # Git ignore rules (if needed)
```

### Code Organization

- **HTML**: Single-page application structure with multiple page views
- **CSS**: Separated into `styles/main.css` for better maintainability
- **JavaScript**: Integrated in HTML for simplicity, includes:
  - Page navigation system
  - Stars animation
  - Voice assistant with FFT audio analysis
  - Canvas-based real-time audio visualization
  - Web Audio API integration

## Usage

1. Open the application in your browser
2. Click the microphone button or say "Hey Assistant" to activate
3. Speak your command clearly
4. The assistant will process and respond to your request

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

For support or questions, please open an issue in the repository.
