DETAILED PROMPT —- **Visual Style**: 3D, Hypercasual.
- **Perspective**: Third-person, behind the squad (High angle).
- **Orientation**: Vertical (9:16) for mobile.
- **Core Loop**:
  - Player controls a **static** squad (fixed Z position) on a treadmill-like world.
  - The floor and objects move towards the player to simulate forward movement.
  - Player moves Left/Right to avoid obstacles and pick lanes.
  - Enemies approach from the front.
A vertical (9:16) mobile 3D hypercasual runner-shooter game where the player controls a squad of small blue-helmet soldiers running forward on the right lane of a long bridge over the ocean, while a massive red enemy swarm + giant bosses advance on the left lane separated by a low divider wall. The player squad auto-shoots forward across the divider into the enemy lane. The player dodges/chooses number gates and weapon crates on the right lane to increase squad size and upgrade firepower. The entire feel should match the video: simple, satisfying, “numbers go up,” lots of shooting, big bosses with HP bars, and flashy weapon upgrades.

1) Camera, Orientation, and Feel
Orientation

Portrait 9:16, full-screen mobile.

Camera

Third-person, slightly top-down, centered behind the player squad.

Camera looks forward along the bridge.

Smooth follow with a tiny lag (spring), minimal shake on explosions and boss hits.

Movement/Speed

Constant forward movement (auto-run).

Speed: moderate (so player can see upcoming gates/crates ~2–3 seconds ahead).

2) World Layout (Match the video)
Environment

A long bridge with guard rails on both sides.

Ocean/sea on both sides (blue water, gentle waves).

The road has light lane markings.

Dual-Lane Setup (IMPORTANT)

Bridge is split into two parallel lanes:

Left lane = Enemy lane (packed with red swarm enemies + bosses).

Right lane = Player lane (gates, weapon crates, pickups).

A low divider wall runs down the middle separating the lanes.

Player stays on right lane only.

Enemies stay on left lane only.

Player bullets can travel across/over the divider into the enemy lane.

3) Player Squad (Blue Soldiers)
Visuals

Small stylized soldiers:

Blue helmet

Simple cartoon proportions

Neutral skin tone / simplified faces

Light military outfit (simple, not realistic).

Squad Behavior

Player controls the squad as a group blob (they cluster).

They run forward and auto-aim/shoot forward-left into the enemy lane.

When squad size increases, the cluster becomes bigger and denser.

Controls

Drag left/right (one finger) to move the squad within the right lane width.

Movement is smooth with slight inertia.

Squad Size

The squad has an integer count N.

Increasing N spawns new soldiers with a short “materialize” effect.

Decreasing N removes soldiers instantly (pop-out).

Lose Condition

If N <= 0 → fail the level (simple “Defeat” screen).

4) Core Combat (Auto Shooting)
Targeting

Squad auto-shoots at:

Closest enemies in the left lane (prioritize swarm near front).

Boss if within range and no swarm blocks (or simply always shoot nearest target).

Damage Numbers + Boss HP Bar

Bosses have a red HP bar above them with a numeric value (e.g., 853, 799, 701, etc.).

On hit, show floating damage numbers occasionally (not every bullet, but frequent enough).

Enemy Death

Swarm enemies “pop” with small white puff + disappear.

Boss staggers slightly on heavy damage, but mostly keeps walking.

5) Enemies (Left Lane)
Swarm Enemies

Hundreds of tiny red enemies filling the lane like a carpet (as in the video).

Very low HP each; die quickly.

They continuously advance forward toward the player’s forward direction (toward the bottom of the screen).

Giant Boss

A few huge muscular mutant bosses (cartoony, exaggerated torso).

Walks on top of the swarm.

High HP (hundreds to ~1000+).

When boss reaches certain proximity threshold to player squad line:

Boss “attacks” (slam) and removes some soldiers per second, OR

Fail state if boss crosses a line.
(Pick one, but keep it simple and readable.)

6) Right Lane Objects: Gates and Weapon Crates
6A) Number Gates (Blue and Red)
Gate Visual

Rectangular frame/sign across part of the lane.

Blue gate = positive number (e.g., +3, +5, +6, +10, +23)

Red gate = negative number (e.g., -5, -7, -8)

Big bold white text with black outline inside the gate.

Gate Effect

When squad passes through:

If +k → N = N + k (spawn k soldiers with blue/white shimmer effect)

