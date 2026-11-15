export const STEP = 1 / 60;
export const LIMIT = 26;
export interface Input { x: number; z: number; fire: boolean }
export type Item = 'rocket' | 'scatter' | 'repair';
export interface Body { id:number; x:number; z:number; angle:number; hp:number; cooldown:number; item:Item|null; ammo:number }
export interface Bullet { id:number; x:number; z:number; vx:number; vz:number; life:number; enemy:boolean; damage:number }
export interface Pickup { id:number; x:number; z:number; item:Item }
export const obstacles=[{x:-12,z:-9,w:7,d:4},{x:12,z:9,w:7,d:4},{x:-12,z:12,w:4,d:6},{x:13,z:-12,w:5,d:5}];
export class Simulation {
  player:Body={id:0,x:0,z:0,angle:0,hp:100,cooldown:0,item:null,ammo:0};
  enemies:Body[]=[]; bullets:Bullet[]=[];
  pickups:Pickup[]=[{id:1,x:0,z:5,item:'rocket'},{id:2,x:6,z:0,item:'scatter'},{id:3,x:-5,z:0,item:'repair'}];
  speed=0; paused=false; score=0; time=0;
  private nextId=4; private spawn=2; private drop=4; private seed:number;
  constructor(seed=42){this.seed=seed;}
  private random(){this.seed=(Math.imul(this.seed,1664525)+1013904223)>>>0;return this.seed/4294967296;}
  private blocked(x:number,z:number,r=1){return Math.abs(x)>LIMIT-r||Math.abs(z)>LIMIT-r||obstacles.some(o=>Math.abs(x-o.x)<o.w/2+r&&Math.abs(z-o.z)<o.d/2+r);}
  private move(b:Body,speed:number,dt:number){const x=b.x+Math.sin(b.angle)*speed*dt,z=b.z+Math.cos(b.angle)*speed*dt;if(!this.blocked(x,b.z))b.x=x;if(!this.blocked(b.x,z))b.z=z;}
  private use(b:Body,enemy:boolean){
    if(b.cooldown>0||!b.item||b.ammo<=0)return;
    const item=b.item;
    if(item==='repair'){if(b.hp>=100)return;b.hp=Math.min(100,b.hp+35);}
    else for(const spread of item==='scatter'?[-.22,0,.22]:[0]){
      const a=b.angle+spread;
      this.bullets.push({id:this.nextId++,x:b.x+Math.sin(a)*1.5,z:b.z+Math.cos(a)*1.5,vx:Math.sin(a)*24,vz:Math.cos(a)*24,life:item==='rocket'?2:0.65,enemy,damage:item==='rocket'?40:15});
    }
    b.ammo--;b.cooldown=enemy?1.5:.5;if(b.ammo===0)b.item=null;
  }
  update(input:Input,dt=STEP){
    if(this.player.hp<=0||this.paused)return;
    this.time+=dt;this.spawn-=dt;this.drop-=dt;
    this.player.cooldown=Math.max(0,this.player.cooldown-dt);
    const magnitude=Math.min(1,Math.hypot(input.x,input.z));
    // Stick direction is a world heading; cars drive forward only, never reverse.
    if(magnitude>.12)this.player.angle=Math.atan2(input.x,input.z);
    this.speed=magnitude>.12?10*magnitude:0;
    this.move(this.player,this.speed,dt);
    if(input.fire)this.use(this.player,false);
    if(this.spawn<=0){this.spawn=Math.max(.9,3-this.time/90);if(this.enemies.length<18){const a=this.random()*Math.PI*2;this.enemies.push({id:this.nextId++,x:Math.sin(a)*24,z:Math.cos(a)*24,angle:0,hp:40,cooldown:1,item:null,ammo:0});}}
    if(this.drop<=0){this.drop=4;const x=(this.random()-.5)*44,z=(this.random()-.5)*44;if(this.pickups.length<10&&!this.blocked(x,z)){const items:Item[]=['rocket','scatter','repair'];this.pickups.push({id:this.nextId++,x,z,item:items[Math.floor(this.random()*3)]!});}}
    for(const e of this.enemies){
      e.cooldown=Math.max(0,e.cooldown-dt);
      const box=e.ammo===0?this.pickups.reduce<Pickup|undefined>((best,p)=>!best||Math.hypot(p.x-e.x,p.z-e.z)<Math.hypot(best.x-e.x,best.z-e.z)?p:best,undefined):undefined;
      const target=box??this.player;e.angle=Math.atan2(target.x-e.x,target.z-e.z);
      const distance=Math.hypot(e.x-this.player.x,e.z-this.player.z);
      if(box||distance>3)this.move(e,3.4,dt);
      if(distance<20)this.use(e,true);
      if(distance<2)this.player.hp-=12*dt;
    }
    for(const b of this.bullets){b.x+=b.vx*dt;b.z+=b.vz*dt;b.life-=dt;if(this.blocked(b.x,b.z,.2)){b.life=0;continue;}for(const target of b.enemy?[this.player]:this.enemies){if(target.hp>0&&Math.hypot(target.x-b.x,target.z-b.z)<1.25){target.hp-=b.damage;b.life=0;break;}}}
    this.score+=this.enemies.filter(e=>e.hp<=0).length*100;this.enemies=this.enemies.filter(e=>e.hp>0);this.bullets=this.bullets.filter(b=>b.life>0);
    this.pickups=this.pickups.filter(p=>{const collector=[this.player,...this.enemies].find(b=>b.hp>0&&b.ammo===0&&Math.hypot(p.x-b.x,p.z-b.z)<2);if(!collector)return true;collector.item=p.item;collector.ammo=p.item==='repair'?1:p.item==='rocket'?3:5;return false;});
    this.player.hp=Math.max(0,this.player.hp);
  }
}
