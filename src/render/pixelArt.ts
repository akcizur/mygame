import Phaser from "phaser";

export const YEAR24 = {
  ink: 0x172027, skin: 0xd0a477, hair: 0x5f4938, beard: 0x3b2a25,
  jacket: 0x354c3e, pack: 0x53664d, pants: 0x6a543b, boots: 0x26313a, hand: 0xe0c08c,
  grass: 0x314c38, grassDark: 0x243b2e, dirt: 0x3f332b, wood: 0x70513d,
  woodLight: 0x9a764d, concrete: 0x515a59, rust: 0x7c543d, vine: 0x58734f
} as const;

export function createPixelTexture(scene: Phaser.Scene, key: string, width: number, height: number, draw: (g: Phaser.GameObjects.Graphics) => void) {
  const g = scene.make.graphics({ x: 0, y: 0, add: false });
  draw(g);
  g.generateTexture(key, width, height);
  g.destroy();
}

export function drawYear24Survivor(g: Phaser.GameObjects.Graphics) {
  g.fillStyle(YEAR24.ink); g.fillRect(2, 0, 8, 7);
  g.fillStyle(YEAR24.hair); g.fillRect(2, 2, 2, 5);
  g.fillStyle(YEAR24.skin); g.fillRect(4, 1, 5, 5);
  g.fillStyle(YEAR24.beard); g.fillRect(4, 6, 7, 4);
  g.fillStyle(YEAR24.jacket); g.fillRect(2, 8, 8, 7);
  g.fillStyle(YEAR24.pack); g.fillRect(8, 9, 3, 5);
  g.fillStyle(YEAR24.pants); g.fillRect(2, 15, 8, 2);
  g.fillStyle(YEAR24.boots); g.fillRect(2, 17, 3, 3); g.fillRect(7, 17, 3, 3);
  g.fillStyle(YEAR24.hand); g.fillRect(10, 9, 2, 3);
}

export function drawPixelTile(g: Phaser.GameObjects.Graphics, kind: "grass" | "wood" | "concrete" | "metal" | "vine" | "debris") {
  if (kind === "grass") {
    g.fillStyle(YEAR24.grassDark); g.fillRect(0, 0, 32, 4);
    g.fillStyle(YEAR24.grass); g.fillRect(0, 4, 32, 28);
    g.fillStyle(YEAR24.vine); g.fillRect(4, 9, 3, 3); g.fillRect(20, 17, 4, 3); g.fillRect(11, 25, 3, 4);
    return;
  }
  if (kind === "wood") {
    g.fillStyle(YEAR24.wood); g.fillRect(0, 0, 32, 32);
    g.fillStyle(YEAR24.woodLight); g.fillRect(0, 2, 32, 3); g.fillRect(8, 12, 18, 2);
    g.fillStyle(YEAR24.dirt); g.fillRect(5, 23, 3, 7); g.fillRect(24, 7, 3, 8);
    return;
  }
  if (kind === "concrete") {
    g.fillStyle(YEAR24.concrete); g.fillRect(0, 0, 32, 32);
    g.fillStyle(0x68716f); g.fillRect(3, 4, 9, 3); g.fillRect(18, 20, 7, 3);
    g.fillStyle(0x3c4546); g.fillRect(13, 12, 4, 4); g.fillRect(27, 7, 3, 11);
    return;
  }
  if (kind === "metal") {
    g.fillStyle(0x3f4849); g.fillRect(0, 0, 32, 32);
    g.fillStyle(0x69706c); g.fillRect(3, 4, 26, 3);
    g.fillStyle(YEAR24.rust); g.fillRect(8, 9, 4, 15); g.fillRect(21, 19, 7, 4);
    return;
  }
  if (kind === "vine") {
    g.fillStyle(YEAR24.vine); g.fillRect(3, 0, 3, 32);
    g.fillRect(6, 8, 8, 3); g.fillRect(11, 11, 3, 12);
    g.fillRect(14, 20, 9, 3); g.fillRect(20, 22, 3, 7);
    return;
  }
  g.fillStyle(0x303837); g.fillRect(2, 18, 28, 8);
  g.fillStyle(YEAR24.concrete); g.fillRect(5, 14, 8, 7); g.fillRect(19, 10, 10, 9);
  g.fillStyle(YEAR24.rust); g.fillRect(14, 22, 5, 4);
}

export function registerYear24Tiles(scene: Phaser.Scene) {
  const kinds: Array<"grass" | "wood" | "concrete" | "metal" | "vine" | "debris"> = ["grass", "wood", "concrete", "metal", "vine", "debris"];
  for (const kind of kinds) createPixelTexture(scene, `tile-${kind}`, 32, 32, g => drawPixelTile(g, kind));
}
