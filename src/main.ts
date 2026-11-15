import * as THREE from 'three';
import { Simulation, STEP, obstacles } from './simulation';
import './style.css';

const app=document.querySelector<HTMLElement>('#app')!;
const hud=document.querySelector<HTMLElement>('#hud')!;
const message=document.querySelector<HTMLElement>('#message')!;
const events=new AbortController();
const geometries=new Set<THREE.BufferGeometry>(), materials=new Set<THREE.Material>();
let renderer:THREE.WebGLRenderer|undefined;
let frame=0;
function cleanup(){cancelAnimationFrame(frame);events.abort();geometries.forEach(g=>g.dispose());materials.forEach(m=>m.dispose());renderer?.dispose();renderer?.domElement.remove();}
function fail(error:unknown){cleanup();message.textContent=`Unable to run Car Arena: ${error instanceof Error?error.message:String(error)}. Try a browser with WebGL enabled.`;console.error(error);}
try {
  renderer=new THREE.WebGLRenderer({antialias:true,powerPreference:'high-performance'});
  const render=renderer;
  render.setPixelRatio(Math.min(devicePixelRatio,2));
  render.setClearColor(0x101820);
  app.prepend(render.domElement);
  const scene=new THREE.Scene();scene.fog=new THREE.Fog(0x101820,65,120);
  const camera=new THREE.PerspectiveCamera(45,1,.1,150);
  scene.add(new THREE.HemisphereLight(0xcce8ff,0x51473a,2.4));
  const sun=new THREE.DirectionalLight(0xffdfb0,3);sun.position.set(-15,30,10);scene.add(sun);
  const box=new THREE.BoxGeometry(1,1,1);geometries.add(box);
  const palette=new Map<number,THREE.MeshStandardMaterial>();
  function mesh(color:number,x:number,y:number,z:number,w:number,h:number,d:number,parent:THREE.Object3D=scene){
    let material=palette.get(color);if(!material){material=new THREE.MeshStandardMaterial({color,roughness:.75});palette.set(color,material);materials.add(material);}
    const m=new THREE.Mesh(box,material);m.position.set(x,y,z);m.scale.set(w,h,d);parent.add(m);return m;
  }
  mesh(0x343c40,0,-.3,0,54,.6,54);
  for(let i=-24;i<=24;i+=6){mesh(0x68706b,i,.01,0,.07,.02,50);mesh(0x68706b,0,.01,i,50,.02,.07);}
  for(const side of [-1,1]){mesh(0x747b78,side*27,1,0,1,2,55);mesh(0x747b78,0,1,side*27,55,2,1);}
  for(const [index,o] of obstacles.entries()){
    mesh(index%2?0x92613d:0x3d6870,o.x,1.5,o.z,o.w,3,o.d);
    for(let x=-o.w/2+.4;x<o.w/2;x+=.65)mesh(0x263a40,o.x+x,1.5,o.z+o.d/2+.02,.08,2.7,.07);
    mesh(0xcba74b,o.x,3.03,o.z,o.w,.06,.2);
  }
  for(let i=0;i<8;i++){mesh(0xda9b34,-23+i*6,.035,-24,2,.05,.4);}
  const entities=new Map<number,THREE.Object3D>();
  function car(color:number){const group=new THREE.Group();mesh(color,0,.65,0,1.7,.7,2.7,group);mesh(0x182b36,0,1.2,-.2,1.3,.6,1.3,group);mesh(0xe8e5ca,0,1.1,1.25,.25,.25,1.3,group);for(const x of [-.95,.95])for(const z of [-.8,.8])mesh(0x13191c,x,.4,z,.4,.65,.65,group);scene.add(group);return group;}
  let sim=new Simulation();
  let overhead=false;
  const pauseButton=document.querySelector<HTMLButtonElement>('#pause')!;
  function togglePause(){sim.paused=!sim.paused;pauseButton.textContent=sim.paused?'Resume':'Pause';keys.clear();pointers.clear();}
  pauseButton.addEventListener('click',togglePause,{signal:events.signal});
  document.querySelector('#camera')!.addEventListener('click',()=>{overhead=!overhead;},{signal:events.signal});
  const keys=new Set<string>();const pointers=new Map<number,string>();
  const active=(key:string)=>keys.has(key)||[...pointers.values()].includes(key);
  const opts={signal:events.signal};
  const allowed=new Set(['KeyW','KeyA','KeyS','KeyD','ArrowUp','ArrowDown','ArrowLeft','ArrowRight','Space','ShiftLeft','ShiftRight','KeyB','Escape','KeyP','KeyC']);
  window.addEventListener('keydown',e=>{if(allowed.has(e.code)){e.preventDefault();if(!e.repeat&&(e.code==='Escape'||e.code==='KeyP'))togglePause();else if(!e.repeat&&e.code==='KeyC')overhead=!overhead;else keys.add(e.code);}},opts);
  window.addEventListener('keyup',e=>keys.delete(e.code),opts);
  window.addEventListener('blur',()=>{keys.clear();pointers.clear();},opts);
  document.querySelectorAll<HTMLButtonElement>('[data-key]').forEach(button=>{
    button.addEventListener('pointerdown',e=>{e.preventDefault();button.setPointerCapture(e.pointerId);pointers.set(e.pointerId,button.dataset.key!);},opts);
    for(const type of ['pointerup','pointercancel','lostpointercapture'])button.addEventListener(type,e=>pointers.delete((e as PointerEvent).pointerId),opts);
  });
  document.querySelector('#restart')!.addEventListener('click',()=>{sim=new Simulation();pauseButton.textContent='Pause';for(const obj of entities.values())scene.remove(obj);entities.clear();keys.clear();pointers.clear();},opts);
  function resize(){const w=window.innerWidth,h=window.innerHeight;render.setSize(w,h);camera.aspect=w/h;camera.updateProjectionMatrix();}
  window.addEventListener('resize',resize,opts);resize();
  render.domElement.addEventListener('webglcontextlost',e=>{e.preventDefault();fail(new Error('WebGL context lost; reload to resume'));},opts);
  window.addEventListener('pagehide',cleanup,opts);
  let last=performance.now(),accumulator=0,lastHud='';
  document.addEventListener('visibilitychange',()=>{last=performance.now();accumulator=0;keys.clear();pointers.clear();},opts);
  function tick(now:number){
    try{
      accumulator+=Math.min((now-last)/1000,.1);last=now;
      while(accumulator>=STEP){sim.update({throttle:Number(active('KeyW')||active('ArrowUp'))-Number(active('KeyS')||active('ArrowDown')),steer:Number(active('KeyA')||active('ArrowLeft'))-Number(active('KeyD')||active('ArrowRight')),fire:active('Space'),boost:active('ShiftLeft')||active('ShiftRight'),brake:active('KeyB')});accumulator-=STEP;}
      const alive=new Set<number>();
      for(const body of [sim.player,...sim.enemies]){alive.add(body.id);let obj=entities.get(body.id);if(!obj){obj=car(body.id===0?0x42e2b3:0xe05c48);entities.set(body.id,obj);}obj.position.set(body.x,0,body.z);obj.rotation.y=body.angle;}
      for(const b of sim.bullets){alive.add(b.id);let obj=entities.get(b.id);if(!obj){obj=mesh(b.enemy?0xff6644:0xffef99,0,0,0,.24,.24,.6);entities.set(b.id,obj);}obj.position.set(b.x,1,b.z);obj.rotation.y=Math.atan2(b.vx,b.vz);}
      for(const p of sim.pickups){alive.add(p.id);let obj=entities.get(p.id);if(!obj){obj=mesh(0x65ff99,0,0,0,1,1,1);entities.set(p.id,obj);}obj.position.set(p.x,.8+Math.sin(sim.time*3)*.15,p.z);obj.rotation.y=sim.time;}
      for(const [id,obj]of entities)if(!alive.has(id)){scene.remove(obj);entities.delete(id);}
      const distance=camera.aspect<1?40:29;
      camera.position.set(sim.player.x+(overhead?0:distance*.65),distance*(overhead?1.3:1),sim.player.z-(overhead?.01:distance*.65));camera.lookAt(sim.player.x,0,sim.player.z);
      const status=`ARMOR ${Math.ceil(sim.player.hp)} / 100 · SCORE ${sim.score} · HOSTILES ${sim.enemies.length} · NITRO ${Math.floor(sim.nitro)}% · SPEED ${Math.round(Math.abs(sim.speed)*8)}`;
      if(status!==lastHud){hud.textContent=status;lastHud=status;}
      message.textContent=sim.paused?'PAUSED — Press P / Esc or Resume':sim.player.hp<=0?'WRECKED — Press Restart to return to the yard':'WASD drive · Space fire · Shift nitro · B brake · C camera · P pause';
      render.render(scene,camera);frame=requestAnimationFrame(tick);
    }catch(error){fail(error);}
  }
  frame=requestAnimationFrame(tick);
}catch(error){fail(error);}
