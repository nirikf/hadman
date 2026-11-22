var GAME={};
(function(){
'use strict';
var P,gems,foes,parts,score,best,dead,spawnT,foeT,trail;
var CY='#22e6ff',AM='#ffb020',MG='#ff2fb0',GR='#9dff3c',RD='#ff4d4d',DIM='#6b5f96';
GAME.ready=function(){best=E.load('best',0);reset()};
function reset(){
P={x:E.W/2,y:E.H/2,vx:0,vy:0,r:4,dash:0,cd:0,inv:1};
gems=[];foes=[];parts=[];trail=[];score=0;dead=false;spawnT=0;foeT=2;
for(var i=0;i<5;i++)addGem()}
function addGem(){gems.push({x:E.rand(16,E.W-16),y:E.rand(20,E.H-16),t:E.rand(0,6)})}
function addFoe(){var s=E.randi(0,3),x,y;
if(s===0){x=E.rand(0,E.W);y=-8}else if(s===1){x=E.W+8;y=E.rand(0,E.H)}
else if(s===2){x=E.rand(0,E.W);y=E.H+8}else{x=-8;y=E.rand(0,E.H)}
foes.push({x:x,y:y,r:4,sp:E.rand(16,26)+score*.25})}
function burst(x,y,c,n){for(var i=0;i<n;i++){var a=E.rand(0,6.283),s=E.rand(20,70);
parts.push({x:x,y:y,vx:Math.cos(a)*s,vy:Math.sin(a)*s,l:E.rand(.2,.5),m:.5,c:c})}}
GAME.update=function(dt){
if(dead){if(E.pressed.Space||E.tap)reset();return}
var mv=E.move(),sp=62;
P.cd=Math.max(0,P.cd-dt);P.inv=Math.max(0,P.inv-dt);
if((E.pressed.Space||E.tap)&&P.cd<=0){
var dx=mv.x,dy=mv.y;if(!dx&&!dy){dx=E.mouse.x-P.x;dy=E.mouse.y-P.y}
var l=E.hyp(dx,dy)||1;P.vx=dx/l*230;P.vy=dy/l*230;P.dash=.14;P.cd=.55;P.inv=.22;
E.beep(300,.12,'square',.06,2.2);E.shakeIt(1.2)}
if(P.dash>0){P.dash-=dt;trail.push({x:P.x,y:P.y,l:.2})}
else{var k=1-Math.exp(-16*dt);P.vx+=(mv.x*sp-P.vx)*k;P.vy+=(mv.y*sp-P.vy)*k}
P.x=E.clamp(P.x+P.vx*dt,6,E.W-6);P.y=E.clamp(P.y+P.vy*dt,14,E.H-6);
spawnT-=dt;if(spawnT<=0&&gems.length<7){spawnT=1.1;addGem()}
foeT-=dt;if(foeT<=0){foeT=Math.max(.5,2.2-score*.03);addFoe()}
for(var i=gems.length-1;i>=0;i--){var g=gems[i];g.t+=dt;
if(E.dist(P,g)<P.r+5){gems.splice(i,1);score++;burst(g.x,g.y,GR,10);
E.beep(620+score*12,.07,'square',.06,1.5);E.shakeIt(.6)}}
for(i=foes.length-1;i>=0;i--){var f=foes[i];
var dx=P.x-f.x,dy=P.y-f.y,d=E.hyp(dx,dy)||1;
f.x+=dx/d*f.sp*dt;f.y+=dy/d*f.sp*dt;
if(d<P.r+f.r){
if(P.dash>0){foes.splice(i,1);burst(f.x,f.y,AM,12);score+=2;
E.beep(180,.14,'square',.07,.4);E.shakeIt(1.6)}
else if(P.inv<=0){dead=true;burst(P.x,P.y,RD,26);E.shakeIt(4);
E.beep(140,.4,'sawtooth',.09,.3);
if(score>best){best=score;E.save('best',best)}}}}
for(i=parts.length-1;i>=0;i--){var p=parts[i];p.l-=dt;
var kk=Math.exp(-4*dt);p.vx*=kk;p.vy*=kk;p.x+=p.vx*dt;p.y+=p.vy*dt;
if(p.l<=0)parts.splice(i,1)}
for(i=trail.length-1;i>=0;i--){trail[i].l-=dt;if(trail[i].l<=0)trail.splice(i,1)}};
GAME.draw=function(c){
for(var y=16;y<E.H;y+=16)for(var x=8;x<E.W;x+=16)E.px(x,y,1,1,'#160c2c');
E.px(0,12,E.W,1,'#2a1856');
var i;
for(i=0;i<gems.length;i++){var g=gems[i],pu=.5+.5*Math.sin(g.t*4);
E.ring(g.x,g.y,4+Math.round(pu*2),GR,.35);
E.disc(g.x,g.y,2,GR,.9);E.px(g.x-1,g.y-1,1,1,'#fff')}
for(i=0;i<foes.length;i++){var f=foes[i];
E.disc(f.x,f.y,f.r,RD,1);E.disc(f.x,f.y,f.r-2,'#8f2020',1);
E.px(f.x-1,f.y-1,1,1,'#ffd9d9')}
for(i=0;i<trail.length;i++)E.disc(trail[i].x,trail[i].y,3,CY,trail[i].l*1.6);
for(i=0;i<parts.length;i++){var p=parts[i];E.px(p.x,p.y,1,1,p.c)}
if(!dead){var bl=P.inv>0&&Math.floor(E.t*20)%2===0;
if(!bl){E.disc(P.x,P.y,P.r,CY,1);E.disc(P.x,P.y,P.r-2,'#b8fbff',1);E.px(P.x-1,P.y-1,1,1,'#fff')}
E.ring(P.x,P.y,P.r+3,P.cd<=0?AM:'#2a1856',.5)}
E.text('СЧЁТ '+score,4,3,AM,8);
E.text('РЕКОРД '+best,E.W-4,3,DIM,8,'right');
if(E.stick.on){E.ring(E.stick.ox,E.stick.oy,18,CY,.3);
E.disc(E.stick.ox+E.stick.x*18,E.stick.oy+E.stick.y*18,5,CY,.6)}
if(dead){E.px(0,60,E.W,58,'#0d0620');
E.text('СВЯЗЬ ПОТЕРЯНА',E.W/2,68,RD,12,'center');
E.text('собрано '+score+' · рекорд '+best,E.W/2,86,'#f4ecff',8,'center');
E.text(Math.floor(E.t*2)%2?'ПРОБЕЛ или ТАП — заново':'',E.W/2,102,CY,8,'center')}};
})();
