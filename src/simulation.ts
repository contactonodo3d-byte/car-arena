export const STEP = 1 / 60;
export const LIMIT = 26;
export interface Input { throttle: number; steer: number; fire: boolean }
export interface Body { id: number; x: number; z: number; angle: number; hp: number; cooldown: number }
export interface Bullet { id: number; x: number; z: number; vx: number; vz: number; life: number; enemy: boolean }
export interface Pickup { id: number; x: number; z: number }
export const obstacles = [{x:-12,z:-9,w:7,d:4},{x:12,z:9,w:7,d:4},{x:-12,z:12,w:4,d:6},{x:13,z:-12,w:5,d:5}];
export class Simulation {
  player: Body = {id:0,x:0,z:0,angle:0,hp:100,cooldown:0};
  enemies: Body[] = []; bullets: Bullet[] = []; pickups: Pickup[] = [];
  score = 0; time = 0; private nextId = 1; private spawn = 1; private drop = 2;
  private seed: number;
  constructor(seed = 42) { this.seed = seed; }
  private random() { this.seed = (Math.imul(this.seed,1664525)+1013904223) >>> 0; return this.seed/4294967296; }
  private blocked(x:number,z:number,r=1) { return Math.abs(x)>LIMIT-r || Math.abs(z)>LIMIT-r || obstacles.some(o=>Math.abs(x-o.x)<o.w/2+r && Math.abs(z-o.z)<o.d/2+r); }
  private move(b:Body, speed:number, dt:number) {
    const x=b.x+Math.sin(b.angle)*speed*dt, z=b.z+Math.cos(b.angle)*speed*dt;
    if(!this.blocked(x,b.z)) b.x=x;
    if(!this.blocked(b.x,z)) b.z=z;
  }
  private shoot(b:Body,enemy:boolean) {
    if(b.cooldown>0) return;
    b.cooldown=enemy?1.5:0.22;
    this.bullets.push({id:this.nextId++,x:b.x+Math.sin(b.angle)*1.5,z:b.z+Math.cos(b.angle)*1.5,vx:Math.sin(b.angle)*24,vz:Math.cos(b.angle)*24,life:2,enemy});
  }
  update(input:Input,dt=STEP) {
    if(this.player.hp<=0) return;
    this.time+=dt; this.spawn-=dt; this.drop-=dt;
    this.player.cooldown=Math.max(0,this.player.cooldown-dt);
    this.player.angle+=input.steer*2.8*dt;
    this.move(this.player,input.throttle*10,dt);
    if(input.fire) this.shoot(this.player,false);
    if(this.spawn<=0) {
      this.spawn=Math.max(0.9,3-this.time/90);
      if(this.enemies.length<18) { const a=this.random()*Math.PI*2; this.enemies.push({id:this.nextId++,x:Math.sin(a)*24,z:Math.cos(a)*24,angle:0,hp:40,cooldown:1}); }
    }
    if(this.drop<=0) {
      this.drop=7;
      const x=(this.random()-.5)*44,z=(this.random()-.5)*44;
      if(this.pickups.length<6&&!this.blocked(x,z)) this.pickups.push({id:this.nextId++,x,z});
    }
    for(const e of this.enemies) {
      e.cooldown-=dt; e.angle=Math.atan2(this.player.x-e.x,this.player.z-e.z);
      const distance=Math.hypot(e.x-this.player.x,e.z-this.player.z);
      if(distance>3) this.move(e,3.4,dt);
      if(distance<20) this.shoot(e,true);
      if(distance<2) this.player.hp-=12*dt;
    }
    for(const b of this.bullets) {
      b.x+=b.vx*dt; b.z+=b.vz*dt; b.life-=dt;
      if(this.blocked(b.x,b.z,.2)) { b.life=0; continue; }
      for(const target of b.enemy?[this.player]:this.enemies) {
        if(target.hp>0&&Math.hypot(target.x-b.x,target.z-b.z)<1.25) {target.hp-=b.enemy?8:20;b.life=0;break;}
      }
    }
    this.score+=this.enemies.filter(e=>e.hp<=0).length*100;
    this.enemies=this.enemies.filter(e=>e.hp>0);
    this.bullets=this.bullets.filter(b=>b.life>0);
    this.pickups=this.pickups.filter(p=>{if(Math.hypot(p.x-this.player.x,p.z-this.player.z)<2){this.player.hp=Math.min(100,this.player.hp+25);return false;}return true;});
    this.player.hp=Math.max(0,this.player.hp);
  }
}
