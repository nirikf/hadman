var GAME={};
(function(){
'use strict';
var GRAV=400,JUMP=-152,SPD=72;
var VOID='#0b0618',STONE='#2a1f4a',STONE2='#3d2f66',GOLD='#c9a227',CY='#22e6ff',
    HOT='#ffd76a',MG='#ff2fb0',GR='#9dff3c',RD='#ff4d4d',DIM='#7a6ba8',INK='#f4ecff';
var TOUCH=('ontouchstart' in window)||navigator.maxTouchPoints>0;
var BTN=[{k:'parry',x:243,y:152,r:13,l:'П'},{k:'slash',x:274,y:152,r:13,l:'М'},{k:'fire',x:305,y:152,r:13,l:'О'}];
var P,foes,buls,ebuls,parts,floats,plats,depth,score,best,dead,shiftP,shifting,slow,flash,flashC,tutT,heatIdle;
GAME.ready=function(){best=E.load('temple_best',0);reset()};
function reset(){
P={x:40,y:150,vx:0,vy:0,face:1,on:false,hp:100,max:100,heat:0,slash:0,sdir:1,
   parry:0,pcd:0,inv:0,fireT:0,spin:0,hat:0,coyote:0,walk:0,fireHold:0};
foes=[];buls=[];ebuls=[];parts=[];floats=[];plats=[];
depth=1;score=0;dead=false;shiftP=1;shifting=false;slow=0;flash=0;flashC='#fff';tutT=0;heatIdle=0;
for(var i=0;i<3;i++)plats.push(mkPlat());
spawnWave()}
function mkPlat(){var x=E.rand(26,232),y=E.rand(58,138),w=E.rand(38,74);
return{x:x,y:y,w:w,ox:x,oy:y,ow:w}}
function platCur(p){var t=E.clamp(shiftP,0,1),e=t*t*(3-2*t);
return{x:p.ox+(p.x-p.ox)*e,y:p.oy+(p.y-p.oy)*e,w:p.ow+(p.w-p.ow)*e}}
function spawnWave(){
var n=1+Math.min(4,Math.floor(depth*.7));
for(var i=0;i<n;i++){
if(i%3===2)foes.push({tp:'eye',x:E.rand(60,270),y:E.rand(40,90),hp:20+depth*3,max:20+depth*3,r:6,
cd:E.rand(1.2,2.4),tel:0,stag:0,ph:E.rand(0,6),base:0});
else foes.push({tp:'monk',x:E.rand(120,300),y:150,vx:0,vy:0,hp:30+depth*5,max:30+depth*5,r:7,
st:'walk',tel:0,lung:0,stag:0,on:false,face:-1,t:E.rand(0,6)})}
for(i=0;i<foes.length;i++)if(foes[i].tp==='eye')foes[i].base=foes[i].y}
function burst(x,y,c,n,sp){for(var i=0;i<n;i++){var a=E.rand(0,6.283),s=E.rand(sp*.3,sp);
parts.push({x:x,y:y,vx:Math.cos(a)*s,vy:Math.sin(a)*s,l:E.rand(.2,.55),m:.55,c:c})}}
function say(x,y,t,c){floats.push({x:x,y:y,t:t,c:c,l:.8,m:.8})}
function land(o,prev){
if(o.vy<0)return false;
if(prev<=168&&o.y>=168){o.y=168;return true}
for(var i=0;i<plats.length;i++){var q=platCur(plats[i]);
if(prev<=q.y&&o.y>=q.y&&o.x>q.x-4&&o.x<q.x+q.w+4){o.y=q.y;return true}}
return false}
function doSlash(){
if(P.slash>0)return;
var h=P.heat;P.heat=0;P.slash=.28;P.sdir=-P.sdir;
var dmg=12+h*.35,rad=20+h*.13;
E.beep(240+h*2,.13,'sawtooth',.07,.4);E.shakeIt(.8+h*.02);
if(h>70){burst(P.x+P.face*14,P.y-16,HOT,16,120);flash=.14;flashC=HOT}
for(var i=0;i<foes.length;i++){var f=foes[i];
var dx=f.x-P.x,dy=(f.y-f.r)-(P.y-16);
if(E.hyp(dx,dy)>rad+f.r)continue;
if(dx*P.face<-6)continue;
hurtFoe(f,dmg*(f.stag>0?2:1),true)}}
function hurtFoe(f,d,big){
f.hp-=d;f.fl=.12;
burst(f.x,f.y-f.r,big?HOT:'#fff',big?9:4,big?90:55);
say(f.x,f.y-f.r-8,Math.round(d),big?HOT:INK);
E.beep(big?520:700,.05,'square',.05,.7);
if(f.hp<=0){f.dead=true;score+=f.tp==='eye'?18:14;
burst(f.x,f.y-f.r,MG,16,110);E.shakeIt(1.4);E.beep(180,.16,'square',.07,.35)}}
function parryOK(f){
if(f)f.stag=1.3;
P.heat=Math.min(100,P.heat+25);P.inv=.5;P.pary=0;slow=.18;
flash=.2;flashC=CY;E.shakeIt(2);
say(P.x,P.y-34,'ПАРИРОВАНО',CY);
burst(P.x,P.y-22,CY,18,130);
E.beep(880,.1,'triangle',.08,1.6);E.beep(1320,.14,'triangle',.06,1.4)}
function hurtP(d){
if(P.inv>0||dead)return;
P.hp-=d;P.inv=.7;E.shakeIt(2.4);flash=.2;flashC=RD;
burst(P.x,P.y-10,RD,12,90);E.beep(150,.22,'square',.08,.35);
say(P.x,P.y-30,'-'+d,RD);
if(P.hp<=0){dead=true;burst(P.x,P.y-12,RD,30,150);E.shakeIt(4);
E.beep(120,.5,'sawtooth',.09,.3);
if(depth>best){best=depth;E.save('temple_best',best)}}}
function newRoom(){
shifting=true;shiftP=0;
for(var i=0;i<plats.length;i++){var p=plats[i],c=platCur(p);
p.ox=c.x;p.oy=c.y;p.ow=c.w;
p.x=E.rand(26,232);p.y=E.rand(58,138);p.w=E.rand(38,74)}
depth++;score+=40;E.beep(300,.3,'sine',.07,2);E.beep(450,.35,'sine',.05,1.6,.1);
say(160,60,'ХРАМ СДВИНУЛСЯ',GOLD)}
function pressBtn(){
if(!TOUCH||!E.tap)return null;
for(var i=0;i<BTN.length;i++){var b=BTN[i];
if(E.hyp(E.mouse.x-b.x,E.mouse.y-b.y)<b.r+3)return b.k}
return null}
GAME.update=function(dt){
if(slow>0){slow-=dt;dt*=.35}
if(flash>0)flash-=dt*3;
var i;
for(i=parts.length-1;i>=0;i--){var p=parts[i];p.l-=dt;
var k=Math.exp(-4*dt);p.vx*=k;p.vy*=k;p.x+=p.vx*dt;p.y+=p.vy*dt;
if(p.l<=0)parts.splice(i,1)}
for(i=floats.length-1;i>=0;i--){var fl=floats[i];fl.l-=dt;fl.y-=14*dt;if(fl.l<=0)floats.splice(i,1)}
if(dead){if(E.pressed.Space||E.tap)reset();return}
tutT+=dt;
if(shifting){shiftP+=dt/.8;if(shiftP>=1){shiftP=1;shifting=false;spawnWave()}}
var mv=E.move(),bt=pressBtn();
if(Math.abs(mv.x)>.1)P.face=mv.x>0?1:-1;
var wantJump=E.pressed.Space||E.pressed.KeyW||E.pressed.ArrowUp||mv.y<-.55;
P.coyote=P.on?.1:Math.max(0,P.coyote-dt);
if(wantJump&&P.coyote>0){P.vy=JUMP;P.on=false;P.coyote=0;E.beep(420,.08,'square',.05,1.5)}
var kk=1-Math.exp(-18*dt);P.vx+=(mv.x*SPD-P.vx)*kk;
var prev=P.y;P.vy+=GRAV*dt;P.x=E.clamp(P.x+P.vx*dt,8,312);P.y+=P.vy*dt;
P.on=land(P,prev);if(P.on)P.vy=0;
if(P.y>176){P.y=168;P.vy=0;P.on=true}
P.walk+=Math.abs(P.vx)*dt*.25;
P.slash=Math.max(0,P.slash-dt);P.pcd=Math.max(0,P.pcd-dt);P.inv=Math.max(0,P.inv-dt);
P.parry=Math.max(0,P.parry-dt);
P.hat+=((P.parry>0?1:0)-P.hat)*Math.min(1,dt*14);
var wantParry=E.pressed.KeyL||E.pressed.ShiftLeft||E.pressed.ShiftRight||bt==='parry';
if(wantParry&&P.pcd<=0){P.parry=.24;P.pcd=.5;E.beep(660,.07,'triangle',.05,1.3)}
var wantSlash=E.pressed.KeyJ||bt==='slash'||(E.tap&&!bt&&!TOUCH);
if(wantSlash)doSlash();
var firing=E.keys.KeyK||P.fireHold>0;
if(bt==='fire')P.fireHold=.3;
P.fireHold=Math.max(0,P.fireHold-dt);
if(firing&&!shifting){
P.fireT-=dt;P.spin+=dt*34;heatIdle=0;
if(P.fireT<=0){P.fireT=.075;P.heat=Math.min(100,P.heat+2.6);
var a=(P.face>0?0:Math.PI)+E.rand(-.06,.06);
buls.push({x:P.x+P.face*8,y:P.y-16,vx:Math.cos(a)*270,vy:Math.sin(a)*270,l:.9,dmg:3});
burst(P.x+P.face*10,P.y-16,HOT,2,50);
E.beep(200+E.rand(0,60),.03,'square',.035,.6)}
}else{heatIdle+=dt;if(heatIdle>.5)P.heat=Math.max(0,P.heat-4*dt);P.spin+=dt*2}
for(i=buls.length-1;i>=0;i--){var b=buls[i];b.l-=dt;b.x+=b.vx*dt;b.y+=b.vy*dt;
var hit=false;
for(var j=0;j<foes.length;j++){var f=foes[j];
if(E.hyp(b.x-f.x,b.y-(f.y-f.r))<f.r+2){hurtFoe(f,b.dmg,false);hit=true;break}}
if(hit||b.l<=0||b.x<4||b.x>316||b.y<14||b.y>176)buls.splice(i,1)}
for(i=ebuls.length-1;i>=0;i--){var e=ebuls[i];e.l-=dt;e.x+=e.vx*dt;e.y+=e.vy*dt;
if(P.parry>0&&E.hyp(e.x-P.x,e.y-(P.y-14))<16){
var tg=null,bd=1e9;
for(j=0;j<foes.length;j++){var d2=E.hyp(foes[j].x-e.x,foes[j].y-e.y);if(d2<bd){bd=d2;tg=foes[j]}}
var aa=tg?Math.atan2(tg.y-tg.r-e.y,tg.x-e.x):(P.face>0?0:Math.PI);
buls.push({x:e.x,y:e.y,vx:Math.cos(aa)*300,vy:Math.sin(aa)*300,l:1,dmg:22});
ebuls.splice(i,1);parryOK(tg);continue}
if(E.hyp(e.x-P.x,e.y-(P.y-10))<8){hurtP(12);ebuls.splice(i,1);continue}
if(e.l<=0||e.x<4||e.x>316||e.y<14||e.y>176)ebuls.splice(i,1)}
for(i=foes.length-1;i>=0;i--){var f=foes[i];
if(f.dead){foes.splice(i,1);continue}
f.fl=Math.max(0,(f.fl||0)-dt);
if(f.stag>0){f.stag-=dt;if(f.tp==='monk'){f.vx*=.85;var pv=f.y;f.vy+=GRAV*dt;f.y+=f.vy*dt;if(land(f,pv))f.vy=0}continue}
if(f.tp==='monk'){
f.t+=dt;
if(f.st==='walk'){
f.face=P.x>f.x?1:-1;
f.vx+=(f.face*30-f.vx)*Math.min(1,dt*5);
var pv2=f.y;f.vy+=GRAV*dt;f.x=E.clamp(f.x+f.vx*dt,8,312);f.y+=f.vy*dt;
f.on=land(f,pv2);if(f.on)f.vy=0;
if(f.y>176){f.y=168;f.vy=0}
if(Math.abs(P.x-f.x)<30&&Math.abs(P.y-f.y)<24){f.st='tel';f.tel=.5;f.vx=0}}
else if(f.st==='tel'){f.tel-=dt;f.vx*=.8;
var pv3=f.y;f.vy+=GRAV*dt;f.y+=f.vy*dt;if(land(f,pv3))f.vy=0;
if(f.tel<=0){f.st='lunge';f.lung=.34;f.face=P.x>f.x?1:-1;E.beep(320,.12,'sawtooth',.06,1.8)}}
else{f.lung-=dt;f.vx=f.face*185;
var pv4=f.y;f.vy+=GRAV*dt;f.x=E.clamp(f.x+f.vx*dt,8,312);f.y+=f.vy*dt;if(land(f,pv4))f.vy=0;
if(f.y>176){f.y=168;f.vy=0}
if(E.hyp(P.x-f.x,(P.y-8)-(f.y-8))<12){
if(P.parry>0){parryOK(f);f.st='walk';f.lung=0}
else{hurtP(18);f.st='walk';f.lung=0}}
if(f.lung<=0){f.st='walk'}}
}else{
f.ph+=dt;f.y=f.base+Math.sin(f.ph*1.6)*6;
f.cd-=dt;f.tel=f.cd<.45?1:0;
if(f.cd<=0){f.cd=Math.max(1,2.4-depth*.06);
var ang=Math.atan2((P.y-12)-f.y,P.x-f.x);
ebuls.push({x:f.x,y:f.y,vx:Math.cos(ang)*95,vy:Math.sin(ang)*95,l:3.2});
E.beep(520,.1,'sine',.05,.6)}}}
if(!foes.length&&!shifting)newRoom();
};
function bladeCol(){return P.heat>75?'#fff':P.heat>45?HOT:CY}
function drawRobot(c){
var f=P.face,bx=Math.round(P.x),by=Math.round(P.y),lean=P.hat*2;
var wl=Math.sin(P.walk)*2;
c.fillStyle='#0a0518';
c.fillRect(bx-3,by-6,1,6);c.fillRect(bx+2,by-6,1,6);
c.fillRect(bx-3+Math.round(wl),by-2,1,2);c.fillRect(bx+2-Math.round(wl),by-2,1,2);
var cy0=by-15+lean;
c.fillStyle='#0a0518';c.fillRect(bx-7,cy0-1,14,12);
c.fillStyle='#0e7a5f';c.fillRect(bx-6,cy0,12,10);
c.fillStyle='#12a37a';c.fillRect(bx-6,cy0,6,5);
c.fillStyle='#0a0518';c.fillRect(bx-1,cy0+1,1,9);c.fillRect(bx+3,cy0+3,1,7);
c.fillStyle='#fff';c.fillRect(bx-4,cy0+5,1,2);c.fillRect(bx+1,cy0+2,1,2);
c.save();c.translate(bx,cy0+1);c.scale(f,1);
var ang=P.slash>0?(1-P.slash/.28)*3.6-1.8:0;
c.rotate(ang);
c.fillStyle='#0a0518';c.fillRect(-15,-3,34,6);
c.fillStyle=bladeCol();c.fillRect(5,-1,13,2);c.fillRect(-14,-1,9,2);
c.fillStyle='#b8fbff';c.fillRect(15,-1,3,1);
c.fillStyle='#1a1a22';c.fillRect(-5,-2,10,4);
for(var i=0;i<3;i++){var a=P.spin+i*2.094;
c.fillStyle='#fff';c.fillRect(Math.round(Math.cos(a)*2),Math.round(Math.sin(a)*2)-1,1,1)}
if(P.fireHold>0||E.keys.KeyK){c.fillStyle=HOT;c.fillRect(6,-2,4,4);c.fillStyle='#fff';c.fillRect(7,-1,2,2)}
c.restore();
c.save();c.translate(bx,cy0-9-P.hat*11);c.rotate(P.hat*.55*f);
c.fillStyle='#0a0518';c.fillRect(-6,-9,12,12);
c.fillStyle='#6b4a12';c.fillRect(-5,-8,10,10);
c.fillStyle='#8f6420';c.fillRect(-5,-8,10,3);
c.fillStyle='#0a0518';c.fillRect(-9,2,18,3);
c.fillStyle='#6b4a12';c.fillRect(-8,2,16,2);
c.fillStyle='#ff2020';c.fillRect(-3,-5,6,5);
c.fillStyle='#0a0518';c.fillRect(0,-3,2,2);
c.restore();
if(P.parry>0){c.save();c.globalAlpha=.6;
c.strokeStyle=CY;c.lineWidth=2;c.beginPath();
c.arc(bx,cy0-2,15,-1.1,1.1);c.stroke();c.restore()}}
GAME.draw=function(c){
var i;
c.fillStyle=VOID;c.fillRect(0,0,E.W,E.H);
for(i=0;i<7;i++){var gx=14+i*46;
c.fillStyle=STONE;c.fillRect(gx,14,10,162);
c.fillStyle=STONE2;c.fillRect(gx+2,14,3,162);
c.fillStyle=GOLD;c.globalAlpha=.25+.15*Math.sin(E.t*1.5+i);
c.fillRect(gx+3,40+((i*29)%90),4,4);c.globalAlpha=1}
c.fillStyle=STONE2;c.fillRect(0,168,E.W,12);
c.fillStyle=GOLD;c.globalAlpha=.3;c.fillRect(0,168,E.W,1);c.globalAlpha=1;
for(i=0;i<plats.length;i++){var q=platCur(plats[i]);
c.fillStyle='#0a0518';c.fillRect(Math.round(q.x)-1,Math.round(q.y)-1,Math.round(q.w)+2,7);
c.fillStyle=STONE2;c.fillRect(Math.round(q.x),Math.round(q.y),Math.round(q.w),5);
c.fillStyle=GOLD;c.globalAlpha=.4;c.fillRect(Math.round(q.x),Math.round(q.y),Math.round(q.w),1);c.globalAlpha=1}
for(i=0;i<foes.length;i++){var f=foes[i];
if(f.tp==='monk'){
var tel=f.st==='tel'&&Math.floor(E.t*16)%2===0;
c.fillStyle='#0a0518';c.fillRect(f.x-7,f.y-16,14,16);
c.fillStyle=tel?'#fff':(f.stag>0?'#6b5f96':'#8f2f6b');c.fillRect(f.x-6,f.y-15,12,14);
c.fillStyle='#ff2fb0';c.fillRect(f.x-4,f.y-13,8,4);
c.fillStyle='#0a0518';c.fillRect(f.x-2,f.y-12,4,2);
c.fillStyle='#0a0518';c.fillRect(f.x-5,f.y-2,2,2);c.fillRect(f.x+3,f.y-2,2,2);
if(f.st==='tel'){c.fillStyle=RD;c.globalAlpha=.7;
c.fillRect(f.x+f.face*8,f.y-12,f.face*14,2);c.globalAlpha=1}
}else{
var tl=f.tel&&Math.floor(E.t*16)%2===0;
c.fillStyle='#0a0518';c.beginPath();c.arc(f.x,f.y,7,0,6.283);c.fill();
c.fillStyle=tl?'#fff':(f.stag>0?'#6b5f96':'#4a2a8f');c.beginPath();c.arc(f.x,f.y,6,0,6.283);c.fill();
c.fillStyle=CY;c.fillRect(f.x-3,f.y-2,6,4);
c.fillStyle='#0a0518';c.fillRect(f.x-1,f.y-1,2,2);
if(f.tel){var aa=Math.atan2((P.y-12)-f.y,P.x-f.x);
c.fillStyle=CY;c.globalAlpha=.5;
for(var d=8;d<120;d+=5)c.fillRect(Math.round(f.x+Math.cos(aa)*d),Math.round(f.y+Math.sin(aa)*d),1,1);
c.globalAlpha=1}}
if(f.stag>0){c.globalAlpha=.8;E.text('ОТКРЫТ',f.x,f.y-f.r-18,GR,7,'center');c.globalAlpha=1}
var hf=E.clamp(f.hp/f.max,0,1);
c.fillStyle='#0a0518';c.fillRect(f.x-8,f.y-f.r-13,16,3);
c.fillStyle=hf>.5?GR:RD;c.fillRect(f.x-7,f.y-f.r-12,Math.round(14*hf),1)}
for(i=0;i<ebuls.length;i++){var e=ebuls[i];
E.disc(e.x,e.y,3,MG,1);E.disc(e.x,e.y,1,'#fff',1)}
for(i=0;i<buls.length;i++){var b=buls[i];
c.fillStyle=HOT;c.fillRect(Math.round(b.x)-2,Math.round(b.y)-1,4,2);
c.fillStyle='#fff';c.fillRect(Math.round(b.x),Math.round(b.y),1,1)}
if(!dead)drawRobot(c);
for(i=0;i<parts.length;i++){var p=parts[i];c.globalAlpha=E.clamp(p.l/p.m,0,1);
c.fillStyle=p.c;c.fillRect(Math.round(p.x),Math.round(p.y),1,1)}c.globalAlpha=1;
for(i=0;i<floats.length;i++){var fl=floats[i];c.globalAlpha=E.clamp(fl.l/fl.m,0,1);
E.text(fl.t,fl.x,fl.y,fl.c,7,'center')}c.globalAlpha=1;
c.fillStyle='#0a0518';c.fillRect(0,0,E.W,14);
c.fillStyle='#0a0518';c.fillRect(3,3,62,5);c.fillStyle=RD;c.fillRect(4,4,Math.round(60*E.clamp(P.hp/P.max,0,1)),3);
c.fillStyle='#0a0518';c.fillRect(3,9,62,4);
c.fillStyle=P.heat>75?'#fff':P.heat>45?HOT:CY;c.fillRect(4,10,Math.round(60*P.heat/100),2);
E.text('ТЕПЛО',68,8,DIM,6);
E.text('ГЛУБИНА '+depth,E.W-4,2,GOLD,8,'right');
E.text('СЧЁТ '+score+' · РЕК '+best,E.W-4,9,DIM,6,'right');
if(TOUCH){for(i=0;i<BTN.length;i++){var bt=BTN[i];
c.globalAlpha=.55;E.disc(bt.x,bt.y,bt.r,'#1d1040',1);
c.globalAlpha=.9;E.ring(bt.x,bt.y,bt.r,bt.k==='fire'?HOT:bt.k==='slash'?MG:CY,1);
E.text(bt.l,bt.x,bt.y-4,INK,9,'center');c.globalAlpha=1}}
else if(depth===1&&tutT<14){
E.text('A/D ход · W прыжок · J меч · K огонь · L парирование',E.W/2,20,DIM,6,'center');
E.text('стреляй чтобы греть · руби чтобы обналичить тепло',E.W/2,28,GOLD,6,'center')}
if(shifting){c.globalAlpha=.8;E.text('ХРАМ ПЕРЕСТРАИВАЕТСЯ',E.W/2,72,GOLD,10,'center');c.globalAlpha=1}
if(flash>0){c.globalAlpha=E.clamp(flash,0,.5);c.fillStyle=flashC;c.fillRect(0,0,E.W,E.H);c.globalAlpha=1}
if(dead){c.fillStyle='#0d0620';c.fillRect(0,58,E.W,64);
E.text('ШЛЯПА ПАЛА',E.W/2,66,RD,13,'center');
E.text('глубина '+depth+' · счёт '+score+' · рекорд '+best,E.W/2,86,INK,8,'center');
E.text(Math.floor(E.t*2)%2?'ПРОБЕЛ или ТАП — заново':'',E.W/2,102,CY,8,'center')}};
})();
