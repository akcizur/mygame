import Phaser from "phaser";

const WORLD_W = 9000;
const WORLD_H = 180;
const GROUND_Y = 142;
const HOUSE = { left: 72, right: 345 };

type DiaryEntry = {
  day: number;
  text: string;
  createdAt: string;
};

export class GameScene extends Phaser.Scene {
  private player!: Phaser.Physics.Arcade.Sprite;
  private cursors!: Phaser.Types.Input.Keyboard.CursorKeys;
  private keys!: Record<string, Phaser.Input.Keyboard.Key>;
  private platforms!: Phaser.Physics.Arcade.StaticGroup;
  private resources!: Phaser.Physics.Arcade.StaticGroup;
  private creatures!: Phaser.Physics.Arcade.Group;
  private ui!: Phaser.GameObjects.Container;
  private hud!: Phaser.GameObjects.Text;
  private messageText!: Phaser.GameObjects.Text;

  private message = "";
  private messageUntil = 0;
  private hunger = 100;
  private health = 100;
  private stamina = 100;
  private wood = 0;
  private berries = 0;
  private stone = 0;
  private day = 0;
  private clock = 0.30;
  private facing = 1;
  private actionCooldown = 0;
  private invulnerable = 0;
  private seed = 4729.17;
  private currentZone = "DŮM";
  private discoveries = new Set<string>();
  private collectedResources = new Set<string>();
  private inventoryOpen = false;
  private inventoryOverlay?: HTMLDivElement;
  private diaryOpen = false;
  private diaryOverlay?: HTMLDivElement;
  private diaryTextarea?: HTMLTextAreaElement;
  private diaryList?: HTMLDivElement;
  private saveKey = "wildlands-save-v1";

  create() {
    this.createTextures();
    this.createWorld();
    this.createPlayer();
    this.loadGame();
    this.applyCollectedResources();
    this.createHUD();
    this.createTouchControls();
    this.createDiaryUI();
    this.createInventoryUI();

    this.cursors = this.input.keyboard!.createCursorKeys();
    this.keys = {
      a: this.input.keyboard!.addKey("A"),
      d: this.input.keyboard!.addKey("D"),
      w: this.input.keyboard!.addKey("W"),
      space: this.input.keyboard!.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE),
      i: this.input.keyboard!.addKey("I"),
      e: this.input.keyboard!.addKey("E"),
      shift: this.input.keyboard!.addKey(Phaser.Input.Keyboard.KeyCodes.SHIFT)
    };

    this.cameras.main.setBounds(0, 0, WORLD_W, WORLD_H);
    this.cameras.main.startFollow(this.player, true, 0.08, 0.08);
    this.cameras.main.setDeadzone(70, 34);
    this.showMessage("DEN " + (this.day + 1) + " • JSI DOMA. PROZKOUMEJ OKOLÍ A VEČER SE VRAŤ.", 5200);

