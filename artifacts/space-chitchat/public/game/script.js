const $ = (id) => document.getElementById(id);
const canvas = $("spaceCanvas");
const ctx = canvas.getContext("2d");

let ageMode = "easy";
let rocketColor = "#ff6b6b";
let fuelChoice = "medium";
let soundOn = true;
let audioCtx = null;
let state = "ready";
let score = 0, starsCollected = 0, fuel = 100, frame = 0;
let rocket = { x: 450, y: 370, w: 34, h: 58, vx: 0 };
let stars = [], rocks = [], particles = [];
let animationId = null;
let lastTime = 0;
let pausedFrom = "flying";
let moveLeft = false, moveRight = false;
let difficulty = { speed: 2.2, rockChance: 0.008, target: 8, fuelUse: 0.035 };

const ageSettings = {
  easy: { speed: 1.7, rockChance: 0.0035, target: 6, fuelUse: 0.025, label: "مغامرة سهلة" },
  medium: { speed: 2.25, rockChance: 0.006, target: 8, fuelUse: 0.035, label: "مغامرة متوسطة" },
  challenge: { speed: 2.8, rockChance: 0.009, target: 10, fuelUse: 0.045, label: "تحدّي الأبطال" }
};

function beep(freq=520, duration=0.09, type="sine") {
  if (!soundOn) return;
  try {
    audioCtx = audioCtx || new (window.AudioContext || window.webkitAudioContext)();
    const osc = audioCtx.createOscillator(), gain = audioCtx.createGain();
    osc.type = type; osc.frequency.value = freq;
    gain.gain.setValueAtTime(0.08, audioCtx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + duration);
    osc.connect(gain); gain.connect(audioCtx.destination);
    osc.start(); osc.stop(audioCtx.currentTime + duration);
  } catch(e) {}
}
function updateSetupButtons() {
  document.querySelectorAll(".age-choice").forEach(b => b.classList.toggle("active", b.dataset.age === ageMode));
  document.querySelectorAll(".color-choice").forEach(b => b.classList.toggle("active", b.dataset.color === rocketColor));
  document.querySelectorAll(".fuel-choice").forEach(b => b.classList.toggle("active", b.dataset.fuel === fuelChoice));
}
document.querySelectorAll(".age-choice").forEach(b => b.addEventListener("click", () => {
  ageMode = b.dataset.age; updateSetupButtons(); beep(600);
}));
document.querySelectorAll(".color-choice").forEach(b => b.addEventListener("click", () => {
  rocketColor = b.dataset.color; updateSetupButtons(); drawScene(); beep(650);
}));
document.querySelectorAll(".fuel-choice").forEach(b => b.addEventListener("click", () => {
  fuelChoice = b.dataset.fuel; updateSetupButtons();
  const messages = {low:"الوقود القليل يجعل الرحلة أقصر. يمكنك تجربة كمية أكبر!",medium:"رائع! الوقود المتوسط بداية جيدة لمغامرتك.",high:"وقود كثير يعني وقتًا أطول للطيران. انطلق بحذر!"};
  $("fuelTip").textContent = messages[fuelChoice]; beep(580);
}));
$("soundBtn").addEventListener("click", () => {
  soundOn = !soundOn; $("soundBtn").textContent = soundOn ? "🔊 الصوت" : "🔇 صامت";
  if(soundOn) beep();
});

