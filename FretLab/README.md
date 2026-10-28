# FretLab

## Updates

- Added the **Amethyst** theme alongside Midnight and Studio. Theme selections are saved in the browser.
- Added a custom fretboard favicon.
- Updated Circle of Fifths chord controls with clear hover and touch feedback; clicking a chord plays it.
- Matched Chord Library playback to the Circle of Fifths chord sound while keeping guitar voicing diagrams available.
- Improved tuner reference tones with plucked-string harmonics, including a stronger audible presence for low notes.

## About

FretLab is a browser-based guitar practice toolkit built with React and Vite. It includes a real-time chromatic tuner, metronome, Circle of Fifths, scale library, and chord library. Audio playback and microphone input run in the browser.

**Live site:** [fretlab.vercel.app](https://fretlab.vercel.app)

## Features

- **Tuner** — detects pitch through the microphone and provides reference tones for the selected tuning.
- **Metronome** — supports tempo and subdivision controls.
- **Circle of Fifths** — explores keys, modes, notes, and playable diatonic chords.
- **Scale Library** — explores scales on an interactive guitar fretboard.
- **Chord Library** — searches chord types, saves favorites, plays chord tones, and displays guitar voicings.
- **Themes** — choose Midnight, Studio, or Amethyst.

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
