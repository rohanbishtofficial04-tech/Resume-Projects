# FretLab

## Updates

- Added a Home landing page, an About section, and Games with nine Chord Guess levels and locally saved high scores.
- Added the **Amethyst** and **Crimson** themes alongside Midnight and Studio. Theme selections are saved in the browser.
- Added a custom fretboard favicon.
- Updated Circle of Fifths chord controls with clear hover and touch feedback; clicking a chord plays it.
- Matched Chord Library playback to the Circle of Fifths chord sound while keeping guitar voicing diagrams available.
- Improved tuner reference tones with plucked-string harmonics, including a stronger audible presence for low notes.
- Added Chord Sprint, a microphone-powered guitar chord challenge with open-chord, seventh, and barre-chord levels.
- Improved the responsive feature menu so edge selections reveal the next option in either direction and the menu position persists after refresh.

## About

FretLab is a browser-based guitar practice toolkit built with React and Vite. It includes a real-time chromatic tuner, metronome, Circle of Fifths, scale library, and chord library. Audio playback and microphone input run in the browser.

**Live site:** [fretlab.vercel.app](https://fretlab.vercel.app)

## Features

- **Home** — landing page with direct links to every practice tool.
- **Tuner** — detects pitch through the microphone and provides reference tones for the selected tuning.
- **Metronome** — supports tempo and subdivision controls.
- **Circle of Fifths** — explores keys, modes, notes, and playable diatonic chords.
- **Scale Library** — explores scales on an interactive guitar fretboard. Playback follows a connected four-fret fingering, ascending through one or two octaves and descending back after a pause. The fingering path is marked on the fretboard, the active string and fret are highlighted, and playback tempo is adjustable from 40 to 240 BPM.
- **Chord Library** — searches chord types, saves favorites, plays chord tones, and displays guitar voicings.
- **Games** — practice ear training with nine Chord Guess level groups, from open chords and power chords to sevenths and mixed sets, or play the microphone-powered Chord Sprint instrument challenge. Chord Sprint includes beginner open chords, seventh chords, and barre-chord levels, starts 30-second rounds, detects each new strum without requiring the strings to be muted, gives note-level hints for incorrect chords, resets the round score when a round starts, and awards 5 bonus seconds after every three correctly played chords; best scores are saved per level on the device.
- **Themes** — choose Midnight, Studio, Amethyst, or Crimson.

## Requirements

- Node.js and npm
- A modern browser

## Getting started

From the project directory, install the frontend dependencies and start the app:

```powershell
npm --prefix frontend install
npm start
```

Open the local URL printed by Vite (by default, `http://localhost:3000`).

### Open on a phone on the same Wi-Fi

The Vite server is configured to listen on your local network. Run `npm start` from the project directory:

```powershell
npm start
```

Then open `http://<laptop-ip>:3000` on your phone, replacing `<laptop-ip>` with your laptop's Wi-Fi IPv4 address. Allow the development server through the firewall on private networks if prompted.

## Frontend scripts

Run these from the project directory:

| Command | Description |
| --- | --- |
| `npm start` | Start the Vite development server. |
| `npm --prefix frontend run dev` | Start the Vite development server directly. |
| `npm --prefix frontend run typecheck` | Run the TypeScript type check. |
| `npm --prefix frontend run build` | Create the production build in `frontend/dist`. |
| `npm --prefix frontend run preview` | Preview the production build locally. |
| `npm --prefix frontend run validate:chords` | Run the chord data validation script. |

## Tech stack

- React 18 and TypeScript
- Vite
- Tailwind CSS
- Web Audio API
- Browser microphone APIs for live pitch detection
