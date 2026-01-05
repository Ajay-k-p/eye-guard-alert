# DriverGuard - Drowsiness Detection System

A real-time driver safety web application that monitors eye closure using AI-powered face detection and triggers emergency alarms to prevent drowsy driving accidents.

## Features

- **Real-time Face & Eye Detection**: Uses MediaPipe Face Mesh for accurate 468-point face landmark detection
- **Eye Aspect Ratio (EAR) Calculation**: Scientific approach to determine eye open/closed state
- **Adjustable Sensitivity**: Customize EAR threshold and alarm delay to your preference
- **Emergency Alarm**: Loud siren alarm with mobile vibration support
- **Dark Mode UI**: Optimized for night driving with high-contrast elements
- **Mobile Responsive**: Works on phone mounts with touch-friendly controls
- **Privacy First**: 100% client-side processing, no data stored or transmitted

## How It Works

1. **Face Detection**: MediaPipe Face Mesh detects 468 facial landmarks in real-time
2. **Eye Tracking**: Specific landmarks around the eyes are used to calculate the Eye Aspect Ratio (EAR)
3. **EAR Calculation**: `EAR = (|p2-p6| + |p3-p5|) / (2 * |p1-p4|)`
   - Open eyes: EAR ≈ 0.25-0.35
   - Closed eyes: EAR < 0.2
4. **Alert Logic**: If both eyes remain closed for the configured duration (default 2s), the alarm triggers
5. **Alarm**: Continues until eyes reopen

## Technology Stack

- **React 18** with TypeScript
- **Vite** for fast development
- **MediaPipe Face Mesh** for face detection
- **Web Audio API** for alarm sounds
- **Tailwind CSS** for styling
- **Shadcn/ui** components

## Setup & Installation

```bash
# Clone the repository
git clone <repo-url>
cd driverguard

# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build
```

## Deployment on Vercel

1. Push your code to GitHub
2. Connect repository to Vercel
3. Deploy with default settings (Vite auto-detected)

## Browser Requirements

- Chrome 88+ (recommended)
- Firefox 78+
- Safari 14+
- Edge 88+
- Camera permission required

## Limitations

- Requires camera access (front-facing recommended)
- Performance may vary in low-light conditions
- Not a replacement for proper rest before driving
- Browser-based only (no native mobile app)

## Safety Disclaimer

**This tool is designed as a driving aid and should NOT replace proper rest.** Always prioritize getting adequate sleep before driving. If you feel drowsy, pull over safely and rest.

## License

MIT License - Feel free to use, modify, and distribute.