function resetGame() {
  const d = ageSettings[ageMode];
  difficulty = {speed:d.speed, rockChance:d.rockChance, target:d.target, fuelUse:d.fuelUse};
  score = 0; starsCollected = 0; frame = 0;
  fuel = fuelChoice === "low" ? 65 : fuelChoice === "high" ? 125 : 95;
  rocket = {x:canvas.width/2,y:canvas.height-100,w:36,h:62,vx:0};
  stars = []; rocks = []; particles = [];
  for(let i=0;i<5;i++) spawnStar(true);
  $("score").textContent = score;
  $("stars").textContent = starsCollected;
  $("fuelLeft").textContent = Math.round(fuel)+"%";
  $("missionHint").textContent = `اجمع ${difficulty.target} نجوم لتكمل المهمة!`;
  $("gameMessage").textContent = "اضغط ابدأ الطيران… واجمع النجوم!";
  $("launchBtn").disabled = false;
  state = "ready";
  drawScene();
}
function spawnStar(initial=false) {
  stars.push({x:35+Math.random()*(canvas.width-70), y:initial?Math.random()*(canvas.height-150)+30:-25, r:10+Math.random()*4, spin:Math.random()*6});
}
function spawnRock() {
  const r = 15 + Math.random()*12;
  rocks.push({x:35+Math.random()*(canvas.width-70),y:-35,r,rot:Math.random()*6,spin:(Math.random()-.5)*.04});
}
function drawBackground() {
  const g = ctx.createLinearGradient(0,0,0,canvas.height);
  g.addColorStop(0,"#08152f");g.addColorStop(1,"#152c55");
  ctx.fillStyle=g;ctx.fillRect(0,0,canvas.width,canvas.height);
  for(let i=0;i<85;i++){
    const x=(i*137.5)%canvas.width, y=(i*83.7+(frame*.18))%canvas.height;
    ctx.globalAlpha=.35+(i%4)*.15;ctx.fillStyle="#fff";ctx.beginPath();ctx.arc(x,y,(i%3)+.5,0,Math.PI*2);ctx.fill();
  }
  ctx.globalAlpha=1;
  // Distant planets
  ctx.fillStyle="#6b65b8";ctx.beginPath();ctx.arc(760,100,48,0,Math.PI*2);ctx.fill();
  ctx.fillStyle="#9d8be0";ctx.beginPath();ctx.ellipse(760,100,65,15,-.25,0,Math.PI*2);ctx.strokeStyle="#b7a8ff";ctx.lineWidth=6;ctx.stroke();
  ctx.fillStyle="#55a9a6";ctx.beginPath();ctx.arc(115,300,24,0,Math.PI*2);ctx.fill();
}
function drawRocket(x,y) {
  ctx.save();ctx.translate(x,y);
  // flame
  if(state==="flying"){
    ctx.fillStyle="#ffb347";ctx.beginPath();ctx.moveTo(-9,22);ctx.quadraticCurveTo(-17,48,0,57);ctx.quadraticCurveTo(17,48,9,22);ctx.fill();
    ctx.fillStyle="#fff1a8";ctx.beginPath();ctx.moveTo(-5,24);ctx.quadraticCurveTo(-7,43,0,47);ctx.quadraticCurveTo(7,43,5,24);ctx.fill();
  }
  ctx.fillStyle="#dce9ff";ctx.beginPath();ctx.moveTo(0,-34);ctx.quadraticCurveTo(22,-17,17,16);ctx.lineTo(-17,16);ctx.quadraticCurveTo(-22,-17,0,-34);ctx.fill();
  ctx.fillStyle=rocketColor;ctx.beginPath();ctx.moveTo(0,-34);ctx.quadraticCurveTo(22,-17,17,16);ctx.lineTo(-17,16);ctx.quadraticCurveTo(-22,-17,0,-34);ctx.fill();
  ctx.fillStyle="#e9f5ff";ctx.fillRect(-5,-4,10,21);
  ctx.fillStyle="#5fd9e0";ctx.beginPath();ctx.arc(0,-9,7,0,Math.PI*2);ctx.fill();
  ctx.strokeStyle="#dce9ff";ctx.lineWidth=4;
  ctx.beginPath();ctx.moveTo(-15,8);ctx.lineTo(-25,25);ctx.lineTo(-11,20);ctx.fill();
  ctx.beginPath();ctx.moveTo(15,8);ctx.lineTo(25,25);ctx.lineTo(11,20);ctx.fill();
  ctx.restore();
}
function drawObjects() {
  stars.forEach(s=>{
    ctx.save();ctx.translate(s.x,s.y);ctx.rotate(s.spin);
    ctx.fillStyle="#ffd76a";ctx.shadowColor="#ffd76a";ctx.shadowBlur=15;
    ctx.beginPath();for(let i=0;i<10;i++){const a=-Math.PI/2+i*Math.PI/5,r=i%2?s.r*.45:s.r;ctx.lineTo(Math.cos(a)*r,Math.sin(a)*r);}ctx.closePath();ctx.fill();ctx.restore();
  });
  rocks.forEach(r=>{
    ctx.save();ctx.translate(r.x,r.y);ctx.rotate(r.rot);ctx.fillStyle="#8b91a8";ctx.strokeStyle="#c0c7d8";ctx.lineWidth=2;
    ctx.beginPath();for(let i=0;i<9;i++){const a=i*Math.PI*2/9,rr=r.r*(.75+(i%3)*.12);if(i===0)ctx.moveTo(Math.cos(a)*rr,Math.sin(a)*rr);else ctx.lineTo(Math.cos(a)*rr,Math.sin(a)*rr);}ctx.closePath();ctx.fill();ctx.stroke();ctx.restore();
  });
}
function drawScene() {
  drawBackground();drawObjects();
  if(state!=="result")drawRocket(rocket.x,rocket.y);
  // bottom horizon glow
  const grd=ctx.createLinearGradient(0,canvas.height-55,0,canvas.height);
  grd.addColorStop(0,"#38d9d055");grd.addColorStop(1,"#38d9d000");ctx.fillStyle=grd;ctx.fillRect(0,canvas.height-55,canvas.width,55);
}
function startFlight() {
  if(state!=="ready")return;
  state="flying";$("launchBtn").disabled=true;$("gameMessage").textContent="انطلق الصاروخ! اجمع النجوم!";beep(740,.22);
  lastTime=0;animationId=requestAnimationFrame(loop);
}
function loop(timestamp) {
  if(state!=="flying")return;
  if(!lastTime)lastTime=timestamp;
  const delta=Math.min((timestamp-lastTime)/16.67,2);lastTime=timestamp;
  frame+=delta;
  update(delta);drawScene();
  if(state==="flying")animationId=requestAnimationFrame(loop);
}
function update(delta) {
  const moveSpeed=ageMode==="easy"?4.4:5.4;
  if(moveLeft)rocket.x-=moveSpeed*delta;
  if(moveRight)rocket.x+=moveSpeed*delta;
  rocket.x=Math.max(28,Math.min(canvas.width-28,rocket.x));
  rocket.y=Math.max(105,rocket.y-.14*delta);
  fuel-=difficulty.fuelUse*delta;
  $("fuelLeft").textContent=Math.max(0,Math.round(fuel))+"%";
  stars.forEach(s=>{s.y+=difficulty.speed*delta;s.spin+=.025*delta;});
  rocks.forEach(r=>{r.y+=(difficulty.speed+1.3)*delta;r.rot+=r.spin*delta;});
  stars=stars.filter(s=>s.y<canvas.height+20);
  rocks=rocks.filter(r=>r.y<canvas.height+40);
  if(Math.random()<.025*delta)spawnStar();
  if(Math.random()<difficulty.rockChance*delta)spawnRock();
  // star collision
  for(let i=stars.length-1;i>=0;i--){
    const s=stars[i];
    if(Math.hypot(s.x-rocket.x,s.y-rocket.y)<s.r+25){
      stars.splice(i,1);starsCollected++;score+=10;beep(880,.08);
      $("score").textContent=score;$("stars").textContent=starsCollected;
      for(let p=0;p<8;p++)particles.push({x:rocket.x,y:rocket.y,vx:(Math.random()-.5)*4,vy:(Math.random()-.5)*4,life:20});
    }
  }
  // asteroid collision is forgiving for younger players
  for(let i=rocks.length-1;i>=0;i--){
    const r=rocks[i];
    if(Math.hypot(r.x-rocket.x,r.y-rocket.y)<r.r+18){
      rocks.splice(i,1);score=Math.max(0,score-5);$("score").textContent=score;
      $("gameMessage").textContent="أوه! صخرة فضائية… حاول تفاديها!";beep(170,.18,"triangle");
      if(ageMode==="easy")fuel=Math.max(0,fuel-4);
      else fuel=Math.max(0,fuel-10);
    }
  }
  particles.forEach(p=>{p.x+=p.vx;p.y+=p.vy;p.life--;});
  particles=particles.filter(p=>p.life>0);
  particles.forEach(p=>{ctx.fillStyle="#ffe18a";ctx.globalAlpha=p.life/20;ctx.fillRect(p.x,p.y,4,4);ctx.globalAlpha=1;});
  if(starsCollected>=difficulty.target){finish(true);return;}
  if(fuel<=0){finish(false);return;}
  if(frame>1800){finish(starsCollected>=Math.ceil(difficulty.target*.6));}
}
function finish(success) {
  state="result";cancelAnimationFrame(animationId);
  const bonus=success?50:starsCollected*5;
  score+=bonus;
  $("finalScore").textContent=score;
  $("resultTitle").textContent=success?"يا سلام! وصلت لهدفك!":"محاولة رائعة يا رائد الفضاء!";
  $("resultText").textContent=success?`جمعت ${starsCollected} نجوم وأنهيت المهمة بنجاح!`:`جمعت ${starsCollected} نجوم. جرّب مرة ثانية بوقود أكثر أو تحرّك لتفادي الصخور.`;
  $("reward").textContent=success?"🏅 🌟 🌟 🌟":"🌟 🌟";
  $("gamePanel").classList.add("hidden");$("resultPanel").classList.remove("hidden");
  beep(success?900:360,.25);
}
function showGame() {
  $("setupPanel").classList.add("hidden");$("resultPanel").classList.add("hidden");$("gamePanel").classList.remove("hidden");
  resetGame();
}
$("startBtn").addEventListener("click",()=>{showGame();beep(700);});
$("launchBtn").addEventListener("click",startFlight);
$("pauseBtn").addEventListener("click",()=>{
  if(state==="flying"){pausedFrom="flying";state="paused";cancelAnimationFrame(animationId);$("pauseBtn").textContent="متابعة ▶";$("gameMessage").textContent="استراحة قصيرة!";}
  else if(state==="paused"){state=pausedFrom;lastTime=0;$("pauseBtn").textContent="إيقاف مؤقت ⏸";$("gameMessage").textContent="هيا نكمل الرحلة!";animationId=requestAnimationFrame(loop);}
});
$("againBtn").addEventListener("click",()=>{$("resultPanel").classList.add("hidden");$("setupPanel").classList.remove("hidden");state="ready";drawScene();});
function bindMove(button, direction) {
  const down=e=>{e.preventDefault();if(direction==="left")moveLeft=true;else moveRight=true;};
  const up=()=>{moveLeft=false;moveRight=false;};
  button.addEventListener("pointerdown",down);button.addEventListener("pointerup",up);button.addEventListener("pointerleave",up);button.addEventListener("pointercancel",up);
}
bindMove($("leftBtn"),"left");bindMove($("rightBtn"),"right");
window.addEventListener("keydown",e=>{
  if(e.key==="ArrowLeft"||e.key.toLowerCase()==="a"){moveLeft=true;e.preventDefault();}
  if(e.key==="ArrowRight"||e.key.toLowerCase()==="d"){moveRight=true;e.preventDefault();}
});
window.addEventListener("keyup",e=>{
  if(e.key==="ArrowLeft"||e.key.toLowerCase()==="a")moveLeft=false;
  if(e.key==="ArrowRight"||e.key.toLowerCase()==="d")moveRight=false;
});
window.addEventListener("blur",()=>{moveLeft=false;moveRight=false;});
updateSetupButtons();
drawScene();
