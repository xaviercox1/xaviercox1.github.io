(() => {
  const feed = document.querySelector('#blog-feed');
  const panel = document.querySelector('#blog-controls');
  const panelToggle = document.querySelector('#blog-layout-toggle');
  const tuningEnabled = new URLSearchParams(location.search).get('edit')==='1';
  panelToggle.hidden = !tuningEnabled;panel.hidden = !tuningEnabled;panelToggle.setAttribute('aria-expanded',String(tuningEnabled));
  const output = document.querySelector('#blog-settings-values');
  const status = document.querySelector('#blog-settings-status');
  const reducedMotion = matchMedia('(prefers-reduced-motion: reduce)');
  const parameters = [
    {key:'contentWidthPercent',label:'Content width (%)',min:35,max:100,step:1,value:72,css:'--blog-width',unit:'%'},
    {key:'columns',label:'Images per day (columns)',min:1,max:5,step:1,value:2,css:'--blog-columns',unit:''},
    {key:'mediaGapPx',label:'Gap between entries (px)',min:0,max:60,step:1,value:16,css:'--blog-media-gap',unit:'px'},
    {key:'dayGapPx',label:'Gap between days (px)',min:16,max:220,step:1,value:96,css:'--blog-day-gap',unit:'px'},
    {key:'topPaddingPx',label:'Space above journal (px)',min:48,max:240,step:1,value:90,css:'--blog-top',unit:'px'},
    {key:'cornerRadiusPx',label:'Corner radius (px)',min:0,max:40,step:1,value:5,css:'--blog-radius',unit:'px'},
    {key:'dateSizePx',label:'Date size (px)',min:9,max:24,step:1,value:12,css:'--blog-date-size',unit:'px'},
    {key:'textSizePx',label:'Optional text size (px)',min:11,max:24,step:1,value:14,css:'--blog-text-size',unit:'px'},
  ];
  const defaults = {...Object.fromEntries(parameters.map(p=>[p.key,p.value])),newestFirst:true};
  const settings = {...defaults};
  const settingsKey = 'xavier-blog-layout-v1',draftKey = 'xavier-blog-draft-v1';
  const draft = {entries:{},dayTitles:{}};
  const clamp = (v,min,max)=>Math.min(max,Math.max(min,v));
  try {
    const saved = JSON.parse(localStorage.getItem(settingsKey));
    parameters.forEach(p=>{if(Number.isFinite(saved?.[p.key])) settings[p.key]=clamp(Math.round(saved[p.key]),p.min,p.max);});
    if(typeof saved?.newestFirst==='boolean') settings.newestFirst=saved.newestFirst;
    const text = JSON.parse(localStorage.getItem(draftKey));
    window.blogEntries.forEach(entry=>{
      const e=text?.entries?.[entry.id];
      if(e) draft.entries[entry.id]={title:typeof e.title==='string'?e.title.slice(0,200):'',text:typeof e.text==='string'?e.text.slice(0,20000):''};
    });
    [...new Set(window.blogEntries.map(e=>e.date))].forEach(date=>{if(typeof text?.dayTitles?.[date]==='string') draft.dayTitles[date]=text.dayTitles[date].slice(0,200);});
  } catch { /* Storage is optional; the media and controls still work. */ }
  window.blogEntries.forEach(entry=>{draft.entries[entry.id] ||= {title:entry.title||'',text:entry.text||''};});
  const dates = [...new Set(window.blogEntries.map(entry=>entry.date))].sort();
  const formatDate = date=>date.split('-').reverse().join('/');
  function saveDraft() {
    try { localStorage.setItem(draftKey,JSON.stringify(draft)); }
    catch { status.textContent='Browser storage unavailable. Export your draft to keep it.'; }
  }
  function editorField(label,placeholder,multiline=false) {
    const input=document.createElement(multiline?'textarea':'input');
    if(!multiline) input.type='text';
    input.placeholder=placeholder; input.setAttribute('aria-label',label); input.maxLength=multiline?20000:200;
    return input;
  }
  const pagePositions = new Map(), pdfViews = new Map();
  let dayObserver;
  const imageObserver = 'IntersectionObserver' in window ? new IntersectionObserver(items=>{
    items.forEach(item=>{if(item.isIntersecting){const image=item.target;if(image.dataset.src){image.src=image.dataset.src;delete image.dataset.src;}imageObserver.unobserve(image);}});
  },{rootMargin:'600px 0px'}) : null;
  const videoObserver = 'IntersectionObserver' in window ? new IntersectionObserver(items=>{
    items.forEach(item=>{if(!item.isIntersecting)item.target.pause();});
  }) : null;
  function queueImage(image,src,immediate=false) {
    if(imageObserver&&!immediate){image.dataset.src=src;imageObserver.observe(image);}
    else {imageObserver?.unobserve(image);delete image.dataset.src;image.src=src;}
  }
  function makeImage(entry,src) {
    const image=document.createElement('img');image.alt='';image.loading='lazy';image.decoding='async';image.width=entry.width;image.height=entry.height;queueImage(image,src);return image;
  }
  function arrowButton(direction,label) {
    const button=document.createElement('button');button.type='button';button.setAttribute('aria-label',label);
    const icon=document.createElementNS('http://www.w3.org/2000/svg','svg');icon.setAttribute('viewBox','0 0 24 18');icon.setAttribute('aria-hidden','true');
    const path=document.createElementNS('http://www.w3.org/2000/svg','path');path.setAttribute('d',direction==='previous'?'M22 9H3m6-6L3 9l6 6':'M2 9h19m-6-6 6 6-6 6');icon.append(path);button.append(icon);return button;
  }
  function setPdfPage(entry,index) {
    pagePositions.set(entry.id,clamp(index,0,entry.pages.length-1));
    pdfViews.get(entry.id)?.forEach(view=>view.update(true));
  }
  function createPdf(entry,inViewer=false) {
    const wrapper=document.createElement('div');wrapper.className='blog-pdf';
    const page=document.createElement(inViewer?'div':'button');page.className=inViewer?'blog-pdf-page':'blog-media-open';
    if(!inViewer){page.type='button';page.addEventListener('click',()=>openEntry(entry));}
    const image=document.createElement('img');image.decoding='async';image.width=entry.width;image.height=entry.height;
    image.addEventListener('load',()=>{image.width=image.naturalWidth;image.height=image.naturalHeight;});page.append(image);
    const controls=document.createElement('div');controls.className='blog-pdf-controls';
    const previous=arrowButton('previous',inViewer?'Previous page':`Previous PDF page from ${formatDate(entry.date)}`);
    const next=arrowButton('next',inViewer?'Next page':`Next PDF page from ${formatDate(entry.date)}`);
    const count=document.createElement('span');count.setAttribute('aria-live','polite');
    previous.addEventListener('click',()=>setPdfPage(entry,(pagePositions.get(entry.id)||0)-1));
    next.addEventListener('click',()=>setPdfPage(entry,(pagePositions.get(entry.id)||0)+1));
    controls.append(previous,count,next);controls.hidden=entry.pages.length<2;wrapper.append(page,controls);
    if(inViewer){const link=document.createElement('a');link.className='blog-pdf-source';link.href=entry.src;link.target='_blank';link.rel='noopener';link.textContent='OPEN PDF';wrapper.append(link);}
    const view={update(immediate=false){
      const index=pagePositions.get(entry.id)||0;queueImage(image,entry.pages[index],immediate||inViewer);
      image.alt=inViewer?`Document page ${index+1}`:'';if(!inViewer)page.setAttribute('aria-label',`Open document page ${index+1} from ${formatDate(entry.date)}`);
      count.textContent=`${index+1} / ${entry.pages.length}`;previous.disabled=index===0;next.disabled=index===entry.pages.length-1;
    }};
    if(!pdfViews.has(entry.id))pdfViews.set(entry.id,new Set());pdfViews.get(entry.id).add(view);view.update();
    return {element:wrapper,dispose:()=>pdfViews.get(entry.id)?.delete(view)};
  }
  function createVideo(entry,index,date) {
    const wrapper=document.createElement('div');wrapper.className='blog-video';wrapper.style.setProperty('--media-aspect',`${entry.width} / ${entry.height}`);
    const play=document.createElement('button');play.type='button';play.className='blog-media-open';play.setAttribute('aria-label',`Play video ${index+1} from ${formatDate(date)}`);play.append(makeImage(entry,entry.poster));
    const icon=document.createElementNS('http://www.w3.org/2000/svg','svg');icon.setAttribute('viewBox','0 0 24 28');icon.classList.add('blog-play-icon');icon.setAttribute('aria-hidden','true');
    const path=document.createElementNS('http://www.w3.org/2000/svg','path');path.setAttribute('d','M3 2 23 14 3 26Z');icon.append(path);play.append(icon);wrapper.append(play);
    play.addEventListener('click',()=>{
      const focused=document.activeElement===play;
      const video=document.createElement('video');video.controls=true;video.playsInline=true;video.preload='none';video.poster=entry.poster;video.width=entry.width;video.height=entry.height;video.setAttribute('aria-label',`Video from ${formatDate(date)}`);
      const error=document.createElement('p');error.className='blog-video-error';error.hidden=true;error.setAttribute('role','status');
      video.addEventListener('error',()=>{error.textContent='This video could not load. Please try again.';error.hidden=false;});
      video.addEventListener('play',()=>feed.querySelectorAll('video').forEach(other=>{if(other!==video)other.pause();}));
      wrapper.replaceChildren(video,error);video.src=entry.src;video.play().catch(()=>{});videoObserver?.observe(video);if(focused)video.focus();
    },{once:true});
    return wrapper;
  }
  function renderDay(date) {
    const section=document.createElement('section');section.className='blog-day';section.dataset.date=date;section.setAttribute('aria-label',formatDate(date));
    const heading=document.createElement('header');heading.className='blog-day-heading';
    const time=document.createElement('time');time.dateTime=date;time.textContent=formatDate(date);
    const dayTitle=document.createElement('h2');dayTitle.textContent=draft.dayTitles[date]||'';dayTitle.hidden=!dayTitle.textContent.trim();heading.append(time,dayTitle);
    const dayEditor=document.createElement('div');dayEditor.className='blog-editor blog-day-title-editor';
    const dayInput=editorField(`Optional title for ${formatDate(date)}`,'Optional title for this day');dayInput.value=draft.dayTitles[date]||'';
    dayInput.addEventListener('input',()=>{draft.dayTitles[date]=dayInput.value;dayTitle.textContent=dayInput.value;dayTitle.hidden=!dayInput.value.trim();saveDraft();});dayEditor.append(dayInput);
    const media=document.createElement('div');media.className='blog-day-media';
    const entries=window.blogEntries.filter(entry=>entry.date===date).sort((a,b)=>a.timestamp.localeCompare(b.timestamp));
    entries.forEach((entry,index)=>{
      const article=document.createElement('article');article.className='blog-entry';article.dataset.entry=entry.id;
      let visual;
      if(entry.kind==='video')visual=createVideo(entry,index,date);
      else if(entry.kind==='pdf')visual=createPdf(entry).element;
      else {
        visual=document.createElement('button');visual.type='button';visual.className='blog-media-open';visual.setAttribute('aria-label',`Open entry ${index+1} from ${formatDate(date)}`);
        visual.append(makeImage(entry,entry.kind==='gif'&&!reducedMotion.matches?entry.src:entry.poster));visual.addEventListener('click',()=>openEntry(entry));
      }
      const saved=draft.entries[entry.id];
      const title=document.createElement('h3');title.className='blog-entry-title';title.textContent=saved.title;title.hidden=!saved.title.trim();
      const note=document.createElement('p');note.className='blog-entry-text';note.textContent=saved.text;note.hidden=!saved.text.trim();
      const editor=document.createElement('div');editor.className='blog-editor';
      const label=document.createElement('label');label.textContent='Optional text below this entry';
      const titleInput=editorField(`Title for ${entry.sourceName}`,'Optional entry title');titleInput.value=saved.title;
      const textInput=editorField(`Text below ${entry.sourceName}`,'Write below this entry…',true);textInput.value=saved.text;
      titleInput.addEventListener('input',()=>{saved.title=titleInput.value;title.textContent=saved.title;title.hidden=!saved.title.trim();saveDraft();});
      textInput.addEventListener('input',()=>{saved.text=textInput.value;note.textContent=saved.text;note.hidden=!saved.text.trim();saveDraft();});
      editor.append(label,titleInput,textInput);article.append(visual,title,note,editor);media.append(article);
    });
    section.append(heading,dayEditor,media);return section;
  }
  function releaseVideo(video){video.pause();video.removeAttribute('src');video.load();}
  function renderFeed() {
    dayObserver?.disconnect();imageObserver?.disconnect();videoObserver?.disconnect();pdfViews.clear();
    feed.querySelectorAll('video').forEach(releaseVideo);feed.replaceChildren();
    const ordered=settings.newestFirst?[...dates].reverse():[...dates];let next=0;
    const sentinel=document.createElement('div');sentinel.className='blog-load-sentinel';sentinel.setAttribute('aria-hidden','true');feed.append(sentinel);
    function appendDays(count) {
      const fragment=document.createDocumentFragment();ordered.slice(next,next+count).forEach(date=>fragment.append(renderDay(date)));next+=count;sentinel.before(fragment);
      if(next>=ordered.length){dayObserver?.disconnect();sentinel.remove();}
    }
    if('IntersectionObserver' in window){dayObserver=new IntersectionObserver(items=>{if(items.some(item=>item.isIntersecting))appendDays(5);},{rootMargin:'900px 0px'});appendDays(6);if(sentinel.isConnected)dayObserver.observe(sentinel);}
    else appendDays(ordered.length);
  }
  function updateSettings() {
    parameters.forEach(p=>document.documentElement.style.setProperty(p.css,`${settings[p.key]}${p.unit}`));
    output.value=JSON.stringify(settings,null,2);document.querySelector('#blog-newest-first').checked=settings.newestFirst;
    status.textContent='';
    try{localStorage.setItem(settingsKey,JSON.stringify(settings));}catch{/* Optional. */}
  }
  const syncControls=[];
  parameters.forEach(p=>{
    const row=document.createElement('div');row.className='blog-control-row';
    const label=document.createElement('label');label.textContent=p.label;label.htmlFor=`blog-${p.key}`;
    const range=document.createElement('input');range.type='range';range.id=label.htmlFor;
    const number=document.createElement('input');number.type='number';number.setAttribute('aria-label',`${p.label}, exact value`);
    [range,number].forEach(input=>{
      input.min=p.min;input.max=p.max;input.step=p.step;input.value=settings[p.key];
      input.addEventListener('input',()=>{
        if(input.value===''||!Number.isFinite(input.valueAsNumber))return;
        settings[p.key]=clamp(Math.round(input.valueAsNumber),p.min,p.max);(input===range?number:range).value=settings[p.key];updateSettings();
      });
      input.addEventListener('change',()=>{input.value=settings[p.key];});
    });
    syncControls.push(()=>{range.value=number.value=settings[p.key];});row.append(label,range,number);document.querySelector('#blog-control-fields').append(row);
  });
  function setPanel(open){panel.hidden=!open;panelToggle.setAttribute('aria-expanded',String(open));}
  panelToggle.addEventListener('click',()=>setPanel(panel.hidden));
  document.querySelector('#blog-controls-close').addEventListener('click',()=>{setPanel(false);panelToggle.focus();});
  document.querySelector('#blog-newest-first').addEventListener('change',event=>{settings.newestFirst=event.target.checked;renderFeed();updateSettings();});
  document.querySelector('#blog-edit-text').addEventListener('change',event=>document.body.classList.toggle('is-editing-blog',event.target.checked));
  document.querySelector('#blog-reset-settings').addEventListener('click',()=>{Object.assign(settings,defaults);syncControls.forEach(sync=>sync());renderFeed();updateSettings();});
  document.querySelector('#blog-copy-settings').addEventListener('click',async()=>{
    try{await navigator.clipboard.writeText(output.value);status.textContent='COPIED :)';}
    catch{output.focus();output.select();status.textContent='Select and copy the values above.';}
  });
  document.querySelector('#blog-export-draft').addEventListener('click',()=>{
    const content={layout:{...settings},dayTitles:{...draft.dayTitles},entries:window.blogEntries.map(entry=>({id:entry.id,date:entry.date,sourceName:entry.sourceName,...draft.entries[entry.id]}))};
    const url=URL.createObjectURL(new Blob([JSON.stringify(content,null,2)],{type:'application/json'}));
    const a=document.createElement('a');a.href=url;a.download='journal-text-and-layout.json';document.body.append(a);a.click();a.remove();setTimeout(()=>URL.revokeObjectURL(url),1000);status.textContent='Draft exported.';
  });
  const viewer=document.querySelector('#blog-viewer');const viewerMedia=document.querySelector('#blog-viewer-media');const viewerStatus=document.querySelector('#blog-viewer-status');
  let activePdf=null,viewerCleanup=null;
  function openEntry(entry){
    viewerCleanup?.();viewerCleanup=null;activePdf=null;viewerMedia.replaceChildren();viewerStatus.textContent='';viewerMedia.classList.toggle('is-pdf',entry.kind==='pdf');
    if(entry.kind==='pdf'){const view=createPdf(entry,true);viewerMedia.append(view.element);viewerCleanup=view.dispose;activePdf=entry;}
    else {const image=document.createElement('img');image.src=entry.kind==='gif'&&reducedMotion.matches?entry.poster:entry.src;image.alt=`Entry from ${formatDate(entry.date)}`;viewerMedia.append(image);}
    feed.querySelectorAll('video').forEach(video=>video.pause());viewer.showModal();document.body.style.overflow='hidden';
  }
  viewer.addEventListener('keydown',event=>{if(!activePdf)return;if(event.key==='ArrowLeft'||event.key==='ArrowRight'){event.preventDefault();setPdfPage(activePdf,(pagePositions.get(activePdf.id)||0)+(event.key==='ArrowRight'?1:-1));}});
  document.querySelector('#blog-viewer-close').addEventListener('click',()=>viewer.close());
  viewer.addEventListener('close',()=>{viewerCleanup?.();viewerCleanup=null;activePdf=null;viewerMedia.replaceChildren();document.body.style.overflow='';});
  reducedMotion.addEventListener('change',renderFeed);
  document.addEventListener('visibilitychange',()=>{if(document.hidden)feed.querySelectorAll('video').forEach(video=>video.pause());});
  renderFeed();updateSettings();
  requestAnimationFrame(()=>requestAnimationFrame(()=>document.body.classList.remove('is-blog-entering')));
})();