    this.scale.on("resize", this.layoutUI, this);
    this.events.once(Phaser.Scenes.Events.SHUTDOWN, () => { this.diaryOverlay?.remove(); this.inventoryOverlay?.remove(); });
    this.layoutUI();
  }

  private createTextures() {
    const g = this.make.graphics({ x: 0, y: 0, add: false });
    const texture = (key: string, w: number, h: number, draw: () => void) => {
      g.clear();
      draw();
      g.generateTexture(key, w, h);
    };

    texture("ground", 32, 44, () => {
      g.fillStyle(0x243b2e); g.fillRect(0, 0, 32, 6);
      g.fillStyle(0x314c38); g.fillRect(0, 6, 32, 38);
      g.fillStyle(0x203127); g.fillRect(4, 9, 3, 3); g.fillRect(21, 17, 4, 3); g.fillRect(11, 29, 3, 5);
    });

    texture("player", 12, 20, () => {
      g.fillStyle(0x172027); g.fillRect(3, 0, 7, 8);
      g.fillStyle(0xd9b27b); g.fillRect(4, 1, 5, 6);
      g.fillStyle(0x6f4631); g.fillRect(3, 7, 7, 7);
      g.fillStyle(0x354c3e); g.fillRect(2, 8, 8, 6);
      g.fillStyle(0x26313a); g.fillRect(2, 14, 3, 6); g.fillRect(7, 14, 3, 6);
      g.fillStyle(0xe6d2a4); g.fillRect(9, 10, 3, 3);
    });

    texture("house-wall", 110, 70, () => {
      g.fillStyle(0x49392d); g.fillRect(2, 16, 106, 54);
      g.fillStyle(0x68503c); g.fillRect(6, 20, 98, 46);
      g.fillStyle(0x32261f); g.fillRect(46, 42, 20, 28);
      g.fillStyle(0x8a6a4b); g.fillRect(49, 45, 14, 25);
      g.fillStyle(0x5a4331); g.fillRect(10, 30, 20, 16);
      g.fillStyle(0x8db1ad); g.fillRect(13, 33, 14, 10);
      g.fillStyle(0x33261f); g.fillRect(36, 28, 8, 8);
      g.fillStyle(0xc18b51); g.fillRect(39, 31, 2, 2);
    });

    texture("house-roof", 122, 24, () => {
      g.fillStyle(0x302523); g.fillRect(8, 2, 106, 14);
      g.fillStyle(0x55413a); g.fillRect(2, 9, 118, 9);
      g.fillStyle(0x211b1a); g.fillRect(18, 18, 86, 4);
      g.fillStyle(0x76504a); g.fillRect(26, 3, 4, 11); g.fillRect(50, 3, 4, 11); g.fillRect(74, 3, 4, 11); g.fillRect(98, 3, 4, 11);
    });

    texture("bed", 24, 13, () => {
      g.fillStyle(0x5a4030); g.fillRect(2, 7, 20, 5);
      g.fillStyle(0xc5b89a); g.fillRect(4, 3, 17, 7);
      g.fillStyle(0xe6ddc2); g.fillRect(4, 4, 7, 6);
      g.fillStyle(0x80654c); g.fillRect(0, 11, 3, 2); g.fillRect(20, 11, 3, 2);
    });

    texture("desk", 18, 14, () => {
      g.fillStyle(0x5c412e); g.fillRect(2, 3, 14, 3);
      g.fillRect(4, 6, 2, 8); g.fillRect(12, 6, 2, 8);
      g.fillStyle(0xe4d5ae); g.fillRect(5, 1, 6, 2);
      g.fillStyle(0x8c2d32); g.fillRect(10, 1, 3, 2);
    });

    texture("tree", 18, 34, () => {
      g.fillStyle(0x4b3026); g.fillRect(7, 18, 5, 16);
      g.fillStyle(0x254c3a); g.fillRect(3, 10, 12, 12);
      g.fillStyle(0x356347); g.fillRect(1, 13, 16, 8);
      g.fillStyle(0x487553); g.fillRect(5, 5, 9, 12);
      g.fillStyle(0x5d8957); g.fillRect(7, 3, 5, 6);
    });

    texture("berry", 12, 12, () => {
      g.fillStyle(0x376448); g.fillRect(5, 0, 2, 5);
      g.fillStyle(0x28533d); g.fillRect(2, 4, 8, 6);
      g.fillStyle(0xa63d4b); g.fillRect(3, 5, 3, 3); g.fillRect(7, 6, 3, 3);
    });

    texture("rock", 16, 11, () => {
      g.fillStyle(0x59616a); g.fillRect(2, 4, 12, 6); g.fillRect(5, 2, 7, 8);
      g.fillStyle(0x818a91); g.fillRect(6, 3, 5, 2);
    });

    texture("slime", 14, 10, () => {
      g.fillStyle(0x8ca45d); g.fillRect(2, 3, 10, 7); g.fillRect(4, 1, 6, 9);
      g.fillStyle(0x1c2525); g.fillRect(5, 4, 1, 2); g.fillRect(9, 4, 1, 2);
    });

    texture("campfire", 18, 18, () => {
      g.fillStyle(0x4a3024); g.fillRect(3, 12, 12, 4); g.fillRect(5, 9, 8, 4);
      g.fillStyle(0xe6a23c); g.fillRect(6, 5, 6, 8); g.fillStyle(0xffd66b); g.fillRect(8, 3, 3, 7);
    });

    texture("ruin", 28, 27, () => {
      g.fillStyle(0x515a59); g.fillRect(2, 7, 24, 20); g.fillRect(5, 1, 7, 8); g.fillRect(18, 4, 7, 5);
      g.fillStyle(0x8b9490); g.fillRect(5, 7, 5, 3); g.fillRect(17, 11, 4, 3);
      g.fillStyle(0x2e3637); g.fillRect(11, 12, 7, 15);
    });

    texture("river", 220, 18, () => {
      g.fillStyle(0x315a67); g.fillRect(0, 0, 220, 18);
      g.fillStyle(0x5d8990); g.fillRect(0, 3, 48, 2); g.fillRect(86, 9, 54, 2); g.fillRect(158, 4, 41, 2);
      g.fillStyle(0x21434f); g.fillRect(25, 13, 36, 2); g.fillRect(146, 14, 44, 2);
    });

    g.destroy();
  }

  private createWorld() {
    this.add.rectangle(WORLD_W / 2, 90, WORLD_W, WORLD_H, 0x162129).setDepth(-20);
    const sky = this.add.graphics().setDepth(-19);
    sky.fillStyle(0x162129); sky.fillRect(0, 0, WORLD_W, 180);
    sky.fillStyle(0x1d3037); sky.fillRect(0, 54, WORLD_W, 40);
    sky.fillStyle(0x243b3d); sky.fillRect(0, 94, WORLD_W, 48);

    this.drawDistantHills();

    this.platforms = this.physics.add.staticGroup();
    this.resources = this.physics.add.staticGroup();
    this.creatures = this.physics.add.group({ allowGravity: true });

    for (let x = 0; x < WORLD_W; x += 32) {
      const y = GROUND_Y + Math.floor(this.noise(x * 0.015) * 5);
      const ground = this.platforms.create(x + 16, y + 22, "ground") as Phaser.Physics.Arcade.Sprite;
      ground.setDisplaySize(32, 44);
      ground.refreshBody();
    }

    this.add.image(218, 94, "house-wall").setDepth(1);
    this.add.image(218, 49, "house-roof").setDepth(2);
    this.add.image(136, 122, "bed").setDepth(3);
    this.add.image(257, 119, "desk").setDepth(3);
    this.add.text(257, 103, "DENÍK", {
      fontFamily: "monospace", fontSize: "5px", color: "#e4d5ae"
    }).setOrigin(0.5).setDepth(4);
    this.add.text(218, 77, "DOMOV", {
      fontFamily: "monospace", fontSize: "6px", color: "#e4d5ae"
    }).setOrigin(0.5).setDepth(4);

    this.add.image(3940, GROUND_Y - 4, "river").setDisplaySize(440, 18).setDepth(0);
    this.add.rectangle(3940, GROUND_Y + 3, 440, 8, 0x315a67, 0.9).setDepth(-1);

    const zones: Array<[number, string]> = [
      [520, "LOUKY"], [1900, "LES"], [3660, "ŘEKA"], [5000, "HŘEBEN"], [6900, "RUINY"]
    ];
    for (const [x, label] of zones) {
      this.add.text(x, 18, label, {
        fontFamily: "monospace", fontSize: "5px", color: "#7e9292"
      }).setOrigin(0.5).setDepth(-5);
    }

    for (let x = 460; x < WORLD_W - 100; x += 100 + Math.floor(this.noise(x) * 90)) {
      const n = this.noise(x * 0.7);
      const zoneX = x;
      if (zoneX > 3500 && zoneX < 4400) continue;
      if (n > 0.35) {
        this.spawnResource(x, GROUND_Y - 16, "tree", "wood", 3);
      } else if (n < -0.12) {
        this.spawnResource(x + 20, GROUND_Y - 8, "berry", "berry", 2);
      } else {
        this.spawnResource(x + 35, GROUND_Y - 5, "rock", "stone", 2);
      }
    }

    this.landmark(1450, "STARÝ TÁBOR", "campfire");
    this.landmark(4760, "SAMOTÁŘSKÁ CHATA", "campfire");
    this.landmark(6200, "VYHLÍDKA", "campfire");
    this.landmark(8250, "RUINY", "ruin");

    for (let i = 0; i < 30; i++) {
      const x = 600 + i * 275 + this.noise(i) * 110;
      const enemy = this.creatures.create(x, GROUND_Y - 10, "slime") as Phaser.Physics.Arcade.Sprite;
      enemy.setData("dir", this.noise(i * 2) > 0 ? 1 : -1);
      enemy.setData("origin", x);
      enemy.setVelocityX((enemy.getData("dir") as number) * 18);
    }

    this.physics.add.collider(this.creatures, this.platforms);
  }

  private applyCollectedResources() {
    this.resources.children.each(obj => {
      const resource = obj as Phaser.Physics.Arcade.Sprite;
      const id = resource.getData("id") as string;
      if (id && this.collectedResources.has(id)) resource.destroy();
      return true;
    });
  }

  private spawnResource(x: number, y: number, texture: string, type: string, amount: number) {
    const id = type + "-" + Math.round(x * 10);
    if (this.collectedResources.has(id)) return;
    const resource = this.resources.create(x, y, texture) as Phaser.Physics.Arcade.Sprite;
    resource.setData("id", id);
    resource.setData("resource", type);
    resource.setData("amount", amount);
  }

  private drawDistantHills() {
    const hills = this.add.graphics().setDepth(-15);
    hills.fillStyle(0x22383d);
    for (let x = 0; x < WORLD_W; x += 220) {
      const peak = 42 + Math.floor(this.noise(x * 0.06) * 14);
      hills.fillTriangle(x, 106, x + 110, peak, x + 220, 106);
    }

    const trees = this.add.graphics().setDepth(-14);
    trees.fillStyle(0x1c3030);
    for (let x = 420; x < WORLD_W; x += 86) {
      const y = 92 + Math.floor(this.noise(x * 0.1) * 8);
      trees.fillRect(x, y, 6, 50);
      trees.fillTriangle(x - 11, y + 18, x + 3, y - 10, x + 17, y + 18);
      trees.fillTriangle(x - 9, y + 28, x + 3, y + 2, x + 15, y + 28);
    }
  }

  private landmark(x: number, label: string, texture: string) {
    this.add.image(x, GROUND_Y - 10, texture).setScale(1.2).setDepth(2);
    this.add.text(x, GROUND_Y - 31, label, {
      fontFamily: "monospace", fontSize: "5px", color: "#e8d8a8"
    }).setOrigin(0.5).setDepth(3);
  }

  private createPlayer() {
    this.player = this.physics.add.sprite(158, 116, "player");
    this.player.setCollideWorldBounds(true);
    this.player.setSize(8, 18).setOffset(2, 2);
    this.player.setDepth(5);
    this.physics.add.collider(this.player, this.platforms);
  }

  private createHUD() {
    this.ui = this.add.container(0, 0).setScrollFactor(0).setDepth(100);
    const panel = this.add.rectangle(0, 0, 162, 44, 0x0b1014, 0.9).setOrigin(0);
    panel.setStrokeStyle(1, 0x52636a, 0.6);
    this.hud = this.add.text(7, 5, "", {
      fontFamily: "monospace", fontSize: "7px", color: "#e6eee8", lineSpacing: 2
    });
    this.messageText = this.add.text(7, 50, "", {
      fontFamily: "monospace", fontSize: "7px", color: "#d6c78b", stroke: "#0b1014", strokeThickness: 3
    }).setVisible(false);
    this.ui.add([panel, this.hud, this.messageText]);
  }

  private createTouchControls() {
    const button = (label: string) => {
      const box = this.add.rectangle(0, 0, 42, 34, 0x172027, 0.72).setStrokeStyle(1, 0x80939a, 0.55);
      const text = this.add.text(0, 0, label, {
        fontFamily: "monospace", fontSize: "9px", color: "#e7eee8"
      }).setOrigin(0.5);
      const c = this.add.container(0, 0, [box, text]).setScrollFactor(0).setDepth(110);
      c.setSize(42, 34);
      box.setInteractive();
      return { c, box };
    };

    const l = button("◀"), r = button("▶"), j = button("▲"), a = button("E"), inv = button("INV");
    this.ui.add([l.c, r.c, j.c, a.c, inv.c]);

    const bind = (box: Phaser.GameObjects.Rectangle, key: string) => {
      box.on("pointerdown", () => this.player.setData(key, true));
      box.on("pointerup", () => this.player.setData(key, false));
      box.on("pointerout", () => this.player.setData(key, false));
      box.on("pointercancel", () => this.player.setData(key, false));
    };

    bind(l.box, "left"); bind(r.box, "right"); bind(j.box, "jump"); bind(a.box, "action");
    inv.box.on("pointerdown", () => this.toggleInventory());
  }

  private createDiaryUI() {
    const root = document.createElement("div");
    root.id = "wildlands-diary";
    Object.assign(root.style, {
      position: "fixed", inset: "0", display: "none", alignItems: "center", justifyContent: "center",
      padding: "18px", boxSizing: "border-box", background: "rgba(6,10,12,.82)", zIndex: "9999",
      fontFamily: "monospace", color: "#e6eee8", touchAction: "auto"
    });

    const card = document.createElement("div");
    Object.assign(card.style, {
      width: "min(680px, 100%)", maxHeight: "90vh", overflow: "auto", boxSizing: "border-box",
      border: "1px solid #52636a", background: "#0d1418", padding: "18px",
      boxShadow: "0 18px 60px rgba(0,0,0,.5)"
    });

    const title = document.createElement("div");
    title.textContent = "DENÍK";
    title.style.cssText = "font-size:18px;letter-spacing:.16em;margin-bottom:4px;";

    const subtitle = document.createElement("div");
    subtitle.textContent = "Poznámky z cesty";
    subtitle.style.cssText = "font-size:11px;color:#8d9a9e;margin-bottom:14px;";

    const textarea = document.createElement("textarea");
    textarea.placeholder = "Co se dnes stalo? Co jsi našel, čeho ses bál, kam se chceš vrátit…";
    textarea.rows = 8;
    Object.assign(textarea.style, {
      width: "100%", boxSizing: "border-box", resize: "vertical", padding: "12px",
      background: "#111b20", color: "#e6eee8", border: "1px solid #425057",
      outline: "none", font: "13px monospace", lineHeight: "1.5"
    });

    const actions = document.createElement("div");
    actions.style.cssText = "display:flex;gap:8px;justify-content:flex-end;margin-top:10px;";

    const button = (label: string) => {
      const b = document.createElement("button");
      b.textContent = label;
      b.style.cssText = "padding:10px 14px;background:#172027;color:#e6eee8;border:1px solid #52636a;font:12px monospace;cursor:pointer;";
      return b;
    };

    const close = button("ZAVŘÍT");
    const save = button("ULOŽIT ZÁPIS");
    const list = document.createElement("div");
    list.style.cssText = "margin-top:18px;border-top:1px solid #2b373c;padding-top:12px;";

    close.onclick = () => this.closeDiary();
    save.onclick = () => this.saveDiary();

    actions.append(close, save);
    card.append(title, subtitle, textarea, actions, list);
    root.appendChild(card);
    document.body.appendChild(root);

    this.diaryOverlay = root;
    this.diaryTextarea = textarea;
    this.diaryList = list;
  }

  private createInventoryUI() {
    const root = document.createElement("div");
    root.id = "wildlands-inventory";
    Object.assign(root.style, {
      position: "fixed", inset: "0", display: "none", alignItems: "flex-end", justifyContent: "center",
      padding: "14px", boxSizing: "border-box", background: "rgba(6,10,12,.45)", zIndex: "9998",
      fontFamily: "monospace", color: "#e6eee8", touchAction: "auto"
    });
    const card = document.createElement("div");
    Object.assign(card.style, {
      width: "min(520px, 100%)", boxSizing: "border-box", border: "1px solid #52636a",
      background: "#0d1418", padding: "14px", boxShadow: "0 12px 40px rgba(0,0,0,.45)"
    });
    const title = document.createElement("div");
    title.textContent = "VÝBAVA";
    title.style.cssText = "font-size:14px;letter-spacing:.14em;margin-bottom:10px;";
    const body = document.createElement("div");
    body.id = "wildlands-inventory-body";
    body.style.cssText = "font-size:12px;line-height:1.8;color:#cbd4d4;";
    const hint = document.createElement("div");
    hint.textContent = "I / klepnutí na VÝBAVA — zavřít";
    hint.style.cssText = "margin-top:8px;font-size:9px;color:#7f8d91;";
    card.append(title, body, hint);
    root.appendChild(card);
    document.body.appendChild(root);
    root.onclick = (event) => { if (event.target === root) this.closeInventory(); };
    this.inventoryOverlay = root;
  }

  private toggleInventory() {
    if (this.inventoryOpen) this.closeInventory(); else this.openInventory();
  }

  private openInventory() {
    if (!this.inventoryOverlay) return;
    this.inventoryOpen = true;
    this.player.setVelocity(0, 0);
    this.inventoryOverlay.style.display = "flex";
    const body = this.inventoryOverlay.querySelector("#wildlands-inventory-body");
    if (body) body.innerHTML = "<div>WOOD &nbsp; " + this.wood + "</div><div>BOBULE &nbsp; " + this.berries + "</div><div>KÁMEN &nbsp; " + this.stone + "</div><div style='margin-top:8px;color:#d6c78b'>NÁSTROJE &nbsp; zatím žádné</div><div>CRAFTING &nbsp; odemkne pracovní stůl</div>";
  }

  private closeInventory() {
    this.inventoryOpen = false;
    if (this.inventoryOverlay) this.inventoryOverlay.style.display = "none";
  }

  private openDiary() {
    if (!this.diaryOverlay || !this.diaryTextarea) return;
    this.diaryOpen = true;
    this.player.setVelocity(0, 0);
    this.diaryOverlay.style.display = "flex";
    this.diaryTextarea.value = "";
    this.renderDiaryHistory();
    window.setTimeout(() => this.diaryTextarea?.focus(), 0);
  }

  private closeDiary() {
    this.diaryOpen = false;
    if (this.diaryOverlay) this.diaryOverlay.style.display = "none";
  }

  private loadDiary(): DiaryEntry[] {
    try {
      return JSON.parse(localStorage.getItem("wildlands-diary-v1") || "[]") as DiaryEntry[];
    } catch {
      return [];
    }
  }

  private saveDiary() {
    const text = this.diaryTextarea?.value.trim() || "";
    if (!text) return;
    const entries = this.loadDiary();
    entries.push({
      day: this.day + 1,
      text,
      createdAt: new Date().toISOString()
    });
    localStorage.setItem("wildlands-diary-v1", JSON.stringify(entries.slice(-30)));
    this.saveGame();
    this.showMessage("ZÁPIS ULOŽEN • DEN " + (this.day + 1), 1800);
    this.renderDiaryHistory();
    if (this.diaryTextarea) this.diaryTextarea.value = "";
  }

  private renderDiaryHistory() {
    if (!this.diaryList) return;
    this.diaryList.replaceChildren();
    const entries = this.loadDiary().slice(-5).reverse();

    const heading = document.createElement("div");
    heading.textContent = entries.length ? "POSLEDNÍ ZÁPISY" : "ZATÍM ŽÁDNÉ ZÁPISY";
    heading.style.cssText = "font-size:10px;color:#8d9a9e;margin-bottom:9px;";
    this.diaryList.appendChild(heading);

    for (const entry of entries) {
      const block = document.createElement("div");
      block.style.cssText = "border-left:2px solid #52636a;padding:6px 0 6px 10px;margin:8px 0;";

      const meta = document.createElement("div");
      meta.textContent = "DEN " + entry.day;
      meta.style.cssText = "font-size:9px;color:#d6c78b;margin-bottom:4px;";

      const copy = document.createElement("div");
      copy.textContent = entry.text;
      copy.style.cssText = "font-size:11px;color:#cbd4d4;white-space:pre-wrap;line-height:1.45;";

      block.append(meta, copy);
      this.diaryList.appendChild(block);
    }
  }

  update(_time: number, delta: number) {
    if (this.diaryOpen || this.inventoryOpen) {
      this.player.setVelocity(0, 0);
      this.updateHUD();
      return;
    }

    const dt = delta / 1000;
    this.clock += dt / 170;
    if (this.clock >= 1) {
      this.clock -= 1;
      this.day++;
      this.saveGame();
      this.showMessage("NOVÝ DEN • ZAPIŠ SI, CO SE ZMĚNILO.", 2800);
    }

    this.hunger = Math.max(0, this.hunger - dt * 0.55);
    this.stamina = Math.min(100, this.stamina + dt * 12);
    this.actionCooldown = Math.max(0, this.actionCooldown - dt);
    this.invulnerable = Math.max(0, this.invulnerable - dt);

    let dir = 0;
    if (this.cursors.left.isDown || this.keys.a.isDown || this.player.getData("left")) dir--;
    if (this.cursors.right.isDown || this.keys.d.isDown || this.player.getData("right")) dir++;

    const sprint = this.keys.shift.isDown && this.stamina > 1;
    const speed = sprint ? 125 : 82;
    if (dir) {
      this.facing = dir;
      this.player.setVelocityX(dir * speed);
      this.player.setFlipX(dir < 0);
      if (sprint) this.stamina = Math.max(0, this.stamina - dt * 24);
    } else {
      this.player.setVelocityX(Phaser.Math.Linear(this.player.body!.velocity.x, 0, 0.22));
    }

    const jump = this.cursors.up.isDown || this.keys.w.isDown || this.keys.space.isDown || this.player.getData("jump");
    if (jump && (this.player.body!.blocked.down || this.player.body!.touching.down)) {
      this.player.setVelocityY(-300);
      this.player.setData("jump", false);
    }

    if (Phaser.Input.Keyboard.JustDown(this.keys.i)) this.toggleInventory();

    if (Phaser.Input.Keyboard.JustDown(this.keys.e) || this.player.getData("action")) {
      this.player.setData("action", false);
      this.interact();
    }

    if (this.hunger <= 0) this.health = Math.max(0, this.health - dt * 2);
    if (this.health <= 0) this.respawn();

    this.creatures.children.each(obj => {
      const e = obj as Phaser.Physics.Arcade.Sprite;
      const origin = e.getData("origin") as number;
      if (Math.abs(e.x - origin) > 70) e.setData("dir", -(e.getData("dir") as number));
      e.setVelocityX((e.getData("dir") as number) * 18);

      if (
        e.x > HOUSE.right &&
        Phaser.Math.Distance.Between(e.x, e.y, this.player.x, this.player.y) < 16 &&
        this.invulnerable <= 0
      ) {
        this.health = Math.max(0, this.health - 8);
        this.invulnerable = 1;
        this.player.setVelocityX((this.player.x < e.x ? -1 : 1) * 130);
        this.player.setVelocityY(-120);
      }
      return true;
    });

    this.updateZoneAndDiscoveries();
    this.updateLighting();
    this.updateHUD();
  }

  private interact() {
    if (this.actionCooldown > 0) return;
    this.actionCooldown = 0.3;

    if (Math.abs(this.player.x - 257) < 34 && Math.abs(this.player.y - 116) < 28) {
      this.openDiary();
      return;
    }

    if (Math.abs(this.player.x - 136) < 34 && Math.abs(this.player.y - 116) < 28) {
      this.sleepAtHome();
      return;
    }

    let nearest: Phaser.Physics.Arcade.Sprite | null = null;
    let best = 38;

    this.resources.children.each(obj => {
      const r = obj as Phaser.Physics.Arcade.Sprite;
      const d = Phaser.Math.Distance.Between(this.player.x, this.player.y, r.x, r.y);
      if (d < best) {
        best = d;
        nearest = r;
      }
      return true;
    });

    if (nearest) {
      const r = nearest;
      const type = r.getData("resource") as string;
      const amount = r.getData("amount") as number;
      if (type === "wood") this.wood += amount;
      if (type === "berry") this.berries += amount;
      if (type === "stone") this.stone += amount;
      const resourceId = r.getData("id") as string;
      if (resourceId) this.collectedResources.add(resourceId);
      r.destroy();
      this.saveGame();
      this.showMessage("+" + amount + " " + type.toUpperCase(), 1200);
      return;
    }

    if (this.berries > 0 && this.hunger < 96) {
      this.berries--;
      this.hunger = Math.min(100, this.hunger + 24);
      this.showMessage("SNĚDL JSI BOBULE • HUNGER +24", 1200);
      return;
    }

    if (this.wood >= 3 && this.stone >= 2) {
      this.wood -= 3;
      this.stone -= 2;
      this.health = Math.min(100, this.health + 20);
      this.hunger = Math.min(100, this.hunger + 10);
      this.showMessage("PROVIZORNÍ OHEŇ • HP +20", 1600);
      return;
    }

    this.showMessage("E: SBÍRAT • JÍST • ODPOČÍVAT • DENÍK", 1400);
  }

  private sleepAtHome() {
    const phase = this.getPhase();
    if (phase === "DAY" || phase === "DAWN") {
      this.showMessage("JEŠTĚ NENÍ ČAS SPÁT. PROZKOUMEJ OKOLÍ.", 1700);
      return;
    }

    this.day++;
    this.clock = 0.27;
    this.health = Math.min(100, this.health + 32);
    this.hunger = Math.min(100, this.hunger + 38);
    this.stamina = 100;
    this.player.setPosition(158, 116);
    this.player.setVelocity(0, 0);
    this.saveGame();
    this.showMessage("RÁNO • DEN " + (this.day + 1) + " • DOMA JSI V BEZPEČÍ.", 2600);
  }

  private updateZoneAndDiscoveries() {
    const x = this.player.x;
    const nextZone =
      x < HOUSE.right ? "DŮM" :
      x < 1900 ? "LOUKY" :
      x < 3660 ? "LES" :
      x < 5000 ? "ŘEKA" :
      x < 6900 ? "HŘEBEN" : "RUINY";

    if (nextZone !== this.currentZone) {
      this.currentZone = nextZone;
      this.showMessage("VSTUPUJEŠ: " + nextZone, 1500);
    }

    const checks: Array<[number, string, string]> = [
      [1450, "STARÝ TÁBOR", "Našel jsem starý tábor. Někdo tu žil předemnou."],
      [4760, "SAMOTÁŘSKÁ CHATA", "U řeky stojí další chata. Vypadá opuštěně."],
      [6200, "VYHLÍDKA", "Z vyhlídky je vidět velká část údolí."],
      [8250, "RUINY", "Našel jsem ruiny. Musím se sem vrátit s lepší výbavou."]
    ];

    for (const [xPos, name, note] of checks) {
      if (!this.discoveries.has(name) && Math.abs(this.player.x - xPos) < 28) {
        this.discoveries.add(name);
        this.saveGame();
        this.showMessage("OBJEV: " + name + " • ZAPIŠ SI TO DO DENÍKU", 2600);
        this.storeDiscoveryNote(this.day + 1, note);
      }
    }
  }

  private storeDiscoveryNote(day: number, text: string) {
    const entries = this.loadDiary();
    entries.push({ day, text, createdAt: new Date().toISOString() });
    localStorage.setItem("wildlands-diary-v1", JSON.stringify(entries.slice(-30)));
  }

  private respawn() {
    this.health = 100;
    this.hunger = 65;
    this.stamina = 100;
    this.player.setPosition(158, 116);
    this.player.setVelocity(0, 0);
    this.currentZone = "DŮM";
    this.saveGame();
    this.showMessage("ZKOLABOVAL JSI • PROBOUZÍŠ SE DOMA.", 2400);
  }

  private saveGame() {
    const state = {
      day: this.day,
      clock: this.clock,
      health: this.health,
      hunger: this.hunger,
      stamina: this.stamina,
      wood: this.wood,
      berries: this.berries,
      stone: this.stone,
      discoveries: Array.from(this.discoveries),
      collectedResources: Array.from(this.collectedResources),
      playerX: this.player.x,
      playerY: this.player.y
    };
    try {
      localStorage.setItem(this.saveKey, JSON.stringify(state));
    } catch {}
  }

  private loadGame() {
    try {
      const raw = localStorage.getItem(this.saveKey);
      if (!raw) return;
      const state = JSON.parse(raw);
      this.day = Number.isFinite(state.day) ? state.day : 0;
      this.clock = Number.isFinite(state.clock) ? state.clock : 0.30;
      this.health = Number.isFinite(state.health) ? state.health : 100;
      this.hunger = Number.isFinite(state.hunger) ? state.hunger : 100;
      this.stamina = Number.isFinite(state.stamina) ? state.stamina : 100;
      this.wood = Number.isFinite(state.wood) ? state.wood : 0;
      this.berries = Number.isFinite(state.berries) ? state.berries : 0;
      this.stone = Number.isFinite(state.stone) ? state.stone : 0;
      this.discoveries = new Set(Array.isArray(state.discoveries) ? state.discoveries : []);
      this.collectedResources = new Set(Array.isArray(state.collectedResources) ? state.collectedResources : []);
      if (Number.isFinite(state.playerX)) this.player.x = Phaser.Math.Clamp(state.playerX, 158, WORLD_W - 20);
      if (Number.isFinite(state.playerY)) this.player.y = Phaser.Math.Clamp(state.playerY, 40, GROUND_Y);
    } catch {}
  }

  private getPhase() {
    return this.clock < 0.25 ? "NIGHT" :
      this.clock < 0.5 ? "DAWN" :
      this.clock < 0.78 ? "DAY" : "DUSK";
  }

  private updateHUD() {
    const phase = this.getPhase();
    this.hud.setText(
      "HP  " + this.bar(this.health) + " " + Math.ceil(this.health) + "\n" +
      "HUN " + this.bar(this.hunger) + " " + Math.ceil(this.hunger) + "\n" +
      "STA " + this.bar(this.stamina) + " " + Math.ceil(this.stamina) + "\n" +
      "DEN " + (this.day + 1) + "  " + phase + "  " + this.currentZone + "\n" +
      "WOOD " + this.wood + "  BERRY " + this.berries + "  STONE " + this.stone
    );
    this.messageText.setText(this.message).setVisible(this.messageUntil > Date.now());
  }

  private bar(v: number) {
    const n = Math.round(v / 10);
    return "■".repeat(n) + "·".repeat(10 - n);
  }

  private showMessage(text: string, ms: number) {
    this.message = text;
    this.messageUntil = Date.now() + ms;
  }

  private updateLighting() {
    const daylight = Phaser.Math.Clamp(
      Math.sin(this.clock * Math.PI * 2) * 0.5 + 0.5,
      0.12,
      1
    );
    const a = Phaser.Display.Color.ValueToColor("#10161b");
    const b = Phaser.Display.Color.ValueToColor("#79a6a0");
    const c = Phaser.Display.Color.Interpolate.ColorWithColor(a, b, 100, Math.floor(daylight * 100));
    this.cameras.main.setBackgroundColor(c.color);
  }

  private layoutUI() {
    if (!this.ui) return;
    const scale = Math.min(this.scale.width / 320, this.scale.height / 180);
    this.ui.setScale(scale);
    this.ui.setPosition(
      (this.scale.width - 320 * scale) / 2,
      (this.scale.height - 180 * scale) / 2
    );

    const containers = this.ui.list.filter(
      o => o instanceof Phaser.GameObjects.Container
    ) as Phaser.GameObjects.Container[];

    const find = (label: string) =>
      containers.find(c => c.list.some((x: any) => x.text === label));

    find("◀")?.setPosition(10, 145);
    find("▶")?.setPosition(58, 145);
    find("▲")?.setPosition(258, 145);
    find("E")?.setPosition(306, 145);
    find("INV")?.setPosition(162, 145);
  }

  private noise(x: number) {
    const s = Math.sin((x + this.seed) * 12.9898) * 43758.5453;
    return (s - Math.floor(s)) * 2 - 1;
  }
}
