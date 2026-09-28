import Phaser from "phaser";

const WORLD_W = 9000;
const GROUND_Y = 142;

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
  private clock = 0.28;
  private facing = 1;
  private actionCooldown = 0;
  private invulnerable = 0;
  private seed = Math.random() * 10000;

  create() {
    this.createTextures();
    this.createWorld();
    this.createPlayer();
    this.createHUD();
    this.createTouchControls();

    this.cursors = this.input.keyboard!.createCursorKeys();
    this.keys = {
      a: this.input.keyboard!.addKey("A"),
      d: this.input.keyboard!.addKey("D"),
      w: this.input.keyboard!.addKey("W"),
      space: this.input.keyboard!.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE),
      e: this.input.keyboard!.addKey("E"),
      shift: this.input.keyboard!.addKey(Phaser.Input.Keyboard.KeyCodes.SHIFT)
    };

    this.cameras.main.setBounds(0, 0, WORLD_W, 180);
    this.cameras.main.startFollow(this.player, true, 0.08, 0.08);
    this.cameras.main.setDeadzone(70, 34);
    this.showMessage("SURVIVE • EXPLORE • FIND THE OLD CAMP", 5000);
    this.scale.on("resize", this.layoutUI, this);
    this.layoutUI();
  }

  private createTextures() {
    const g = this.make.graphics({x:0,y:0,add:false});
    const texture = (key:string,w:number,h:number,draw:()=>void) => {
      g.clear(); draw(); g.generateTexture(key,w,h);
    };

    texture("ground",32,44,()=>{
      g.fillStyle(0x243b2e); g.fillRect(0,0,32,6);
      g.fillStyle(0x314c38); g.fillRect(0,6,32,38);
      g.fillStyle(0x203127); g.fillRect(4,9,3,3); g.fillRect(21,17,4,3); g.fillRect(11,29,3,5);
    });
    texture("player",12,20,()=>{
      g.fillStyle(0x172027); g.fillRect(3,0,7,8);
      g.fillStyle(0xd9b27b); g.fillRect(4,1,5,6);
      g.fillStyle(0x6f4631); g.fillRect(3,7,7,7);
      g.fillStyle(0x354c3e); g.fillRect(2,8,8,6);
      g.fillStyle(0x26313a); g.fillRect(2,14,3,6); g.fillRect(7,14,3,6);
      g.fillStyle(0xe6d2a4); g.fillRect(9,10,3,3);
    });
    texture("tree",18,34,()=>{
      g.fillStyle(0x4b3026); g.fillRect(7,18,5,16);
      g.fillStyle(0x254c3a); g.fillRect(3,10,12,12);
      g.fillStyle(0x356347); g.fillRect(1,13,16,8);
      g.fillStyle(0x487553); g.fillRect(5,5,9,12);
      g.fillStyle(0x5d8957); g.fillRect(7,3,5,6);
    });
    texture("berry",12,12,()=>{
      g.fillStyle(0x376448); g.fillRect(5,0,2,5);
      g.fillStyle(0x28533d); g.fillRect(2,4,8,6);
      g.fillStyle(0xa63d4b); g.fillRect(3,5,3,3); g.fillRect(7,6,3,3);
    });
    texture("rock",16,11,()=>{
      g.fillStyle(0x59616a); g.fillRect(2,4,12,6); g.fillRect(5,2,7,8);
      g.fillStyle(0x818a91); g.fillRect(6,3,5,2);
    });
    texture("slime",14,10,()=>{
      g.fillStyle(0x8ca45d); g.fillRect(2,3,10,7); g.fillRect(4,1,6,9);
      g.fillStyle(0x1c2525); g.fillRect(5,4,1,2); g.fillRect(9,4,1,2);
    });
    texture("campfire",18,18,()=>{
      g.fillStyle(0x4a3024); g.fillRect(3,12,12,4); g.fillRect(5,9,8,4);
      g.fillStyle(0xe6a23c); g.fillRect(6,5,6,8); g.fillStyle(0xffd66b); g.fillRect(8,3,3,7);
    });
    g.destroy();
  }

  private createWorld() {
    this.add.rectangle(WORLD_W/2,90,WORLD_W,180,0x162129).setDepth(-20);
    const sky=this.add.graphics().setDepth(-19);
    sky.fillStyle(0x162129); sky.fillRect(0,0,WORLD_W,180);
    sky.fillStyle(0x1d3037); sky.fillRect(0,54,WORLD_W,40);
    sky.fillStyle(0x243b3d); sky.fillRect(0,94,WORLD_W,48);

    this.platforms=this.physics.add.staticGroup();
    this.resources=this.physics.add.staticGroup();
    this.creatures=this.physics.add.group({allowGravity:true});

    for(let x=0;x<WORLD_W;x+=32){
      const y=GROUND_Y+Math.floor(this.noise(x*0.015)*5);
      const ground=this.platforms.create(x+16,y+22,"ground") as Phaser.Physics.Arcade.Sprite;
      ground.setDisplaySize(32,44); ground.refreshBody();
    }

    for(let x=120;x<WORLD_W-100;x+=100+Math.floor(this.noise(x)*90)){
      const n=this.noise(x*0.7);
      if(n>0.35){
        const tree=this.resources.create(x,GROUND_Y-16,"tree") as Phaser.Physics.Arcade.Sprite;
        tree.setData("resource","wood"); tree.setData("amount",3);
      } else if(n<-0.12){
        const berry=this.resources.create(x+20,GROUND_Y-8,"berry") as Phaser.Physics.Arcade.Sprite;
        berry.setData("resource","berry"); berry.setData("amount",2);
      } else {
        const rock=this.resources.create(x+35,GROUND_Y-5,"rock") as Phaser.Physics.Arcade.Sprite;
        rock.setData("resource","stone"); rock.setData("amount",2);
      }
    }

    this.landmark(1420,"OLD CAMP");
    this.landmark(4780,"WATCHPOINT");

    for(let i=0;i<34;i++){
      const x=300+i*260+this.noise(i)*110;
      const enemy=this.creatures.create(x,GROUND_Y-10,"slime") as Phaser.Physics.Arcade.Sprite;
      enemy.setData("dir",this.noise(i*2)>0?1:-1);
      enemy.setData("origin",x);
      enemy.setVelocityX((enemy.getData("dir") as number)*18);
    }

    this.physics.add.collider(this.player,this.platforms);
    this.physics.add.collider(this.creatures,this.platforms);
  }

  private landmark(x:number,label:string){
    this.add.image(x,GROUND_Y-9,"campfire").setScale(1.2).setDepth(2);
    this.add.text(x,GROUND_Y-28,label,{fontFamily:"monospace",fontSize:"6px",color:"#e8d8a8"}).setOrigin(0.5).setDepth(3);
  }

  private createPlayer(){
    this.player=this.physics.add.sprite(160,80,"player");
    this.player.setCollideWorldBounds(true);
    this.player.setSize(8,18).setOffset(2,2);
    this.player.setDepth(5);
  }

  private createHUD(){
    this.ui=this.add.container(0,0).setScrollFactor(0).setDepth(100);
    const panel=this.add.rectangle(0,0,154,39,0x0b1014,0.9).setOrigin(0);
    panel.setStrokeStyle(1,0x52636a,0.6);
    this.hud=this.add.text(7,5,"",{fontFamily:"monospace",fontSize:"7px",color:"#e6eee8",lineSpacing:2});
    this.messageText=this.add.text(7,45,"",{fontFamily:"monospace",fontSize:"7px",color:"#d6c78b",stroke:"#0b1014",strokeThickness:3}).setVisible(false);
    this.ui.add([panel,this.hud,this.messageText]);
  }

  private createTouchControls(){
    const button=(label:string)=>{
      const box=this.add.rectangle(0,0,42,34,0x172027,0.72).setStrokeStyle(1,0x80939a,0.55);
      const text=this.add.text(0,0,label,{fontFamily:"monospace",fontSize:"9px",color:"#e7eee8"}).setOrigin(0.5);
      const c=this.add.container(0,0,[box,text]).setScrollFactor(0).setDepth(110);
      c.setSize(42,34); box.setInteractive();
      return {c,box};
    };
    const l=button("◀"),r=button("▶"),j=button("▲"),a=button("E");
    this.ui.add([l.c,r.c,j.c,a.c]);
    const bind=(box:Phaser.GameObjects.Rectangle,key:string)=>{
      box.on("pointerdown",()=>this.player.setData(key,true));
      box.on("pointerup",()=>this.player.setData(key,false));
      box.on("pointerout",()=>this.player.setData(key,false));
      box.on("pointercancel",()=>this.player.setData(key,false));
    };
    bind(l.box,"left"); bind(r.box,"right"); bind(j.box,"jump"); bind(a.box,"action");
  }

  update(_time:number,delta:number){
    const dt=delta/1000;
    this.clock+=dt/170;
    if(this.clock>=1){this.clock-=1;this.day++;}
    this.hunger=Math.max(0,this.hunger-dt*0.55);
    this.stamina=Math.min(100,this.stamina+dt*12);
    this.actionCooldown=Math.max(0,this.actionCooldown-dt);
    this.invulnerable=Math.max(0,this.invulnerable-dt);

    let dir=0;
    if(this.cursors.left.isDown||this.keys.a.isDown||this.player.getData("left"))dir--;
    if(this.cursors.right.isDown||this.keys.d.isDown||this.player.getData("right"))dir++;
    const sprint=this.keys.shift.isDown&&this.stamina>1;
    const speed=sprint?125:82;
    if(dir){
      this.facing=dir; this.player.setVelocityX(dir*speed); this.player.setFlipX(dir<0);
      if(sprint)this.stamina=Math.max(0,this.stamina-dt*24);
    } else this.player.setVelocityX(Phaser.Math.Linear(this.player.body!.velocity.x,0,0.22));

    const jump=this.cursors.up.isDown||this.keys.w.isDown||this.keys.space.isDown||this.player.getData("jump");
    if(jump&&(this.player.body!.blocked.down||this.player.body!.touching.down)){
      this.player.setVelocityY(-300); this.player.setData("jump",false);
    }

    if(Phaser.Input.Keyboard.JustDown(this.keys.e)||this.player.getData("action")){
      this.player.setData("action",false); this.interact();
    }

    if(this.hunger<=0)this.health=Math.max(0,this.health-dt*2);
    if(this.health<=0)this.respawn();

    this.creatures.children.each(obj=>{
      const e=obj as Phaser.Physics.Arcade.Sprite;
      const origin=e.getData("origin") as number;
      if(Math.abs(e.x-origin)>70)e.setData("dir",-(e.getData("dir") as number));
      e.setVelocityX((e.getData("dir") as number)*18);
      if(Phaser.Math.Distance.Between(e.x,e.y,this.player.x,this.player.y)<16&&this.invulnerable<=0){
        this.health=Math.max(0,this.health-8); this.invulnerable=1;
        this.player.setVelocityX((this.player.x<e.x?-1:1)*130); this.player.setVelocityY(-120);
      }
      return true;
    });

    this.updateLighting();
    this.updateHUD();
  }

  private interact(){
    if(this.actionCooldown>0)return;
    this.actionCooldown=0.3;
    let nearest:Phaser.Physics.Arcade.Sprite|null=null; let best=38;
    this.resources.children.each(obj=>{
      const r=obj as Phaser.Physics.Arcade.Sprite;
      const d=Phaser.Math.Distance.Between(this.player.x,this.player.y,r.x,r.y);
      if(d<best){best=d;nearest=r;} return true;
    });
    if(nearest){
      const r=nearest; const type=r.getData("resource") as string; const amount=r.getData("amount") as number;
      if(type==="wood")this.wood+=amount;
      if(type==="berry")this.berries+=amount;
      if(type==="stone")this.stone+=amount;
      r.destroy(); this.showMessage("+"+amount+" "+type.toUpperCase(),1200); return;
    }
    if(this.berries>0&&this.hunger<96){
      this.berries--; this.hunger=Math.min(100,this.hunger+24); this.showMessage("ATE BERRIES +24 HUNGER",1200); return;
    }
    if(this.wood>=3&&this.stone>=2){
      this.wood-=3;this.stone-=2;this.health=Math.min(100,this.health+20);this.hunger=Math.min(100,this.hunger+10);
      this.showMessage("FIELD CAMP RESTORED +20 HP",1600); return;
    }
    this.showMessage("E: GATHER • EAT • RESTORE",1200);
  }

  private respawn(){
    this.health=100;this.hunger=65;this.stamina=100;this.player.setPosition(160,80);this.player.setVelocity(0,0);
    this.showMessage("YOU FAINTED — BACK TO THE TRAILHEAD",2400);
  }

  private updateHUD(){
    const phase=this.clock<0.25?"NIGHT":this.clock<0.5?"DAWN":this.clock<0.78?"DAY":"DUSK";
    this.hud.setText(
      "HP  "+this.bar(this.health)+" "+Math.ceil(this.health)+"\n"+
      "HUN "+this.bar(this.hunger)+" "+Math.ceil(this.hunger)+"\n"+
      "STA "+this.bar(this.stamina)+" "+Math.ceil(this.stamina)+"\n"+
      "DAY "+(this.day+1)+"  "+phase+"\n"+
      "WOOD "+this.wood+"  BERRY "+this.berries+"  STONE "+this.stone
    );
    this.messageText.setText(this.message).setVisible(this.messageUntil>Date.now());
  }

  private bar(v:number){
    const n=Math.round(v/10); return "■".repeat(n)+"·".repeat(10-n);
  }

  private showMessage(text:string,ms:number){
    this.message=text;this.messageUntil=Date.now()+ms;
  }

  private updateLighting(){
    const daylight=Phaser.Math.Clamp(Math.sin(this.clock*Math.PI*2)*0.5+0.5,0.12,1);
    const a=Phaser.Display.Color.ValueToColor("#10161b");
    const b=Phaser.Display.Color.ValueToColor("#79a6a0");
    const c=Phaser.Display.Color.Interpolate.ColorWithColor(a,b,100,Math.floor(daylight*100));
    this.cameras.main.setBackgroundColor(c.color);
  }

  private layoutUI(){
    if(!this.ui)return;
    const scale=Math.min(this.scale.width/320,this.scale.height/180);
    this.ui.setScale(scale);
    this.ui.setPosition((this.scale.width-320*scale)/2,(this.scale.height-180*scale)/2);
    const containers=this.ui.list.filter(o=>o instanceof Phaser.GameObjects.Container) as Phaser.GameObjects.Container[];
    const find=(label:string)=>containers.find(c=>c.list.some((x:any)=>x.text===label));
    find("◀")?.setPosition(10,155); find("▶")?.setPosition(58,155); find("▲")?.setPosition(260,155); find("E")?.setPosition(308,155);
  }

  private noise(x:number){
    const s=Math.sin((x+this.seed)*12.9898)*43758.5453; return (s-Math.floor(s))*2-1;
  }
}
