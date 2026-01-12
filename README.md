# Squad Strike

A 3D hypercasual endless runner-shooter. Grow your squad, dodge obstacles, and defeat massive bosses in a bridge-over-city setting.

## Gameplay

- **Grow your squad**: Swipe left/right to choose positive gates (`+5`, `x2`) and avoid negative ones.
- **Shoot automatically**: Your soldiers fire at swarm enemies and bosses.
- **Upgrade weapons**: Pick up weapon crates to swap between Rifle, Shotgun, Rocket Launcher, and Minigun.
- **Survive**: Dodge obstacles (barrels, spikes) while maintaining your squad up to the cap of 200.
- **Score**: Score increases with distance traveled.
- **Defeat enemies**:
  - Normal kills grant **+1**.
  - Boss kills grant **+20**.
- **Bosses**: Scale progressively with HP and cap at size threshold.

## Controls

- **Desktop**: Move mouse left/right to steer.
- **Mobile**: Swipe/drag left/right to steer.

## Tech Stack

- Three.js (3D rendering)
- Vite (dev server & build tool)

## Installation & Run

```bash
# Install dependencies
npm install

# Development
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview
```

## Assets

Place the following images in the project root alongside `index.html`:

- `start-screen.jpg` (desktop start screen)
- `start-screen-mobile.png` (mobile start screen)
- `title_logo.png` (browser tab icon)

## Credits

Developed with Three.js and Vite.
