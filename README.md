# Virtual Assistant Engine

A modern web-based virtual assistant that responds to voice commands for setting reminders, answering questions, and playing music.

## Features

- 🎤 **Voice Recognition**: Speak commands naturally using your microphone
- ⏰ **Reminder System**: Set and manage reminders with voice commands
- 🤖 **Question Answering**: Get answers to various questions
- 🎵 **Music Player**: Play music with voice commands
- 🎨 **Modern UI**: Beautiful, responsive interface with smooth animations
- 📱 **Mobile Friendly**: Works on desktop and mobile devices

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

- Chrome 25+
- Firefox 44+
- Safari 14.1+
- Edge 79+

## Technologies Used

- **HTML5**: Structure and semantic markup
- **CSS3**: Modern styling with animations and responsive design
- **JavaScript**: Voice recognition, command processing, and functionality
- **Web Speech API**: Browser-native speech recognition
- **Web Audio API**: Audio playback and control

## Project Structure

```
virtual-asistant-engine/
├── index.html          # Main HTML file
├── styles/
│   └── main.css        # Main stylesheet
├── scripts/
│   ├── main.js         # Main JavaScript file
│   ├── voice.js        # Voice recognition module
│   ├── reminders.js    # Reminder functionality
│   ├── questions.js    # Question answering
│   └── music.js        # Music player
├── assets/
│   └── sounds/         # Audio files and sound effects
├── README.md           # This file
└── .gitignore          # Git ignore rules
```

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

## Contributing

Contributions are welcome! Please feel free to submit issues, feature requests, or pull requests.

## Support

For support or questions, please open an issue in the repository.