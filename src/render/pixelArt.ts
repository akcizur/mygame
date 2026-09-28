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