If -k → N = max(0, N - k) (remove k soldiers)

Gate Placement / Choice

Often present gates in choice patterns (e.g., two gates positioned left vs right within the right lane width).

Player dodges to select the better one.

6B) Weapon Crates (Shoot-to-Open, with Countdown Number)
Crate Visual

A chest/crate placed on the right lane.

Above it: a weapon icon floating (shotgun / rocket launcher / minigun / rifle).

Around the icon: a glowing golden ring/halo (as in the video).

On the crate front: a big number (e.g., 35, 126, 89, 106, 53) indicating “HP/required shots.”

Crate Mechanic (Match the video’s changing numbers)

The squad automatically shoots the crate when it is in front/in range.

Each bullet reduces the crate number (crate HP) until it reaches 0.

If crate reaches 0 before the squad physically reaches it:

Crate opens → weapon upgrade is granted.

If the squad reaches the crate while it’s not broken:

The squad collides → lose some soldiers (or fully fail that pickup and take a penalty).

Make it harsh enough to matter but not impossible.

Weapon Upgrade Application

When obtained, show a big upgrade VFX:

White glow around squad + swirling particles (purple/white is fine).

All soldiers switch to the new weapon immediately.

7) Weapons (As Seen in the Video)

Implement at least these weapon types and match their “feel”:

1) Basic Gun (Default)

Small yellow bullet tracers.

Medium fire rate.

2) Shotgun

Fires multiple blue projectiles in a small spread (like the video).

Higher burst damage, lower range.

3) Rocket Launcher

Slower firing.

Rockets travel and cause AOE explosion on the left lane swarm (big puff + knockback feel).

Great for clearing dense swarm.

4) Minigun / Energy Stream

Very high DPS.

Visual should become a continuous stream (purple/white energy spray like in the video frames).

Soldiers show ammo belt / bulkier gun silhouette.

This weapon should melt boss HP quickly and look “overpowered.”

8) UI (Keep it minimal like the ad gameplay)
On-Screen Elements

No complex HUD.

Main readable elements:

Gate numbers (+5, -5, etc.)

Crate numbers (126, 53, etc.)

Boss HP bar with numeric HP.

Optional: small squad count display N near top (but not required if you prefer pure diegetic numbers).

Text Style

Big, bold, high-contrast numbers (white with dark outline).

9) Level Flow (Exactly the vibe in the clip)
Start

Begin with 1 soldier on right lane.

Immediately show a negative gate option early (e.g., -8, -7) to create tension.

Quickly introduce first +3 / +5 gate so the squad grows.

Mid

First weapon crate: shotgun with a number around 35.

Then add:

A negative gate (-5)

Another +3 gate to build squad size.

A bigger weapon crate with number around 126 (hard to break unless squad is bigger / strong weapon).

Boss Segment

Spawn a boss with HP around 800–900.

Present big positive gates near boss (+10, +23) to give the “numbers go up” satisfaction.

Make minigun appear before or during boss fight via a crate with number around 53.

End

After boss HP reaches 0:

Show victory splash + coins.

Or cut to a simple end card.

10) Feedback & Juice (Must feel satisfying)
VFX

Bullet trails visible.

Enemy hit flashes.

Explosions for rockets.

Upgrade swirl VFX when weapon changes.

Small screen shake on:

Rocket explosion

Boss big hits

Crate break open.

SFX

Rapid gunfire loops.

Shotgun blast.

Rocket whoosh + boom.

Minigun energy stream sound.

Satisfying “pop” for swarm kills.

“Ding” for passing + gates.

Animations

Soldiers run cycle.

Shooting while running.

Boss lumber walk.

11) Implementation Notes (So it’s easy to build)
Data

squadCount N

weaponType enum

crateHP

bossHP

enemySwarmPool (instanced pooled agents or a visual mass with hitpoints)

Spawning Soldiers

Spawn soldiers around a formation center with slight random offsets.

Keep them packed; avoid jitter.

Performance

Use pooling for enemies and bullets.

Swarm can be simplified (lots of tiny units with very low poly / even billboarded).

12) Deliverables

Build:

One complete playable level replicating the video’s structure: bridge, split lane, swarm + bosses, gates, crates, weapons.

At least 4 weapons (default gun, shotgun, rocket launcher, minigun).

Gate system with + and -.

Crate shoot-to-open system with countdown numbers.

Boss HP bar + numeric HP.

Win/lose screens.