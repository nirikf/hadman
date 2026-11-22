var E={};
(function(){
'use strict';
var LW=320,LH=180,STEP=1/60;
E.W=LW;E.H=LH;E.scale=1;E.t=0;E.dt=STEP;E.shake=0;E.sound=true;
E.cv=null;E.ctx=null;
E.keys={};E.pressed={};E.tap=false;
E.mouse={x:LW/2,y:LH/2,down:false,seen:false};
E.stick={x:0,y:0,on:false,id:null,ox:0,oy:0};
E.clamp=function(v,a,b){return v<a?a:v>b?b:v};
E.rand=function(a,b){return a+Math.random()*(b-a)};
E.randi=function(a,b){return Math.floor(a+Math.random()*(b-a+1))};
E.pick=function(a){return a[(Math.random()*a.length)|0]};
E.hyp=function(x,y){return Math.sqrt(x*x+y*y)};
E.dist=function(a,b){return E.hyp(a.x-b.x,a.y-b.y)};
E.load=function(k,d){try{var v=localStorage.getItem('seed_'+k);return v==null?d:JSON.parse(v)}catch(e){return d}};
E.save=function(k,v){try{localStorage.setItem('seed_'+k,JSON.stringify(v))}catch(e){}};
E.ac=null;
E.unlock=function(){if(E.ac)return;var A=window.AudioContext||window.webkitAudioContext;if(!A)return;try{E.ac=new A()}catch(e){}};
E.beep=function(f,d,type,v,slide){if(!E.ac||!E.sound)return;
var t=E.ac.currentTime,o=E.ac.createOscillator(),g=E.ac.createGain();
o.type=type||'square';o.frequency.setValueAtTime(f,t);
if(slide)o.frequency.exponentialRampToValueAtTime(Math.max(20,f*slide),t+d);
g.gain.setValueAtTime(0,t);g.gain.linearRampToValueAtTime(v||.07,t+.005);
g.gain.exponentialRampToValueAtTime(.0001,t+d);
o.connect(g);g.connect(E.ac.destination);o.start(t);o.stop(t+d+.02);
o.onended=function(){try{o.disconnect();g.disconnect()}catch(e){}}};
E.px=function(x,y,w,h,c){E.ctx.fillStyle=c;E.ctx.fillRect(Math.round(x),Math.round(y),w,h)};
E.disc=function(x,y,r,c,a){x=Math.round(x);y=Math.round(y);r=Math.round(r);
E.ctx.globalAlpha=a==null?1:a;E.ctx.fillStyle=c;
for(var dy=-r;dy<=r;dy++){var w=Math.floor(Math.sqrt(Math.max(0,r*r-dy*dy)));E.ctx.fillRect(x-w,y+dy,w*2+1,1)}
E.ctx.globalAlpha=1};
E.ring=function(x,y,r,c,a){x=Math.round(x);y=Math.round(y);r=Math.round(r);if(r<1)return;
E.ctx.globalAlpha=a==null?1:a;E.ctx.fillStyle=c;
var px=r,py=0,err=1-r;
while(px>=py){E.ctx.fillRect(x+px,y+py,1,1);E.ctx.fillRect(x+py,y+px,1,1);E.ctx.fillRect(x-py,y+px,1,1);E.ctx.fillRect(x-px,y+py,1,1);E.ctx.fillRect(x-px,y-py,1,1);E.ctx.fillRect(x-py,y-px,1,1);E.ctx.fillRect(x+py,y-px,1,1);E.ctx.fillRect(x+px,y-py,1,1);py++;if(err<0)err+=2*py+1;else{px--;err+=2*(py-px)+1}}
E.ctx.globalAlpha=1};
E.text=function(s,x,y,c,size,align){E.ctx.fillStyle=c;E.ctx.font='700 '+(size||8)+'px monospace';
E.ctx.textAlign=align||'left';E.ctx.textBaseline='top';E.ctx.fillText(s,Math.round(x),Math.round(y))};
E.shakeIt=function(v){E.shake=Math.min(6,E.shake+v)};
function resize(){var s=Math.max(1,Math.floor(Math.min(window.innerWidth/LW,window.innerHeight/LH)));
E.scale=s;E.cv.style.width=(LW*s)+'px';E.cv.style.height=(LH*s)+'px'}
function logical(cx,cy){var r=E.cv.getBoundingClientRect();
return{x:(cx-r.left)/E.scale,y:(cy-r.top)/E.scale}}
function move(){var x=0,y=0;
if(E.keys.KeyA||E.keys.ArrowLeft)x-=1;
if(E.keys.KeyD||E.keys.ArrowRight)x+=1;
if(E.keys.KeyW||E.keys.ArrowUp)y-=1;
if(E.keys.KeyS||E.keys.ArrowDown)y+=1;
if(E.stick.on){x+=E.stick.x;y+=E.stick.y}
var l=E.hyp(x,y);if(l>1){x/=l;y/=l}
return{x:x,y:y}}
E.move=move;
var last=0,acc=0;
function frame(now){
if(!last)last=now;
var raw=Math.min(.05,(now-last)/1000);last=now;E.dt=raw;
acc+=raw;var n=0;
while(acc>=STEP&&n<5){E.t+=STEP;GAME.update(STEP);acc-=STEP;n++;E.pressed={};E.tap=false}
if(acc>STEP*5)acc=0;
E.shake=Math.max(0,E.shake-raw*18);
var c=E.ctx;c.imageSmoothingEnabled=false;
c.setTransform(1,0,0,1,0,0);
c.fillStyle='#07040f';c.fillRect(0,0,LW,LH);
if(E.shake>.1)c.translate(Math.round(E.rand(-E.shake,E.shake)),Math.round(E.rand(-E.shake,E.shake)));
GAME.draw(c);
c.setTransform(1,0,0,1,0,0);
requestAnimationFrame(frame)}
E.init=function(){
E.cv=document.getElementById('cv');
E.ctx=E.cv.getContext('2d',{alpha:false});
resize();window.addEventListener('resize',resize);
window.addEventListener('keydown',function(e){
if(['Space','ArrowUp','ArrowDown','ArrowLeft','ArrowRight'].indexOf(e.code)>=0)e.preventDefault();
E.unlock();if(!E.keys[e.code])E.pressed[e.code]=true;E.keys[e.code]=true});
window.addEventListener('keyup',function(e){E.keys[e.code]=false});
window.addEventListener('blur',function(){E.keys={};E.stick.on=false;E.stick.x=0;E.stick.y=0});
E.cv.addEventListener('pointerdown',function(e){E.unlock();
var p=logical(e.clientX,e.clientY);
if(e.pointerType==='touch'){
if(p.x<LW*.5){E.stick.on=true;E.stick.id=e.pointerId;E.stick.ox=p.x;E.stick.oy=p.y;E.stick.x=0;E.stick.y=0}
else E.tap=true;
}else{E.mouse.down=true;E.tap=true}
E.mouse.x=p.x;E.mouse.y=p.y;E.mouse.seen=true;
try{E.cv.setPointerCapture(e.pointerId)}catch(err){}});
E.cv.addEventListener('pointermove',function(e){var p=logical(e.clientX,e.clientY);
if(e.pointerType==='touch'){if(E.stick.on&&E.stick.id===e.pointerId){
var dx=p.x-E.stick.ox,dy=p.y-E.stick.oy,d=E.hyp(dx,dy),m=18;
if(d>m){E.stick.ox=p.x-dx/d*m;E.stick.oy=p.y-dy/d*m;dx=dx/d*m;dy=dy/d*m}
E.stick.x=dx/m;E.stick.y=dy/m}return}
E.mouse.x=p.x;E.mouse.y=p.y;E.mouse.seen=true});
function up(e){if(E.stick.id===e.pointerId){E.stick.on=false;E.stick.x=0;E.stick.y=0;E.stick.id=null}
E.mouse.down=false}
E.cv.addEventListener('pointerup',up);
E.cv.addEventListener('pointercancel',up);
E.cv.addEventListener('contextmenu',function(e){e.preventDefault()});
if(typeof GAME.ready==='function')GAME.ready();
requestAnimationFrame(frame)};
})();
