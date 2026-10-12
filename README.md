# Glossix app source

Start here: index.html is the browser entry point. package.json is the desktop project entry point.

- js/core: app startup, navigation, accessibility and shared UI
- js/learning: lessons and practice
- js/game: Word drift
- js/profiles: profiles and cosmetic previews
- js/shop: shop and wallet
- js/account: accounts, friends and support
- js/notes: personal notes
- js/languages: language selection and registration
- styles: stylesheets
- desktop: Electron, secure account links, updates and speech integration
- data: course content and dictionaries
- assets and audio: artwork and recordings
- third-party: required speech libraries and licence notices
- scripts and .github: build/release automation

Run npm ci, then npm start. Build Windows with npm run dist:win. No new installer is included. SQL updates are separate and do not belong in the app source folder.
