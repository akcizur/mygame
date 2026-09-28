import Phaser from "phaser";
import { GameScene } from "./scenes/GameScene";

const GAME_WIDTH = 320;
const GAME_HEIGHT = 240;

const config: Phaser.Types.Core.GameConfig = {
  type: Phaser.AUTO,
  parent: "game",
  backgroundColor: "#10161b",
  pixelArt: true,
  antialias: false,
  roundPixels: true,
  resolution: 1,
  scale: {
    mode: Phaser.Scale.FIT,
    autoCenter: Phaser.Scale.CENTER_BOTH,
    width: GAME_WIDTH,
    height: GAME_HEIGHT
  },
  physics: {
    default: "arcade",
    arcade: {
      gravity: { x: 0, y: 900 },
      debug: false
    }
  },
  render: {
    pixelArt: true,
    antialias: false
  },
  scene: [GameScene]
};

new Phaser.Game(config);
