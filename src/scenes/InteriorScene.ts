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

    this.drawCabin(width, floorY, location.palette, location.id);

    this.player = this.physics.add.sprite(location.id === "cabin_01" ? width - 48 : 40, 172, "interior-player");
    if (location.id === "cabin_01") this.player.setData("lootReady", true);
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

    if (Phaser.Input.Keyboard.JustDown(this.keys.e)) {
      if (this.player.x < 72 || this.player.x > 468) this.returnOutside();
      else if (this.player.getData("lootReady")) this.takeCabinLoot();
    }
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

    // Canonical YEAR 24 survivor: hard pixels, right-facing silhouette.
    g.fillStyle(0x172027); g.fillRect(2, 0, 8, 7);
    g.fillStyle(0x5f4938); g.fillRect(2, 2, 2, 5); // grey-temple hair
    g.fillStyle(0xd0a477); g.fillRect(4, 1, 5, 5);
    g.fillStyle(0x3b2a25); g.fillRect(4, 6, 7, 4); // braided beard
    g.fillStyle(0x354c3e); g.fillRect(2, 8, 8, 7); // military jacket
    g.fillStyle(0x53664d); g.fillRect(8, 9, 3, 5); // pack/shoulder
    g.fillStyle(0x6a543b); g.fillRect(2, 15, 8, 2); // cargo belt
    g.fillStyle(0x26313a); g.fillRect(2, 17, 3, 3); g.fillRect(7, 17, 3, 3); // boots
    g.fillStyle(0xe0c08c); g.fillRect(10, 9, 2, 3); // right hand
    g.generateTexture("interior-player", 12, 20);
    g.destroy();

  }

  private drawCabin(
    width: number,
    floorY: number,
    palette: { wall: number; floor: number; accent: number },
    locationId: string
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

    if (locationId === "cabin_01") {
      const cabin = this.add.graphics().setDepth(1);
      cabin.fillStyle(0x2b2925);
      cabin.fillRect(48, 126, 58, 18);
      cabin.fillStyle(0x806044);
      cabin.fillRect(54, 116, 46, 10);
      cabin.fillStyle(0x25201d);
      cabin.fillRect(68, 128, 16, 16);
      cabin.fillStyle(0x9b7a4f);
      cabin.fillRect(124, 128, 24, 7);
      cabin.fillRect(128, 121, 16, 7);
      cabin.fillStyle(0x2c3932);
      cabin.fillRect(182, 94, 44, 38);
      cabin.fillStyle(0x68746a);
      cabin.fillRect(188, 100, 32, 5);
      cabin.fillStyle(0x514437);
      cabin.fillRect(300, 119, 48, 25);
      cabin.fillStyle(0x9a764d);
      cabin.fillRect(306, 114, 36, 6);
      cabin.fillStyle(0x6d5140);
      cabin.fillRect(388, 112, 18, 32);
      this.add.text(322, 103, "BEDNA", {
        fontFamily: "monospace", fontSize: "5px", color: "#d7c69d"
      }).setOrigin(0.5).setDepth(3);
      this.add.text(205, 86, "STARÉ MAPY", {
        fontFamily: "monospace", fontSize: "5px", color: "#9caea1"
      }).setOrigin(0.5).setDepth(3);
      this.add.text(76, 108, "KRB", {
        fontFamily: "monospace", fontSize: "5px", color: "#c18b51"
      }).setOrigin(0.5).setDepth(3);
    }

    this.add.text(width / 2, 34, locationId === "cabin_01" ? "CHATA • 24 LET OPUŠTĚNÁ" : "24 LET OPUŠTĚNÁ CHATA", {
      fontFamily: "monospace", fontSize: "7px", color: "#e8d8a8"
    }).setOrigin(0.5).setDepth(3);

    this.add.text(locationId === "cabin_01" ? width - 42 : 42, floorY - 18, "E  VÝCHOD", {
      fontFamily: "monospace", fontSize: "5px", color: "#d8c9a3"
    }).setOrigin(0.5).setDepth(3);

    if (locationId === "cabin_01") {
      this.add.text(322, 96, "E  PROHLEDAT BEDNU", {
        fontFamily: "monospace", fontSize: "5px", color: "#d8c9a3"
      }).setOrigin(0.5).setDepth(3);
    }
  }

  private takeCabinLoot() {
    const raw = localStorage.getItem("wildlands-cabin-01-v1");
    if (raw === "1") {
      this.showCabinMessage("BEDNA JE PRÁZDNÁ.");
      return;
    }
    try {
      const save = localStorage.getItem("wildlands-save-v1");
      const state = save ? JSON.parse(save) : {};
      state.wood = (Number(state.wood) || 0) + 4;
      state.stone = (Number(state.stone) || 0) + 2;
      localStorage.setItem("wildlands-save-v1", JSON.stringify(state));
      localStorage.setItem("wildlands-cabin-01-v1", "1");
      this.showCabinMessage("BEDNA • +4 DŘEVA • +2 KAMENE");
    } catch {
      this.showCabinMessage("BEDNU SE NEPODAŘILO OTEVŘÍT.");
    }
  }

  private showCabinMessage(message: string) {
    const text = this.add.text(260, 58, message, {
      fontFamily: "monospace", fontSize: "6px", color: "#e4d5ae",
      backgroundColor: "#172027", padding: { x: 4, y: 3 }
    }).setScrollFactor(0).setDepth(100);
    this.time.delayedCall(2200, () => text.destroy());
  }
}
