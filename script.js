(function(){
var CODE='9949',val='';
var lock=document.getElementById('lock'),love=document.getElementById('love'),
    pad=document.getElementById('pad'),hint=document.getElementById('hint'),
    dots=document.querySelectorAll('#dots i'),dotsBox=document.getElementById('dots');

['1','2','3','4','5','6','7','8','9','⌫','0','✕'].forEach(function(k){
  var b=document.createElement('button');b.textContent=k;
  if(k==='⌫'||k==='✕')b.className='ghost';
  b.addEventListener('click',function(e){ripple(b,e);press(k)});
  pad.appendChild(b);
});
function ripple(b,e){
  var r=b.getBoundingClientRect(),s=document.createElement('span'),d=r.width;
  var x=(e.clientX?e.clientX-r.left:d/2)-d/2,y=(e.clientY?e.clientY-r.top:d/2)-d/2;
  s.className='rip';s.style.width=d+'px';s.style.height=d+'px';s.style.left=x+'px';s.style.top=y+'px';
  b.appendChild(s);setTimeout(function(){s.remove()},600);
}
function render(){dots.forEach(function(d,i){d.className=i<val.length?'on':''})}
function press(k){
  initAudio();
  hint.className='sub';hint.textContent='اكتبي الرمز 💗';
  if(k==='⌫')val=val.slice(0,-1);else if(k==='✕')val='';else if(val.length<4)val+=k;
  render();
  if(val.length===4)setTimeout(check,260);
}
function check(){
  if(val===CODE)return unlock();
  pad.classList.add('shake');dotsBox.classList.add('shake');
  hint.className='sub err';hint.textContent='الرمز غلط، جربي مرة ثانية';
  setTimeout(function(){pad.classList.remove('shake');dotsBox.classList.remove('shake');val='';render()},520);
}

/* ---------- unlock ---------- */
function unlock(){
  lock.classList.add('hide');
  buildHeart();buildText();startMusic();
  setTimeout(function(){love.classList.add('show');burst()},450);
}
function buildText(){
  var m=document.getElementById('msg'),t='Slyver Love You';m.innerHTML='';
  for(var i=0;i<t.length;i++){
    var s=document.createElement('span');
    if(t[i]===' '){s.className='sp';s.innerHTML='&nbsp;'}else s.textContent=t[i];
    s.style.setProperty('--i',i);m.appendChild(s);
  }
}
function buildHeart(){
  var g=document.getElementById('hg'),ns='http://www.w3.org/2000/svg';g.innerHTML='';
  var d='M100 165 C20 110 5 60 45 30 C70 12 95 25 100 50 C105 25 130 12 155 30 C195 60 180 110 100 165 Z';
  var f=document.createElementNS(ns,'path');f.setAttribute('d',d);f.setAttribute('class','fillh');g.appendChild(f);
  var cols=['#ffffff','#ff4f93','#ff7ab0','#d81b60','#ffb3d1','#ff2d7e'];
  for(var i=0;i<14;i++){
    var p=document.createElementNS(ns,'path'),s=1-i*.06;
    p.setAttribute('d',d);p.setAttribute('pathLength','1');p.setAttribute('class','ln');
    p.setAttribute('transform','translate('+(100*(1-s))+' '+(95*(1-s))+') scale('+s+')');
    p.setAttribute('stroke',i===0?'#d81b60':cols[i%cols.length]);
    p.setAttribute('stroke-width',i===0?3.4:1.5);
    p.style.opacity=i===0?1:.8;p.style.animationDelay=(i*.11)+'s';
    g.appendChild(p);
  }
}


/* ---------- calm music (generated, no files needed) ---------- */
var AC,master,bus,musicOn=true,loopT,step=0,started=false;
var CH=[
  [130.81,164.81,196.00,246.94],   /* Cmaj7 */
  [110.00,130.81,164.81,196.00],   /* Am7   */
  [87.31,110.00,130.81,164.81],    /* Fmaj7 */
  [98.00,146.83,196.00,246.94]     /* G add9 */
];
var PAT=[0,1,2,3,2,1,3,2];
function initAudio(){
  if(AC){if(AC.state==='suspended')AC.resume();return}
  var X=window.AudioContext||window.webkitAudioContext;if(!X)return;
  AC=new X();
  master=AC.createGain();master.gain.value=0;master.connect(AC.destination);
  var len=AC.sampleRate*3,buf=AC.createBuffer(2,len,AC.sampleRate);
  for(var ch=0;ch<2;ch++){var d=buf.getChannelData(ch);for(var i=0;i<len;i++)d[i]=(Math.random()*2-1)*Math.pow(1-i/len,2.6)}
  var conv=AC.createConvolver();conv.buffer=buf;
  var wet=AC.createGain();wet.gain.value=.6;conv.connect(wet);wet.connect(master);
  var dry=AC.createGain();dry.gain.value=.7;dry.connect(master);
  bus=AC.createGain();bus.connect(dry);bus.connect(conv);
}
function tone(f,t,dur,type,vol,att){
  var o=AC.createOscillator(),g=AC.createGain();
  o.type=type;o.frequency.value=f;
  g.gain.setValueAtTime(0,t);g.gain.linearRampToValueAtTime(vol,t+att);
  g.gain.exponentialRampToValueAtTime(.0001,t+dur);
  o.connect(g);g.connect(bus);o.start(t);o.stop(t+dur+.1);
}
function bell(f,t,vol){tone(f,t,2.6,'sine',vol,.01);tone(f*2,t,1.2,'sine',vol*.25,.01);tone(f*3.01,t,.6,'sine',vol*.08,.01)}
function bar(){
  if(!AC)return;
  var t=AC.currentTime+.08,c=CH[step%4];
  c.forEach(function(f){tone(f,t,5.2,'triangle',.07,1.6);tone(f/2,t,5.2,'sine',.05,1.8)});
  for(var i=0;i<8;i++){
    var f=c[PAT[i]]*2;if(i===7&&step%2)f=c[3]*4;
    bell(f,t+i*.5+(i%2?.04:0),.11);
  }
  step++;
}
function startMusic(){
  if(started||!AC)return;started=true;
  if(AC.state==='suspended')AC.resume();
  master.gain.setValueAtTime(0,AC.currentTime);
  master.gain.linearRampToValueAtTime(.9,AC.currentTime+5);
  bar();loopT=setInterval(bar,4000);
}
var snd=document.getElementById('snd');
snd.addEventListener('click',function(){
  if(!AC)return;musicOn=!musicOn;snd.textContent=musicOn?'🔊':'🔇';
  master.gain.cancelScheduledValues(AC.currentTime);
  master.gain.setTargetAtTime(musicOn?.9:0,AC.currentTime,.3);
});

/* ---------- particles ---------- */
var cv=document.getElementById('c'),cx=cv.getContext('2d'),W,H,R=window.devicePixelRatio||1,parts=[];
function size(){W=cv.width=innerWidth*R;H=cv.height=innerHeight*R}
size();addEventListener('resize',size);
function heart(x,y,s,c,a,rot){
  cx.save();cx.translate(x,y);cx.rotate(rot);cx.scale(s/20,s/20);cx.globalAlpha=a;cx.fillStyle=c;cx.beginPath();
  cx.moveTo(0,6);cx.bezierCurveTo(-14,-4,-8,-14,0,-7);cx.bezierCurveTo(8,-14,14,-4,0,6);cx.fill();cx.restore();
}
function star(x,y,s,a){
  cx.save();cx.translate(x,y);cx.globalAlpha=a;cx.fillStyle='#fff';cx.beginPath();
  for(var i=0;i<8;i++){var r=i%2?s*.25:s;cx.lineTo(Math.cos(i*Math.PI/4)*r,Math.sin(i*Math.PI/4)*r)}cx.fill();cx.restore();
}
var COLS=['#ff4f93','#ff7ab0','#ffffff','#d81b60','#ffb3d1'];
function mk(x,y,mode){
  var b=mode==='burst';
  return{k:Math.random()<.25?'star':'heart',x:x,y:y,s:(b?10+Math.random()*22:8+Math.random()*18)*R,
    vx:b?(Math.random()-.5)*12*R:(Math.random()-.5)*.7*R,vy:b?(Math.random()-.85)*11*R:-(.5+Math.random()*1.4)*R,
    g:b?.2*R:0,a:.95,rot:(Math.random()-.5)*.8,c:COLS[Math.floor(Math.random()*COLS.length)],fade:b?.006:.0025}
}
function burst(){for(var i=0;i<90;i++)parts.push(mk(W/2,H*.5,'burst'))}
setInterval(function(){if(parts.length<70)parts.push(mk(Math.random()*W,H+30,'rise'))},300);
(function loop(){
  cx.clearRect(0,0,W,H);
  for(var i=parts.length-1;i>=0;i--){
    var p=parts[i];p.x+=p.vx;p.y+=p.vy;p.vy+=p.g;p.a-=p.fade;
    var a=Math.max(p.a,0);
    p.k==='star'?star(p.x,p.y,p.s*.6,a):heart(p.x,p.y,p.s,p.c,a*.85,p.rot);
    if(p.a<=0||p.y<-60||p.y>H+90)parts.splice(i,1);
  }
  requestAnimationFrame(loop);
})();
})();
