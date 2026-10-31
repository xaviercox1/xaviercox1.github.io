// The approved ring cursor, with rendering suspended while idle or off-screen.
(() => {
  const dot=document.querySelector('.cursor-dot');
  if(!dot)return;
  const mode=matchMedia('(any-hover: hover) and (any-pointer: fine)');
  let x=innerWidth/2,y=innerHeight/2,lastX=x,lastY=y,lastActivity=0;
  let enabled=mode.matches,visible=false,pressed=false,scale=1,frame=0,lastTime=performance.now();
  function render(now){
    frame=0;
    if(!enabled||!visible||document.hidden)return;
    const dt=Math.min((now-lastTime)/1000,.05);lastTime=now;
    const target=pressed?1.6:1;scale+=(target-scale)*(1-Math.exp(-13*dt));
    const elapsed=now-lastActivity;
    const progress=pressed?0:Math.max(0,Math.min(1,(elapsed-1050)/450));
    const amount=1-Math.pow(progress,1.85),opacity=1-Math.pow(progress,.92);
    dot.style.setProperty('--cursor-scale',(scale*amount).toFixed(4));dot.style.opacity=opacity.toFixed(4);
    if(progress<1)frame=requestAnimationFrame(render);
  }
  function wake(){if(!frame&&enabled&&visible&&!document.hidden){lastTime=performance.now();frame=requestAnimationFrame(render);}}
  function hide(){visible=false;pressed=false;cancelAnimationFrame(frame);frame=0;dot.style.opacity='0';dot.classList.remove('is-visible','cursor-dot--link');scale=1;}
  function move(event){
    if(!enabled||event.pointerType==='touch')return;
    x=event.clientX;y=event.clientY;dot.style.left=`${x}px`;dot.style.top=`${y}px`;
    if(!visible||Math.hypot(x-lastX,y-lastY)>=1.5){lastActivity=performance.now();lastX=x;lastY=y;}
    visible=true;dot.classList.add('is-visible');wake();
  }
  mode.addEventListener('change',event=>{enabled=event.matches;document.documentElement.classList.toggle('has-custom-cursor',enabled);if(!enabled)hide();});
  document.documentElement.classList.toggle('has-custom-cursor',enabled);
  window.addEventListener('pointermove',move,{passive:true});
  document.addEventListener('pointerdown',event=>{if(!enabled||event.pointerType==='touch')return;pressed=true;dot.classList.toggle('cursor-dot--link',event.button===0);lastActivity=performance.now();move(event);});
  document.addEventListener('pointerup',event=>{if(!enabled||event.pointerType==='touch')return;pressed=false;dot.classList.remove('cursor-dot--link');lastActivity=performance.now();move(event);});
  document.addEventListener('mouseleave',hide);window.addEventListener('blur',hide);
  document.addEventListener('visibilitychange',()=>{if(document.hidden)hide();});
})();
