const motionQuery=matchMedia('(prefers-reduced-motion: reduce)');
const reducedMotion=motionQuery.matches;
const cursor=document.querySelector('.cursor');

if(!reducedMotion&&matchMedia('(pointer:fine)').matches){
  addEventListener('pointermove',event=>{
    cursor.style.left=event.clientX+'px';
    cursor.style.top=event.clientY+'px';
  });
  document.querySelectorAll('a').forEach(link=>{
    link.addEventListener('mouseenter',()=>cursor.classList.add('active'));
    link.addEventListener('mouseleave',()=>cursor.classList.remove('active'));
  });
}

const revealElements=document.querySelectorAll('.reveal');
if(reducedMotion){
  revealElements.forEach(element=>element.classList.add('visible'));
}else{
  const revealObserver=new IntersectionObserver(entries=>entries.forEach(entry=>{
    if(entry.isIntersecting){
      entry.target.classList.add('visible');
      revealObserver.unobserve(entry.target);
    }
  }),{threshold:.12});
  revealElements.forEach(element=>revealObserver.observe(element));
}

const canvas=document.querySelector('#field');
const context=canvas.getContext('2d');
let dots=[];
let mouseX=.5;
let mouseY=.5;

function sizeCanvas(){
  const density=Math.min(devicePixelRatio,2);
  const bounds=canvas.getBoundingClientRect();
  canvas.width=bounds.width*density;
  canvas.height=bounds.height*density;
  context.setTransform(density,0,0,density,0,0);
  dots=Array.from({length:170},()=>({x:Math.random()*bounds.width,y:Math.random()*bounds.height,z:.2+Math.random()*.9,phase:Math.random()*6.28}));
}

function drawField(time=0){
  const width=canvas.clientWidth;
  const height=canvas.clientHeight;
  context.clearRect(0,0,width,height);
  for(const dot of dots){
    const wave=reducedMotion?0:Math.sin(dot.x*.012+time*.0003+dot.phase)*55*dot.z;
    const x=dot.x+(reducedMotion?0:(mouseX-.5)*35*dot.z);
    const y=dot.y+wave+(reducedMotion?0:(mouseY-.5)*25*dot.z);
    context.fillStyle='rgba(239,243,235,'+(.12+dot.z*.5)+')';
    context.fillRect(x,y,1.2*dot.z,1.2*dot.z);
  }
  if(!reducedMotion)requestAnimationFrame(drawField);
}

sizeCanvas();
addEventListener('resize',()=>{sizeCanvas();if(reducedMotion)drawField();});
if(!reducedMotion)addEventListener('pointermove',event=>{mouseX=event.clientX/innerWidth;mouseY=event.clientY/innerHeight;});
if(reducedMotion)drawField();else requestAnimationFrame(drawField);
