/* RCI Engineering · inner pages · shared behavior. Moves play once. Reduced motion respected. Nothing delays first paint. */
(function(){
'use strict';
var root=document.documentElement;root.classList.add('js');
var reduce=window.matchMedia&&window.matchMedia('(prefers-reduced-motion: reduce)').matches;

/* quiet entrances */
var io=new IntersectionObserver(function(es){es.forEach(function(e){if(e.isIntersecting){e.target.classList.add('in');io.unobserve(e.target);}});},{rootMargin:'0px 0px -8% 0px',threshold:0.08});
document.querySelectorAll('.rise').forEach(function(el,i){el.style.transitionDelay=((i%5)*70)+'ms';io.observe(el);});

/* headlines rise word by word */
document.querySelectorAll('.wh').forEach(function(h){var out=[],i=0;h.childNodes.forEach(function(n){var g=n.nodeType===1;(n.textContent||'').split(/(\s+)/).forEach(function(w){if(!w)return;if(/^\s+$/.test(w)){out.push(' ');return;}
  out.push('<span class="w"><span'+(g?' class="g"':'')+' style="transition-delay:'+(i++*90)+'ms">'+w+'</span></span>');});});h.innerHTML=out.join('');});
var onceIO=new IntersectionObserver(function(es){es.forEach(function(e){if(e.isIntersecting){e.target.classList.add('in');onceIO.unobserve(e.target);}});},{threshold:0.3});
document.querySelectorAll('.wh,.tb,.steps').forEach(function(el){onceIO.observe(el);});

/* drawings ink themselves in: architecture first, then the systems, which turn green last */
document.querySelectorAll('.draw').forEach(function(f){
  var arc=[].slice.call(f.querySelectorAll('.arc .d')),sys=[].slice.call(f.querySelectorAll('.sys .d'));
  arc.forEach(function(e,i){e.setAttribute('pathLength','1');e.style.transitionDelay=(i*90)+'ms';});
  var t0=arc.length*90+200;sys.forEach(function(e,i){e.setAttribute('pathLength','1');e.style.transitionDelay=(t0+i*110)+'ms';});
  var t1=t0+sys.length*110+500;f.querySelectorAll('.sys').forEach(function(g){g.style.transitionDelay=t1+'ms';});
  f.querySelectorAll('.tg,.lbl').forEach(function(t){t.style.transitionDelay=(t1+250)+'ms';});
  var drawIO=new IntersectionObserver(function(es){es.forEach(function(e){if(e.isIntersecting){e.target.classList.add('in');drawIO.unobserve(e.target);}});},{threshold:0.25});
  drawIO.observe(f);
});

/* the discipline marks fill as they enter */
var fillIO=new IntersectionObserver(function(es){es.forEach(function(e,i){if(e.isIntersecting){var el=e.target;setTimeout(function(){el.classList.add('filled');},(el.dataset.i||0)*140);fillIO.unobserve(el);}});},{threshold:0.5});
document.querySelectorAll('.drow,.ic[data-fill]').forEach(function(el,i){el.dataset.i=i%6;fillIO.observe(el);});

/* the record: filters and cards that flip */
var recs=[].slice.call(document.querySelectorAll('.rec'));
if(recs.length){
  var state={studio:'all',disc:'all',status:'all'},countEl=document.getElementById('recCount');
  function apply(){var n=0;recs.forEach(function(r){var ok=(state.studio==='all'||r.dataset.studio===state.studio)&&(state.disc==='all'||(' '+r.dataset.disc+' ').indexOf(' '+state.disc+' ')>=0)&&(state.status==='all'||r.dataset.status===state.status);
    r.classList.toggle('hide',!ok);if(ok)n++;});if(countEl)countEl.textContent=n+(n===1?' record':' records')+' shown';}
  document.querySelectorAll('.filters button').forEach(function(b){b.addEventListener('click',function(){var k=b.dataset.k,v=b.dataset.v;state[k]=v;
    document.querySelectorAll('.filters button[data-k="'+k+'"]').forEach(function(o){o.classList.toggle('on',o===b);});apply();});});
  recs.forEach(function(r){var c=r.querySelector('.card');c.addEventListener('click',function(){r.classList.toggle('flip');c.setAttribute('aria-pressed',r.classList.contains('flip')?'true':'false');});});
  apply();
}

/* honest send button: the form is not connected yet, and it says so */
document.querySelectorAll('form[data-pending]').forEach(function(form){
  form.addEventListener('submit',function(e){e.preventDefault();var b=form.querySelector('.send');if(!b)return;b.classList.add('pending');b.setAttribute('aria-disabled','true');
    var st=b.querySelector('.st');if(st)st.textContent=form.dataset.pending;});
});

/* encyclopedia: the nav follows the chapter being read */
var chapters=[].slice.call(document.querySelectorAll('.chapter[id]'));
if(chapters.length){var links={};document.querySelectorAll('.enc-nav a[href^="#"]').forEach(function(a){links[a.getAttribute('href').slice(1)]=a;});
  var chIO=new IntersectionObserver(function(es){es.forEach(function(e){if(e.isIntersecting){Object.keys(links).forEach(function(k){links[k].classList.toggle('on',k===e.target.id);});}});},{rootMargin:'-20% 0px -70% 0px',threshold:0});
  chapters.forEach(function(c){chIO.observe(c);});}

/* safety: anything already scrolled past is shown, whatever the observer saw */
var pend=[].slice.call(document.querySelectorAll('.rise,.wh,.tb,.steps,.draw')),tick=false;
function sweep(){tick=false;var vh=innerHeight;pend=pend.filter(function(el){var r=el.getBoundingClientRect();if(r.bottom<vh*0.9&&r.bottom>-vh*3){el.classList.add('in');return false;}return r.bottom>-vh*3;});}
addEventListener('scroll',function(){if(!tick){tick=true;requestAnimationFrame(sweep);}},{passive:true});

/* the nav marks the page you are on */
var here=location.pathname.split('/').pop()||'index.html';
document.querySelectorAll('.bar a[href]').forEach(function(a){var h=a.getAttribute('href').split('#')[0];if(h&&h===here)a.classList.add('on');});
})();

