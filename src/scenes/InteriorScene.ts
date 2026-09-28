import Phaser from "phaser";
import { getLocation } from "../world/world";

type InteriorData = {
  locationId?: string;
  outsideX?: number;
};

export class InteriorScene extends Phaser.Scene {
  private player!: Phaser.Physics.Arcade.Sprite;
  private cursors!: Phaser.Types.Input.Keyboard.CursorKeys;
  private keys!: Record<string, Phaser.Input.Keyboard.Key>;
  private platforms!: Phaser.Physics.Arcade.StaticGroup;
  private outsideX = 345;

  constructor() {
    super("InteriorScene");
  }

  create(data: InteriorData = {}) {
    const location = getLocation(data.locationId ?? "house_01");
    this.outsideX = Number.isFinite(data.outsideX) ? data.outsideX! : (location.returnX ?? 345);
    this.createTextures();
    this.platforms = this.physics.add.staticGroup();

    const width = location.width;
    const floorY = 196;
    this.add.rectangle(width / 2, 120, width, 240, location.palette.wall).setDepth(-10);
    this.add.rectangle(width / 2, 164, width, 64, location.palette.floor).setDepth(-9);

    for (let x = 0; x < width; x += 32) {
      const floor = this.platforms.create(x + 16, floorY, "floor") as Phaser.Physics.Arcade.Sprite;
      floor.refreshBody();
    }

    this.drawCabin(width, floorY, location.palette);

    this.player = this.physics.add.sprite(40, 172, "player");
    this.player.setCollideWorldBounds(true);
    this.player.setSize(8, 18).setOffset(2, 2);
    this.physics.add.collider(this.player, this.platforms);

    this.cursors = this.input.keyboard!.createCursorKeys();
    this.keys = {
      a: this.input.keyboard!.addKey("A"),
      d: this.input.keyboard!.addKey("D"),
      e: this.input.keyboard!.addKey("E")
    };

    this.cameras.main.setBounds(0, 0, width, 240);
    this.cameras.main.startFollow(this.player, true, 0.12, 0);
    this.cameras.main.setDeadzone(90, 40);

    this.add.text(8, 8, location.title, {
      fontFamily: "monospace", fontSize: "8px", color: "#e4d5ae"
    }).setScrollFactor(0).setDepth(100);
    this.add.text(8, 20, "INTERIÉR • E = VÝCHOD", {
      fontFamily: "monospace", fontSize: "6px", color: "#8d9a9e"
    }).setScrollFactor(0).setDepth(100);
  }

  update() {
    if (!this.player) return;
    let dir = 0;
    if (this.cursors.left.isDown || this.keys.a.isDown) dir--;
    if (this.cursors.right.isDown || this.keys.d.isDown) dir++;
    this.player.setVelocityX(dir * 72);
    this.player.setFlipX(dir < 0);

    if (Phaser.Input.Keyboard.JustDown(this.keys.e) && this.player.x < 72) this.returnOutside();
  }

  private returnOutside() {
    try {
      const raw = localStorage.getItem("wildlands-save-v1");
      const state = raw ? JSON.parse(raw) : {};
      state.inHouse = false;
      state.playerX = this.outsideX;
      state.playerY = 116;
      state.outsideX = this.outsideX;
      localStorage.setItem("wildlands-save-v1", JSON.stringify(state));
    } catch {}
    this.scene.start("GameScene");
  }

  private createTextures() {
    const g = this.make.graphics({ x: 0, y: 0, add: false });

    g.fillStyle(0x73543d);
    g.fillRect(0, 0, 32, 8);
    g.generateTexture("interior-floor", 32, 8);
    g.clear();

    g.fillStyle(0x172027);
    g.fillRect(2, 1, 8, 15);
    g.fillStyle(0xd9b27b);
    g.fillRect(4, 1, 5, 6);
    g.fillStyle(0x354c3e);
    g.fillRect(2, 7, 8, 7);
    g.fillStyle(0x26313a);
    g.fillRect(2, 14, 3, 6);
    g.fillRect(7, 14, 3, 6);
    g.generateTexture("interior-player", 12, 20);
    g.destroy();

    this.playerTextureAlias();
  }

  private playerTextureAlias() {
    if (this.textures.exists("player")) {
      // GameScene's canonical survivor texture is reused when available.
      return;
    }
    // InteriorScene can also run independently.
    const source = this.textures.get("interior-player");
    this.textures.addCanvas("player", source.source[0].image as HTMLCanvasElement);
  }

  private drawCabin(
    width: number,
    floorY: number,
    palette: { wall: number; floor: number; accent: number }
  ) {
    const g = this.add.graphics().setDepth(-2);
    g.fillStyle(palette.wall);
    g.fillRect(0, 48, width, 112);
    g.lineStyle(1, palette.accent, 1);
    for (let x = 8; x < width; x += 24) g.lineBetween(x, 52, x, 156);

    g.fillStyle(palette.accent);
    g.fillRect(18, 74, 48, 34);
    g.fillStyle(palette.floor);
    g.fillRect(24, 80, 36, 22);

    g.fillStyle(0x3a2b25);
    g.fillRect(Math.max(0, width - 42), 116, 24, 44);

    this.add.text(width / 2, 34, "24 LET OPUŠTĚNÁ CHATA", {
      fontFamily: "monospace", fontSize: "7px", color: "#e8d8a8"
    }).setOrigin(0.5).setDepth(3);

    this.add.text(42, floorY - 18, "E  VÝCHOD", {
      fontFamily: "monospace", fontSize: "5px", color: "#d8c9a3"
    }).setOrigin(0.5).setDepth(3);
  }
}
