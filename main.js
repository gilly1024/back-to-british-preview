'use strict';
const menuButton=document.querySelector('.menu-button');
const nav=document.querySelector('.main-nav');
if(menuButton&&nav){
  const close=(restoreFocus=false)=>{
    nav.classList.remove('is-open');
    menuButton.setAttribute('aria-expanded','false');
    menuButton.setAttribute('aria-label','Open navigation');
    if(restoreFocus)menuButton.focus();
  };
  menuButton.addEventListener('click',()=>{
    const next=menuButton.getAttribute('aria-expanded')!=='true';
    nav.classList.toggle('is-open',next);
    menuButton.setAttribute('aria-expanded',String(next));
    menuButton.setAttribute('aria-label',next?'Close navigation':'Open navigation');
  });
  nav.addEventListener('click',e=>{if(e.target.closest('a'))close();});
  document.addEventListener('keydown',e=>{
    if(e.key==='Escape'&&menuButton.getAttribute('aria-expanded')==='true')close(true);
  });
  document.addEventListener('click',e=>{if(!nav.contains(e.target)&&!menuButton.contains(e.target))close();});
  const mobileLayout=window.matchMedia('(max-width:960px)');
  // A breakpoint can hide the focused link before the media-query handler runs.
  nav.addEventListener('focusout',event=>{
    if(!event.relatedTarget&&mobileLayout.matches&&nav.getClientRects().length===0&&menuButton.getClientRects().length>0)menuButton.focus();
  });
  mobileLayout.addEventListener('change',()=>close(mobileLayout.matches&&nav.contains(document.activeElement)));
}
const filters=[...document.querySelectorAll('[data-filter]')];
const cards=[...document.querySelectorAll('[data-range]')];
if(filters.length&&cards.length){
 const params=new URLSearchParams(location.search);
 const initial=params.get('audience');
 const valid=new Set(['all','men','women','kids','accessories']);
 function applyFilter(category){
   const value=valid.has(category)?category:'all';
   filters.forEach(btn=>btn.setAttribute('aria-pressed',String(btn.dataset.filter===value)));
   let shown=0;
   for(const card of cards){
     const visible=value==='all'||card.dataset.audiences.split(' ').includes(value);
     card.hidden=!visible;if(visible)shown++;
   }
   const msg=document.getElementById('filter-empty');
   if(msg)msg.hidden=shown>0;
 }
 filters.forEach(btn=>btn.addEventListener('click',()=>{
  const audience=btn.dataset.filter;
  applyFilter(audience);
  const u=new URL(location.href);
  if(audience==='all')u.searchParams.delete('audience');
  else u.searchParams.set('audience',audience);
  history.replaceState(null,'',u);
 }));
 applyFilter(initial||'all');
 const range=params.get('range');
 if(range){
   const match=cards.find(c=>c.dataset.range===range);
   if(match)match.scrollIntoView({behavior:'instant',block:'center'});
 }
}
const form=document.querySelector('form[name="btb-heritage-contact"]');
if(form&&form.dataset.preview==='true'){
 form.addEventListener('submit',event=>{
   event.preventDefault();
   const note=form.querySelector('.local-preview-message')||document.createElement('p');
   note.className='local-preview-message';
   note.setAttribute('role','status');
   note.textContent='Pre-launch preview: no message was sent. Contact messages will be enabled only after the website and its form provider are approved for launch.';
   form.append(note);
 });
 form.querySelector('button[type="submit"]').disabled=false;
}

/* Cinematic homepage: controllable, viewport-aware motion with accessible fallbacks. */
const campaignFilms=[...document.querySelectorAll('[data-campaign-video]')];
const motionControl=document.querySelector('[data-motion-toggle]');
if(campaignFilms.length&&motionControl){
  const reduceMotion=window.matchMedia('(prefers-reduced-motion: reduce)');
  let pausedByUser=reduceMotion.matches;
  let inView=true;
  const syncCampaign=()=>{
    const active=!pausedByUser&&!reduceMotion.matches&&inView&&!document.hidden;
    for(const film of campaignFilms){
      if(active){
        const start=film.play();
        if(start&&typeof start.catch==='function') start.catch(()=>{/* poster fallback */});
      }else{
        film.pause();
      }
    }
    document.body.classList.toggle('campaign-is-paused',!active);
    motionControl.setAttribute('aria-pressed',String(active));
    motionControl.innerHTML=active?'PAUSE FILM <span aria-hidden="true">Ⅱ</span>':'PLAY FILM <span aria-hidden="true">▶</span>';
  };
  motionControl.addEventListener('click',()=>{pausedByUser=!pausedByUser;syncCampaign();});
  reduceMotion.addEventListener('change',()=>{if(reduceMotion.matches)pausedByUser=true;syncCampaign();});
  document.addEventListener('visibilitychange',syncCampaign);
  if('IntersectionObserver' in window){
    const hero=document.querySelector('.cinematic-hero');
    const observer=new IntersectionObserver(([entry])=>{inView=entry.isIntersecting;syncCampaign();},{threshold:0.08});
    if(hero)observer.observe(hero);
  }
  syncCampaign();
}