/* ---------- hero drafting canvas: a building's MEP set forming in 3D behind the cover. One model per page, data-model picks it ---------- */
(function(){
'use strict';
var cv=document.querySelector('.hero-bg');if(!cv||!cv.getContext)return;
var ctx=cv.getContext('2d');
var reduce=window.matchMedia&&window.matchMedia('(prefers-reduced-motion: reduce)').matches;
var C={p2:'#F1F2F1',l1:'#D5D9D6',rule:'#C9CDCA',wash:'#D3DED6',dark:'#215B33',lite:'#1EB53A',l2:'#A3AAA6'};
function rgba(hex,a){var n=parseInt(hex.slice(1),16);return 'rgba('+(n>>16)+','+(n>>8&255)+','+(n&255)+','+a+')';}
var seed=11;function rnd(){seed=(seed*16807)%2147483647;return (seed-1)/2147483646;}
function ease(x){x=Math.max(0,Math.min(1,x));return 1-Math.pow(1-x,3);}

/* ---- the models: plan shape, levels, core, accent discipline, extras ---- */
function R(x0,y0,x1,y1){return [[x0,y0],[x1,y0],[x1,y1],[x0,y1],[x0,y0]];}
function Lshape(w,d,nx,ny){return [[-w/2,-d/2],[w/2,-d/2],[w/2,d/2-ny],[w/2-nx,d/2-ny],[w/2-nx,d/2],[-w/2,d/2],[-w/2,-d/2]];}
function Ushape(w,d,nw,nd){return [[-w/2,-d/2],[w/2,-d/2],[w/2,d/2],[nw/2,d/2],[nw/2,d/2-nd],[-nw/2,d/2-nd],[-nw/2,d/2],[-w/2,d/2],[-w/2,-d/2]];}
function lv(z,poly,x0,y0,x1,y1,notch){return {z:z,poly:poly,x0:x0,y0:y0,x1:x1,y1:y1,notch:notch||null};}
function stack(zs,poly,x0,y0,x1,y1,notch){return zs.map(function(z){return lv(z,poly,x0,y0,x1,y1,notch);});}
var MODELS={
  about:function(){return {w:24,d:16,levels:stack([0,4.2,8.4],R(-12,-8,12,8),-12,-8,12,8),core:true,roof:true,seed:11,ang:-0.55,spin:64000};},
  services:function(){var n={x:1};return {w:26,d:18,levels:stack([0,4.2],Lshape(26,18,10,8),-13,-9,13,9,n),core:true,roof:true,seed:23,ang:-0.9,spin:72000};},
  mechanical:function(){return {w:28,d:14,levels:stack([0,4.6],R(-14,-7,14,7),-14,-7,14,7),core:false,roof:true,bigroof:true,accent:'mech',seed:37,ang:-0.35,spin:58000};},
  electrical:function(){return {w:12,d:12,levels:stack([0,3.3,6.6,9.9,13.2],R(-6,-6,6,6),-6,-6,6,6),core:true,roof:true,accent:'elec',seed:41,ang:-0.7,spin:52000};},
  plumbing:function(){return {w:20,d:12,levels:stack([0,3.6,7.2,10.8],R(-10,-6,10,6),-10,-6,10,6),core:true,roof:true,accent:'plumb',seed:53,ang:-0.5,spin:66000};},
  'fire-protection':function(){return {w:32,d:14,levels:stack([0,6.2],R(-16,-7,16,7),-16,-7,16,7),core:false,roof:true,accent:'fp',seed:59,ang:-0.25,spin:70000};},
  commissioning:function(){return {w:28,d:10,levels:stack([0,3.4,6.8,10.2],R(-14,-5,14,5),-14,-5,14,5),core:true,roof:true,tests:true,seed:67,ang:-0.6,spin:60000};},
  projects:function(){var p=stack([0,4.2],R(-14,-9,14,9),-14,-9,14,9),t=stack([8.4,12.6,16.8],R(-13,-8,-1,4),-13,-8,-1,4);return {w:28,d:18,levels:p.concat(t),core:true,roof:true,seed:71,ang:-0.45,spin:68000};},
  team:function(){var n={u:1};return {w:26,d:18,levels:stack([0,4.2],Ushape(26,18,10,7),-13,-9,13,9,n),core:true,roof:true,seed:79,ang:-1.1,spin:62000};},
  careers:function(){return {w:18,d:12,levels:stack([0,3.8],R(-9,-6,9,6),-9,-6,9,6),core:false,roof:false,pool:true,seed:83,ang:-0.8,spin:64000};},
  journal:function(){return {w:22,d:12,levels:stack([0,4.4],R(-11,-6,11,6),-11,-6,11,6),core:false,roof:true,kitchen:true,seed:89,ang:-0.4,spin:60000};},
  faq:function(){return {w:16,d:16,levels:stack([0,4,8],R(-8,-8,8,8),-8,-8,8,8),core:true,roof:true,seed:97,ang:-0.65,spin:66000};},
  privacy:function(){return {w:14,d:10,levels:stack([0,4],R(-7,-5,7,5),-7,-5,7,5),core:false,roof:true,sparse:true,seed:101,ang:-0.5,spin:70000};}
};
var M=(MODELS[cv.getAttribute('data-model')]||MODELS.about)();
var BW=M.w,BD=M.d,ZT=M.levels[M.levels.length-1].z;
function inside(L,x,y){if(x<L.x0||x>L.x1||y<L.y0||y>L.y1)return false;if(!L.notch)return true;
  if(L.notch.x){return !(x>L.x1-10&&y>L.y1-8);}if(L.notch.u){return !(x>-5&&x<5&&y>L.y1-7);}return true;}

var els=[],plates=[],flashes=[],BUILD=15000,HOLD=14000,DISS=2600,CYCLE=BUILD+HOLD+DISS;
function poly(pts,col,w,t0,dur,al){els.push({p:pts,c:col,w:w,t0:t0,d:dur,a:al||1});}
function ring(cx,cy,cz,r,col,w,t0,dur,al){var pts=[];for(var i=0;i<=14;i++){var a=i/14*Math.PI*2;pts.push([cx+Math.cos(a)*r,cy+Math.sin(a)*r,cz]);}poly(pts,col,w,t0,dur,al);}
function rect(x0,y0,x1,y1,z,col,w,t0,dur,al){poly([[x0,y0,z],[x1,y0,z],[x1,y1,z],[x0,y1,z],[x0,y0,z]],col,w,t0,dur,al);}
function lift(pts2,z){return pts2.map(function(p){return [p[0],p[1],z];});}
function diffuser(x,y,z,t0,col,al){var s=.7;rect(x-s,y-s,x+s,y+s,z,col||C.rule,1,t0,420,al);poly([[x-s,y-s,z],[x+s,y+s,z]],C.l1,1,t0+200,260);poly([[x+s,y-s,z],[x-s,y+s,z]],C.l1,1,t0+260,260);}
function head(x,y,z,t0,col,al){ring(x,y,z,.32,col||C.wash,1,t0,300,al);poly([[x-.55,y,z],[x+.55,y,z]],col||C.wash,1,t0+120,200,al);poly([[x,y-.55,z],[x,y+.55,z]],col||C.wash,1,t0+160,200,al);}
function outlet(x,y,z,t0,col,al){ring(x,y,z,.3,col||C.l1,1,t0,260,al);poly([[x-.3,y-.45,z],[x-.3,y+.45,z]],col||C.l1,1,t0+140,160,al);}
function tag(x,y,z,dx,dy,t0,col){poly([[x,y,z],[x+dx,y+dy,z],[x+dx+(dx>0?1.6:-1.6),y+dy,z]],col||C.l2,1,t0,500,.4);poly([[x-.14,y-.14,z],[x+.14,y+.14,z]],col||C.l2,1.4,t0,120,.5);}
function cloud(x0,y0,x1,y1,z,t0){var pts=[],n=10,i,u;for(i=0;i<=n;i++){u=i/n;pts.push([x0+(x1-x0)*u,y0-(i%2?.45:0),z]);}for(i=0;i<=n;i++){u=i/n;pts.push([x1+(i%2?.45:0),y0+(y1-y0)*u,z]);}for(i=0;i<=n;i++){u=i/n;pts.push([x1-(x1-x0)*u,y1+(i%2?.45:0),z]);}for(i=0;i<=n;i++){u=i/n;pts.push([x0-(i%2?.45:0),y1-(y1-y0)*u,z]);}poly(pts,C.l2,1,t0,1400,.5);}
function valve(x,y,z,t0,col,al){poly([[x-.45,y-.35,z],[x+.45,y+.35,z],[x+.45,y-.35,z],[x-.45,y+.35,z],[x-.45,y-.35,z]],col||C.wash,1,t0,300,al);}
function fixture(x,y,z,t0){rect(x-.9,y-.3,x+.9,y+.3,z,C.l1,1,t0,260);poly([[x-.9,y,z],[x+.9,y,z]],C.p2,1,t0+150,150);}
function tri(x,y,z,t0,col,al){poly([[x-.4,y+.3,z],[x+.4,y+.3,z],[x,y-.4,z],[x-.4,y+.3,z]],col||C.l2,1,t0,260,al);}
function fan(x,y,z,r,t0){ring(x,y,z,r,C.rule,1,t0,420);poly([[x-r*.7,y-r*.7,z],[x+r*.7,y+r*.7,z]],C.l1,1,t0+200,200);poly([[x+r*.7,y-r*.7,z],[x-r*.7,y+r*.7,z]],C.l1,1,t0+260,200);ring(x,y,z,r*.25,C.l1,1,t0+300,160);}
function hatch(x0,y0,x1,y1,z,t0){var i=0,s=1.1;for(var d=-(y1-y0);d<x1-x0;d+=s){var ax=x0+d,ay=y0,bx=x0+d+(y1-y0),by=y1;if(ax<x0){ay=y0+(x0-ax);ax=x0;}if(bx>x1){by=y1-(bx-x1);bx=x1;}if(by>ay)poly([[ax,ay,z],[bx,by,z]],C.p2,1,t0+i++*40,220);}}
function dashed(a,b,z,t0,dur,col,al){var pts=[],n=22,i;for(i=0;i<=n;i++){var u=i/n;pts.push([a[0]+(b[0]-a[0])*u,a[1]+(b[1]-a[1])*u+(i%2?.18:-.18),z]);}poly(pts,col||C.l1,1,t0,dur,al);}
function box3(x0,y0,x1,y1,z,h,col,t0){rect(x0,y0,x1,y1,z+h,col,1.1,t0,600);rect(x0,y0,x1,y1,z,C.l1,1,t0+80,600);[[x0,y0],[x1,y0],[x0,y1],[x1,y1]].forEach(function(c,i){poly([[c[0],c[1],z],[c[0],c[1],z+h]],C.l1,1,t0+700+i*70,200);});}

var NKEEP=0,cx0,cy0,cx1,cy1;
function build(warm){
  els=[];plates=[];flashes=[];var t=0,i,j,k,x,y;
  var L0=M.levels[0],n=M.levels.length,top=M.levels[n-1];
  var acc=M.accent,ac=function(d){return acc===d?C.dark:null;},aa=function(d){return acc===d?.38:undefined;};
  var dens=M.sparse?.5:1;
  /* ---- structure: grid, plates, columns, core, notes. drawn once, kept through every cycle ---- */
  var nx=Math.round(BW/4),ny=Math.round(BD/4);
  for(i=0;i<=nx;i++){x=-BW/2+i*BW/nx;poly([[x,-BD/2-3,0],[x,BD/2+3,0]],C.p2,1,t+i*110,800);ring(x,-BD/2-4.1,0,.9,C.l1,1,t+i*110+380,420);}
  for(j=0;j<=ny;j++){y=-BD/2+j*BD/ny;poly([[-BW/2-3,y,0],[BW/2+3,y,0]],C.p2,1,t+j*140,800);ring(-BW/2-4.1,y,0,.9,C.l1,1,t+j*140+380,420);}
  t+=1300;
  var per=Math.max(500,Math.round(2400/n));
  M.levels.forEach(function(L,k){var r=lift(L.poly,L.z);poly(r,k===0?C.rule:C.l1,1.25,t+k*per,1500);plates.push({p:r,t:t+k*per+1500});
    if(k<n-1){var N=M.levels[k+1];for(i=0;i<=nx;i+=2)for(j=0;j<=ny;j+=2){x=-BW/2+i*BW/nx;y=-BD/2+j*BD/ny;if(inside(L,x,y)&&inside(N,x,y))poly([[x,y,L.z],[x,y,N.z]],C.l1,1,t+k*per+700+(i*4+j)*45,420);}}
  });
  var tS=t+n*per+800;
  if(M.core){cx0=L0.x0+Math.round((L0.x1-L0.x0)/2)-2;cy0=L0.y0+1;cx1=cx0+4.5;cy1=cy0+4;
    M.levels.forEach(function(L,k){if(!inside(L,cx0,cy0)||!inside(L,cx1,cy1))return;rect(cx0,cy0,cx1,cy1,L.z,C.rule,1,tS+k*250,600);poly([[cx0+2.2,cy0,L.z],[cx0+2.2,cy1,L.z]],C.l1,1,tS+300+k*250,300);for(i=1;i<8;i++)poly([[cx0,cy0+i*.5,L.z],[cx0+2.2,cy0+i*.5,L.z]],C.p2,1,tS+400+k*250+i*40,160);rect(cx0+2.6,cy0+.4,cx1-.3,cy1-.4,L.z,C.l1,1,tS+600+k*250,300);});
    for(i=0;i<4;i++){var ex=[cx0,cx1,cx0,cx1][i],ey=[cy0,cy0,cy1,cy1][i];var zt=0;for(k=n-1;k>0;k--)if(inside(M.levels[k],ex,ey)){zt=M.levels[k].z;break;}if(zt)poly([[ex,ey,0],[ex,ey,zt]],C.l1,1,tS+1000+i*120,700);}
  }
  var dy=-BD/2-2.2;poly([[-BW/2,dy,0],[BW/2,dy,0]],C.l1,1,tS+400,900);for(i=0;i<=nx;i+=2){x=-BW/2+i*BW/nx;poly([[x-.35,dy+.35,0],[x+.35,dy-.35,0]],C.l2,1,tS+600+i*70,160);}
  var dx=BW/2+2.2;poly([[dx,-BD/2,0],[dx,BD/2,0]],C.l1,1,tS+700,900);for(j=0;j<=ny;j+=2){y=-BD/2+j*BD/ny;poly([[dx-.35,y+.35,0],[dx+.35,y-.35,0]],C.l2,1,tS+900+j*90,160);}
  ring(BW/2+3.6,BD/2+3.2,0,1.1,C.l2,1,tS+1000,400);poly([[BW/2+3.6,BD/2+2.1,0],[BW/2+3.6,BD/2+4.3,0]],C.l2,1,tS+1300,200);
  poly([[-BW/2-4.6,BD/2+2.6,0],[-BW/2-4.6,BD/2+5.2,0],[-BW/2-5.2,BD/2+4.4,0]],C.dark,1,tS+1400,500,.6);
  var pl=[];for(i=0;i<=40;i++){var u=i/40;pl.push([-BW/2-6+(BW+12)*u,(i%2?BD/2+6.3:BD/2+6),0]);}poly(pl,C.l1,1,tS,2000,.7);
  if(M.pool){var px0=BW/2+2,py0=-BD/2+1,px1=BW/2+9,py1=-BD/2+5;rect(px0,py0,px1,py1,0,C.rule,1,tS+800,800);for(i=1;i<5;i++){var wp=[];for(j=0;j<=16;j++){wp.push([px0+.4+(px1-px0-.8)*j/16,py0+i*.8+(j%2?.12:-.12),0]);}poly(wp,C.wash,1,tS+1200+i*120,500,.8);}rect(px0+.5,py1+.8,px0+3.2,py1+2.4,0,C.l1,1,tS+1800,400);fan(px0+1.8,py1+1.6,0,.5,tS+2100);rect(-BW/2-6.5,-BD/2+2,-BW/2-.5,-BD/2+6,0,C.rule,1,tS+1500,700);poly([[-BW/2-6.5,-BD/2+4,0],[-BW/2-.5,-BD/2+4,0]],C.p2,1,tS+2000,300);}
  if(M.kitchen){var kx0=L0.x1-7,ky0=L0.y0+.5,kx1=L0.x1-.5,ky1=L0.y0+5;rect(kx0,ky0,kx1,ky1,0,C.rule,1,tS+800,700);hatch(kx0+.3,ky0+.3,kx1-.3,ky1-.3,0,tS+1300);rect(kx0+1,ky0+1,kx1-1,ky0+2.2,0,C.l1,1,tS+1600,400);}
  NKEEP=els.length;
  if(warm){for(i=0;i<NKEEP;i++){els[i].t0=-1;els[i].d=1;}plates.forEach(function(p){p.t=-1e9;});t=300;}else t=tS+2600;
  var T0=t;
  /* ---- which plate carries which system ---- */
  var LE=M.levels[0],LM=M.levels[n>2?Math.round((n-1)*.4):n-1],LP=M.levels[n>2?Math.round((n-1)*.75):0],LF=M.levels[n-1];
  /* ---- electrical: panel, home runs, outlets, partitions, lighting, fire alarm ---- */
  var z0=LE.z,ex0=LE.x0,ey0=LE.y0,ex1=LE.x1,ey1=LE.y1;
  var px=ex0+2.2,py=ey1-2.2;rect(px-.9,py-.5,px+.9,py+.5,z0,ac('elec')||C.rule,1.1,t,500,aa('elec'));poly([[px-.9,py,z0],[px+.9,py,z0]],C.l1,1,t+300,200);
  var no=Math.round((ex1-ex0)/3*dens);for(i=0;i<no;i++){var ox=ex0+3+i*((ex1-ex0-5)/Math.max(1,no-1))+rnd()*1.2,oy=ey0+2+rnd()*(ey1-ey0-4);if(!inside(LE,ox,oy))continue;var mid=[ox,py-1-rnd()*2,z0];poly([[px,py-.5,z0],mid,[ox,oy,z0]],ac('elec')||C.l1,1,t+500+i*200,700,aa('elec'));outlet(ox,oy,z0,t+900+i*200,ac('elec'),aa('elec'));}
  var wy=ey0+(ey1-ey0)*.45+rnd()*2;poly([[ex0,wy,z0],[ex0+(ex1-ex0)*.4,wy,z0]],C.rule,1,t+600,700);poly([[ex0+(ex1-ex0)*.4,wy,z0],[ex0+(ex1-ex0)*.4,ey1,z0]],C.rule,1,t+1200,500);
  if(!M.kitchen){var rx=ex1-(ex1-ex0)*.3;if(inside(LE,ex1,wy+1)){poly([[rx,ey0,z0],[rx,wy+1,z0],[ex1,wy+1,z0]],C.rule,1,t+1500,800);hatch(rx+.4,ey0+.4,ex1-.4,wy+.6,z0,t+2200);}}
  for(i=0;i<Math.round(3*dens);i++)for(j=0;j<2;j++){x=ex0+2.6+i*2.6;y=wy+2+j*2.4;if(inside(LE,x,y))fixture(x,y,z0,t+1800+(i*2+j)*120);}
  var fx=ex0+1.4,fy=ey0+1.4;rect(fx-.5,fy-.4,fx+.5,fy+.4,z0,C.rule,1,t+2600,300);for(i=0;i<Math.round(4*dens);i++){x=ex0+5+i*(ex1-ex0-6)/3;y=ey0+1.2;poly([[fx+.5,fy,z0],[x,fy,z0],[x,y,z0]],C.p2,1,t+2800+i*180,500);tri(x,y,z0,t+3100+i*180,ac('fp'),aa('fp'));}
  tag(px,py,z0,-2.2,1.6,t+2000,C.dark);
  t+=3300;
  /* ---- mechanical: trunk, return, VAV boxes, diffusers, unit, exhaust ---- */
  var z1=LM.z,mx0=LM.x0,my0=LM.y0,mx1=LM.x1,my1=LM.y1;
  var ty=my0+(my1-my0)*.4+rnd()*2,hw=.55,mc=ac('mech'),ma=aa('mech');
  poly([[mx0+1.5,ty-hw,z1],[mx1-1.5,ty-hw,z1]],mc||C.rule,1.1,t,1500,ma);poly([[mx0+1.5,ty+hw,z1],[mx1-1.5,ty+hw,z1]],mc||C.rule,1.1,t+120,1500,ma);poly([[mx0+1.5,ty-hw,z1],[mx0+1.5,ty+hw,z1]],mc||C.rule,1,t,200,ma);
  var nb=Math.max(2,Math.round((mx1-mx0)/4*dens));
  for(i=0;i<nb;i++){x=mx0+3.5+i*((mx1-mx0-7)/Math.max(1,nb-1))+rnd()*.6;var up=i%2===0?1:-1,by=ty+up*(hw+2.2+rnd()*1.6);if(!inside(LM,x,by))continue;
    poly([[x-.3,ty+up*hw,z1],[x-.3,by,z1]],C.l1,1,t+900+i*220,520);poly([[x+.3,ty+up*hw,z1],[x+.3,by,z1]],C.l1,1,t+960+i*220,520);
    rect(x-.7,ty+up*(hw+.9),x+.7,ty+up*(hw+1.7),z1,mc||C.rule,1,t+1200+i*220,400,ma);diffuser(x,by+up*.8,z1,t+1500+i*220,mc,ma);
    if(inside(LM,x+3.1,by+.6)&&i%2===0){poly([[x+.3,by+.6,z1],[x+2.4,by+.6,z1]],C.l1,1,t+1700+i*220,300);diffuser(x+3.1,by+.6,z1,t+1900+i*220);}
    if(i===1)tag(x,by+up*.8,z1,2.4,up*1.4,t+2400,C.dark);}
  var ry=ty+(ty>(my0+my1)/2?-4:4);if(ry>my0+1&&ry<my1-1)dashed([mx0+2,ry],[mx1-4,ry],z1,t+1600,1600,C.l1,.8);
  var ax=mx1-3.2;rect(ax,ty-1.6,ax+2.6,ty+1.6,z1,mc||C.rule,1.15,t+1700,700,ma);poly([[ax+1.3,ty,z1],[ax+1.3,ty,top.z]],C.l1,1,t+2300,500);fan(ax+1.3,ty,z1,.7,t+2200);
  if(M.kitchen){var hx=L0.x1-3.7;rect(hx-1.8,L0.y0+1.2,hx+1.8,L0.y0+2.4,z1,mc||C.rule,1.1,t+2500,500,ma);poly([[hx,L0.y0+1.8,z1],[hx,L0.y0+1.8,top.z+1.6]],C.rule,1,t+2900,500);rect(hx-.5,L0.y0+1.3,hx+.5,L0.y0+2.3,top.z+1.6,C.rule,1,t+3300,200);}
  else if(M.core){poly([[cx1+.4,cy1-.5,z1],[cx1+.4,cy1-.5,top.z+1.2]],C.l1,1,t+2600,500);rect(cx1+.1,cy1-.8,cx1+.7,cy1-.2,top.z+1.2,C.rule,1,t+3100,200);}
  ring(mx0+(mx1-mx0)*.3,wy+1.1,z1,.3,C.l2,1,t+2900,200);
  t+=3300;
  /* ---- plumbing: mains, joints, valves, risers, branches per floor, hangers ---- */
  var z2=LP.z,qx0=LP.x0,qy0=LP.y0,qx1=LP.x1,qy1=LP.y1,pc=ac('plumb'),pa=aa('plumb');
  var my=qy1-2.5;poly([[qx0+1,my,z2],[qx1-1,my,z2]],pc||C.wash,1.2,t,1300,pa);poly([[qx0+1,my+.5,z2],[qx1-1,my+.5,z2]],pc||C.wash,1,t+100,1300,pa?pa*.7:.7);
  var np=Math.max(2,Math.round((qx1-qx0)/3.3*dens));for(i=0;i<np;i++){x=qx0+2.5+i*((qx1-qx0-5)/Math.max(1,np-1))+rnd()*.6;ring(x,my,z2,.22,pc||C.wash,1,t+400+i*160,220,pa);var ln=2+rnd()*((my-qy0)*.6);if(inside(LP,x,my-ln))poly([[x,my,z2],[x,my-ln,z2]],pc||C.wash,1,t+500+i*160,520,pa);if(i%3===1)valve(x,my-1.6,z2,t+900+i*160,pc,pa);}
  var nr=Math.min(3,Math.max(1,Math.round((qx1-qx0)/8)));for(i=0;i<nr;i++){x=qx0+4+i*((qx1-qx0-8)/Math.max(1,nr-1));y=qy1-1.2;var zt2=0;for(k=n-1;k>0;k--)if(inside(M.levels[k],x,y)){zt2=M.levels[k].z;break;}if(!zt2)continue;poly([[x,y,0],[x,y,zt2]],pc||C.wash,1.1,t+900+i*300,900,pa);ring(x,y,0,.35,C.l2,1,t+900+i*300,200);ring(x,y,zt2,.35,C.l2,1,t+1700+i*300,200);
    if(n>3){for(k=1;k<n-1;k++){var Lk=M.levels[k];if(inside(Lk,x,y)&&inside(Lk,x-2.4,y-2.4)){poly([[x,y,Lk.z],[x-2.4,y,Lk.z],[x-2.4,y-2.4,Lk.z]],pc||C.wash,1,t+1200+i*300+k*150,400,pa);ring(x-2.4,y-2.4,Lk.z,.2,C.l2,1,t+1500+i*300+k*150,150);}}}}
  for(i=0;i<Math.round(5*dens);i++){x=qx0+3+i*((qx1-qx0-6)/4);poly([[x,my,z2],[x,my,z2+.9]],C.l1,1,t+2000+i*120,200);poly([[x-.3,my,z2+.9],[x+.3,my,z2+.9]],C.l1,1,t+2150+i*120,120);}
  tag(qx0+4,qy1-1.2,z2,-2.4,-1.6,t+2300,C.dark);
  t+=2600;
  /* ---- fire protection: sprinkler loop, branch lines on the accent page, heads ---- */
  var z3=LF.z,fx0=LF.x0,fy0=LF.y0,fx1=LF.x1,fy1=LF.y1,fc=ac('fp'),fa=aa('fp');
  var sx0=fx0+2.5,sy0=fy0+1.8,sx1=fx1-2.5,sy1=fy1-4.5;if(sy1-sy0<3){sy1=fy1-1.5;}
  if(!LF.notch)rect(sx0,sy0,sx1,sy1,z3,fc||C.wash,1,t,1400,fa||.8);else{poly([[sx0,sy0,z3],[sx1,sy0,z3]],fc||C.wash,1,t,900,fa||.8);poly([[sx0,sy0,z3],[sx0,sy1,z3]],fc||C.wash,1,t+300,700,fa||.8);}
  var hx_=Math.max(2,Math.round((sx1-sx0)/4.3*dens)),hy_=Math.max(1,Math.round((sy1-sy0)/3.2));
  for(i=0;i<hx_;i++)for(j=0;j<hy_;j++){x=sx0+.9+i*((sx1-sx0-1.8)/Math.max(1,hx_-1))+rnd()*.4;y=sy0+.8+j*((sy1-sy0-1.6)/Math.max(1,hy_-1))+rnd()*.4;if(inside(LF,x,y))head(x,y,z3,t+400+(i*hy_+j)*100,fc,fa);}
  if(acc==='fp'){for(i=0;i<hx_;i++){x=sx0+.9+i*((sx1-sx0-1.8)/Math.max(1,hx_-1));poly([[x,sy0,z3],[x,sy1,z3]],C.wash,1,t+300+i*120,700);}}
  t+=2200;
  /* ---- roof: units, condensers, revision cloud, detail callout. test points on the commissioning model ---- */
  var zr=top.z,tx0=top.x0,ty0=top.y0,tx1=top.x1;
  if(M.roof){if(M.bigroof){for(i=0;i<3;i++){box3(tx0+3+i*8,ty0+1,tx0+9+i*8,ty0+4.2,zr,1.3,C.rule,t+i*400);fan(tx0+6+i*8,ty0+2.6,zr+1.3,.8,t+900+i*400);}}
    else{box3(tx0+3,ty0+1,tx0+7.5,ty0+3.6,zr,1.1,C.rule,t);for(i=0;i<Math.round(3*dens);i++){if(tx1-5-i*2.6<tx0+8)break;fan(tx1-4-i*2.6,ty0+2.2,zr+.5,.85,t+1100+i*300);rect(tx1-5-i*2.6,ty0+1.2,tx1-3-i*2.6,ty0+3.2,zr,C.l1,1,t+1000+i*300,400);}}
    cloud(tx0+2.3,ty0+.3,tx0+8.2,ty0+4.3,zr+1.1,t+2000);
    ring(tx1+1.5,ty0-1.5,zr+1.1,1.3,C.l2,1,t+2600,500);poly([[tx1+.2,ty0-1.5,zr+1.1],[tx1+2.8,ty0-1.5,zr+1.1]],C.l2,1,t+3000,200);poly([[tx1-3.2,ty0+2.2,zr+.5],[tx1+.4,ty0-.9,zr+1.1]],C.l2,1,t+2900,500,.5);}
  if(M.tests){M.levels.forEach(function(L,k){for(i=0;i<3;i++){x=L.x0+3+i*((L.x1-L.x0-6)/2);y=L.y0+2+rnd()*(L.y1-L.y0-4);ring(x,y,L.z,.5,C.dark,1,t+300+(k*3+i)*160,300,.45);poly([[x-.25,y,L.z],[x,y+.25,L.z],[x+.35,y-.3,L.z]],C.dark,1,t+600+(k*3+i)*160,200,.6);}});}
  BUILD=t+3600;CYCLE=BUILD+HOLD+DISS;
  if(!warm)plates.forEach(function(p){flashes.push({p:p.p,t:p.t,col:C.lite});});
  for(i=0;i<8;i++)flashes.push({p:plates[Math.floor(rnd()*plates.length)].p,t:T0+1800+i*((BUILD+HOLD-T0)/8)+rnd()*600,col:i%2?C.lite:C.dark});
}

/* projection: a slow turn about the vertical axis, a fixed tilt, a little perspective */
var W=0,H=0,DPR=1,S=1,CX=0,CY=0;
function size(){var r=cv.getBoundingClientRect();W=r.width;H=r.height;DPR=Math.min(2,window.devicePixelRatio||1);cv.width=Math.round(W*DPR);cv.height=Math.round(H*DPR);ctx.setTransform(DPR,0,0,DPR,0,0);
  var ext=Math.max(BW,BD)+16;S=Math.min(W*0.82/ext,H*1.3/(BD*0.6+ZT*0.82+8));S=Math.max(S,W*0.6/ext);if(H>W)S=W*1.1/ext;CX=W*0.5;CY=H*0.55;}
function project(ang,el){var cs=Math.cos(ang),sn=Math.sin(ang),se=Math.sin(el),ce=Math.cos(el);
  return function(p){var x=p[0]*cs-p[1]*sn,y=p[0]*sn+p[1]*cs,z=p[2]-ZT*0.45;var d=y*ce+z*se;var k=1/(1+d*0.006);return [CX+x*S*k,CY+(y*se-z*ce)*S*k];};}

function drawPath(pts,f){var L=0,i,seg=[];for(i=1;i<pts.length;i++){var dx=pts[i][0]-pts[i-1][0],dy=pts[i][1]-pts[i-1][1];var l=Math.sqrt(dx*dx+dy*dy);seg.push(l);L+=l;}
  var want=L*f,acc=0;ctx.beginPath();ctx.moveTo(pts[0][0],pts[0][1]);
  for(i=1;i<pts.length;i++){if(acc+seg[i-1]<=want){ctx.lineTo(pts[i][0],pts[i][1]);acc+=seg[i-1];}else{var r=seg[i-1]?(want-acc)/seg[i-1]:0;var ex=pts[i-1][0]+(pts[i][0]-pts[i-1][0])*r,ey=pts[i-1][1]+(pts[i][1]-pts[i-1][1])*r;ctx.lineTo(ex,ey);return [ex,ey];}}
  return null;}

var cyc=0;
function frame(t){var n=Math.floor(t/CYCLE);if(n!==cyc){cyc=n;seed=(seed*7+13)%2147483647;build(true);}var tc=t-n*CYCLE;
  var ang=M.ang+t*(Math.PI*2/M.spin),el=0.6+0.05*Math.sin(t/7000);var pr=project(ang,el);
  ctx.clearRect(0,0,W,H);ctx.lineCap='round';ctx.lineJoin='round';
  var gdiss=tc>BUILD+HOLD?(tc-BUILD-HOLD)/DISS:0;var cursor=null,cursorT=-1;
  flashes.forEach(function(fl){var dt=tc-fl.t;if(dt<0||dt>900)return;var a=dt<90?dt/90:1-(dt-90)/810;var q=fl.p.map(pr);
    ctx.beginPath();q.forEach(function(p,i){i?ctx.lineTo(p[0],p[1]):ctx.moveTo(p[0],p[1]);});ctx.closePath();ctx.fillStyle=rgba(fl.col,0.09*a);ctx.fill();
    var y0=Math.min.apply(null,q.map(function(p){return p[1];})),y1=Math.max.apply(null,q.map(function(p){return p[1];})),x0=Math.min.apply(null,q.map(function(p){return p[0];})),x1=Math.max.apply(null,q.map(function(p){return p[0];}));
    var sy=y0+(y1-y0)*Math.min(1,dt/520);ctx.save();ctx.beginPath();q.forEach(function(p,i){i?ctx.lineTo(p[0],p[1]):ctx.moveTo(p[0],p[1]);});ctx.closePath();ctx.clip();
    ctx.strokeStyle=rgba(fl.col,0.35*a);ctx.lineWidth=1;ctx.beginPath();ctx.moveTo(x0,sy);ctx.lineTo(x1,sy);ctx.stroke();ctx.restore();});
  for(var i=0;i<els.length;i++){var e=els[i];var f=ease((tc-e.t0)/e.d);if(f<=0)continue;
    var a=e.a;if(gdiss&&i>=NKEEP){a*=1-ease(gdiss*1.6-(e.t0/BUILD)*0.6);if(a<=0)continue;}
    ctx.strokeStyle=rgba(e.c,a);ctx.lineWidth=e.w;var q=e.p.map(pr);var end=drawPath(q,f);ctx.stroke();
    if(f<1&&e.t0>cursorT){cursorT=e.t0;cursor=end||q[q.length-1];}}
  if(cursor&&!gdiss){ctx.strokeStyle=rgba(C.dark,0.45);ctx.lineWidth=1;ctx.beginPath();ctx.moveTo(cursor[0]-14,cursor[1]);ctx.lineTo(cursor[0]-4,cursor[1]);ctx.moveTo(cursor[0]+4,cursor[1]);ctx.lineTo(cursor[0]+14,cursor[1]);ctx.moveTo(cursor[0],cursor[1]-14);ctx.lineTo(cursor[0],cursor[1]-4);ctx.moveTo(cursor[0],cursor[1]+4);ctx.lineTo(cursor[0],cursor[1]+14);ctx.stroke();ctx.strokeRect(cursor[0]-3,cursor[1]-3,6,6);}
}

seed=M.seed;build(false);size();var WARM=4600;
if(reduce){frame(BUILD+200);window.addEventListener('resize',function(){size();frame(BUILD+200);});return;}
var running=false,raf=0,start=0,visible=true;
function loop(now){if(!running)return;if(!start)start=now;frame(now-start+WARM);raf=requestAnimationFrame(loop);}
function go(){if(running||!visible||document.hidden)return;running=true;raf=requestAnimationFrame(loop);}
function stop(){running=false;cancelAnimationFrame(raf);}
new IntersectionObserver(function(es){visible=es[0].isIntersecting;visible?go():stop();},{threshold:0.02}).observe(cv);
document.addEventListener('visibilitychange',function(){document.hidden?stop():go();});
var rt;window.addEventListener('resize',function(){clearTimeout(rt);rt=setTimeout(size,80);});
go();
})();
