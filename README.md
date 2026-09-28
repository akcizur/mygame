# WILDLANDS

Pixel-art 2D side-scrolling survival exploration game built with Phaser, TypeScript and Vite.

Play: https://akcizur.github.io/mygame/

Controls:
- A / D or Arrow keys — move
- W / Space / Up — jump
- Shift — sprint
- E — gather resources, eat berries, restore at a camp
- Touch controls are available for touch devices

Gameplay:
Explore a long wilderness, collect wood, berries and stone, manage health, hunger and stamina, avoid creatures, discover landmarks and survive the day/night cycle.

Development:
npm install
npm run dev
npm run build

Every push to main runs the production build and deploys dist/ to GitHub Pages through GitHub Actions.


## Nový gameplay loop

Začínáš jako muž ve vlastním domě. Dům funguje jako bezpečná základna se stolem pro psaní deníku a postelí pro posun na další den.

Hlavní smyčka:

`dům → výprava → sběr / objev → návrat → deník → spánek → další den`

Deník ukládá vlastní poznámky i automatické záznamy významných objevů do localStorage, takže zůstávají i po obnovení stránky. Inventář je dostupný přes `I` i mobilní tlačítko `INV`; sebrané suroviny se ukládají jako persistentní stav světa.

Detailní návrh světa a další roadmapa je v [docs/GAMEPLAY.md](docs/GAMEPLAY.md).


## Persistent world

The world is intended to be editable, not static. Collected resources persist, and the first build/remove layer is available with `B` and `R`. This is the foundation for later terrain changes, structures, paths, bridges, shelters and other player-created changes.
