// Smooth reveal on scroll, modal video player, and simple form handling
document.addEventListener('DOMContentLoaded', ()=>{
    // Dynamically generate video thumbnails for featured projects
    document.querySelectorAll('.card[data-video-id] .thumb').forEach(function(thumbDiv) {
      const card = thumbDiv.closest('.card');
      const videoSrc = card.getAttribute('data-video-id');
      // Only add if not already an image
      if (!thumbDiv.querySelector('img')) {
        const video = document.createElement('video');
        video.src = videoSrc;
        video.crossOrigin = 'anonymous';
        video.muted = true;
        video.playsInline = true;
        video.preload = 'auto';
        video.style.display = 'none';
        document.body.appendChild(video);
        video.addEventListener('loadeddata', function() {
          // Create canvas to draw frame
          const canvas = document.createElement('canvas');
          canvas.width = video.videoWidth;
          canvas.height = video.videoHeight;
          const ctx = canvas.getContext('2d');
          ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
          const img = document.createElement('img');
          img.src = canvas.toDataURL('image/jpeg');
          img.alt = 'Video thumbnail';
          img.style.width = '100%';
          img.style.height = '100%';
          img.style.objectFit = 'cover';
          // Insert as first child (before play overlay)
          thumbDiv.insertBefore(img, thumbDiv.firstChild);
          video.remove();
          canvas.remove();
        }, { once: true });
      }
    });
  // reveal
  const revealElems = document.querySelectorAll('.reveal');
  const obs = new IntersectionObserver((entries)=>{
    entries.forEach(e=>{ if(e.isIntersecting) e.target.classList.add('show'); })
  },{threshold:0.12});
  revealElems.forEach(el=>obs.observe(el));

  // project cards -> open modal
  const modal = document.getElementById('videoModal');
  const videoWrap = document.getElementById('videoWrap');
  const modalMeta = document.getElementById('modalMeta');
  const closeBtn = document.querySelector('.modal-close');

  document.querySelectorAll('.card').forEach(card=>{
    card.addEventListener('click', ()=>{
      const src = card.getAttribute('data-video-id');
      const title = card.querySelector('.card-meta h3').innerText;
      // add launch animation classes
      card.classList.add('launch');
      document.body.classList.add('please-wait');
      // allow the play-overlay expansion to animate, then open modal
      setTimeout(()=>{
        openModal(src, title);
        // cleanup launch effects shortly after modal open
        setTimeout(()=>{ card.classList.remove('launch'); document.body.classList.remove('please-wait'); }, 300);
      }, 520);
    })
  });

  function openModal(src, title){
    // prepare modal content
    videoWrap.innerHTML = '';
    if(src.endsWith('.mp4') || src.indexOf('.mp4?') !== -1){
      const video = document.createElement('video');
      video.src = src;
      video.controls = true;
      video.autoplay = true;
      video.playsInline = true;
      video.muted = false; // user can unmute via controls
      videoWrap.appendChild(video);
      // attempt to play (may be blocked if not muted)
      video.play().catch(()=>{/* autoplay blocked */});
    } else {
      const iframe = document.createElement('iframe');
      iframe.src = `${src}?autoplay=1&rel=0`;
      iframe.frameBorder = '0';
      iframe.allow = 'autoplay; encrypted-media';
      iframe.allowFullscreen = true;
      videoWrap.appendChild(iframe);
    }

    modalMeta.textContent = title;
    // open with animation
    modal.classList.remove('closing');
  modal.setAttribute('aria-hidden','false');
  // add opening class to trigger slow-mo entrance, then remove after animation
  modal.classList.add('opening');
  setTimeout(()=>{ modal.classList.remove('opening'); }, 820);
  }
  function closeModal(){
    // animate close then remove media
    modal.classList.add('closing');
    // wait for CSS animation to complete (matching .modal transitions)
    setTimeout(()=>{
      // pause any playing video
      const v = videoWrap.querySelector('video'); if(v && typeof v.pause === 'function') try{ v.pause(); }catch(e){}
      // remove content
      videoWrap.innerHTML = '';
      modal.setAttribute('aria-hidden','true');
      modal.classList.remove('closing');
    }, 460);
  }
  closeBtn.addEventListener('click', closeModal);
  modal.querySelector('.modal-backdrop').addEventListener('click', closeModal);

  // contact form (stub)
  const form = document.getElementById('contactForm');
  form.addEventListener('submit', (e)=>{
    e.preventDefault();
    const data = new FormData(form);
    // simple validation
    if(!data.get('name') || !data.get('email') || !data.get('message')){
      alert('Please complete name, email, and message.');
      return;
    }
    // simulate send
    const btn = form.querySelector('button');
    btn.disabled = true; btn.textContent = 'SENDING...';
    setTimeout(()=>{ btn.disabled=false; btn.textContent='SEND MESSAGE'; alert('Message sent (demo).'); form.reset(); }, 900);
  });

  // smooth scroll for nav
  document.querySelectorAll('a[href^="#"]').forEach(a=>{
    a.addEventListener('click', (e)=>{
      const href = a.getAttribute('href');
      if(href.length>1){ e.preventDefault(); document.querySelector(href).scrollIntoView({behavior:'smooth',block:'start'}); }
    })
  });
  
  /* Custom animated cursor */
  (function(){
    const body = document.body;
    // do not create on touch devices
    if(window.matchMedia('(hover: none), (pointer: coarse)').matches) return;
    body.classList.add('has-custom-cursor');
    const dot = document.createElement('div'); dot.className = 'cursor-dot';
    const ring = document.createElement('div'); ring.className = 'cursor-ring';
    body.appendChild(ring); body.appendChild(dot);

    let mouseX = window.innerWidth/2, mouseY = window.innerHeight/2;
    let ringX = mouseX, ringY = mouseY;

    const lerp = (a,b,n)=> (1-n)*a + n*b;
  window.addEventListener('mousemove', (e)=>{ mouseX = e.clientX; mouseY = e.clientY; dot.style.left = mouseX+'px'; dot.style.top = mouseY+'px'; ring.style.left = mouseX+'px'; ring.style.top = mouseY+'px'; dot.classList.remove('cursor-hidden'); ring.classList.remove('cursor-hidden'); });

    // subtle trailing for ring
    function animate(){
      ringX = lerp(ringX, mouseX, 0.18);
      ringY = lerp(ringY, mouseY, 0.18);
      ring.style.transform = `translate(${ringX - 50}% , ${ringY - 50}%)`;
      requestAnimationFrame(animate);
    }
    requestAnimationFrame(animate);

    // interactive elements enlarge ring
    const hoverTargets = 'a, button, .card, .play-overlay, .btn, input, textarea, .social';
    document.querySelectorAll(hoverTargets).forEach(el=>{
      el.addEventListener('mouseenter', ()=>{ body.classList.add('cursor-hover'); });
      el.addEventListener('mouseleave', ()=>{ body.classList.remove('cursor-hover'); });
    });

    // click effect
    window.addEventListener('mousedown', ()=>{ dot.classList.add('cursor-click'); ring.classList.add('cursor-click'); });
    window.addEventListener('mouseup', ()=>{ dot.classList.remove('cursor-click'); ring.classList.remove('cursor-click'); });

  // hide cursor when leaving window (only cursor elements)
  window.addEventListener('mouseout', (e)=>{ if(!e.relatedTarget){ dot.classList.add('cursor-hidden'); ring.classList.add('cursor-hidden'); } });
  window.addEventListener('mouseenter', ()=>{ dot.classList.remove('cursor-hidden'); ring.classList.remove('cursor-hidden'); });
  })();

  /* Sparkle effect for cursor (pooled elements) */
  (function(){
    if(window.matchMedia('(hover: none), (pointer: coarse)').matches) return; // skip on touch
    const container = document.createElement('div'); container.className='sparkles-container'; document.body.appendChild(container);
    const POOL = 18; const pool = [];
    for(let i=0;i<POOL;i++){ const s = document.createElement('div'); s.className='sparkle'; pool.push(s); container.appendChild(s); }

    let lastSpawn = 0;
    function spawn(x,y){
      const now = performance.now(); if(now - lastSpawn < 40) return; lastSpawn = now; // throttle
      const el = pool.shift(); if(!el) return; pool.push(el);
      const size = (Math.random()>0.7)?'large':'small'; el.className = `sparkle ${size}`;
      const hue = Math.random()*40 + 190; // blueish-purple range
      el.style.left = x + 'px'; el.style.top = y + 'px';
      el.style.background = `radial-gradient(circle at 30% 30%, rgba(255,255,255,0.95), hsla(${hue},90%,65%,0.9) 40%, transparent 60%)`;
      // random slight offset
      el.style.transform = `translate(-50%,-50%) rotate(${Math.random()*60-30}deg)`;
      el.classList.add('sparkle--animate');
      // recycle after animation
      setTimeout(()=>{ el.classList.remove('sparkle--animate'); }, 800);
    }

    window.addEventListener('mousemove', (e)=>{
      // spawn a few sparkles near cursor
      for(let i=0;i< (Math.random()>0.8?2:1); i++){
        const rx = e.clientX + (Math.random()*20-10);
        const ry = e.clientY + (Math.random()*20-10);
        spawn(rx, ry);
      }
    });
  })();

  // Section in-view overlay + parallax for elements with data-parallax
  (function(){
    const sections = document.querySelectorAll('.section');
    const secObs = new IntersectionObserver((entries)=>{
      entries.forEach(en=>{
        if(en.isIntersecting) en.target.classList.add('in-view');
      });
    },{threshold:0.18});
    sections.forEach(s=>secObs.observe(s));

    // simple parallax: elements with data-parallax
    const parallaxEls = document.querySelectorAll('[data-parallax]');
    const state = {y:0};
    window.addEventListener('scroll', ()=>{ state.y = window.scrollY; });
    function raf(){
      parallaxEls.forEach(el=>{
        const depth = parseFloat(el.getAttribute('data-parallax')) || 0.1;
        const rect = el.getBoundingClientRect();
        const offset = (rect.top + rect.height/2 - window.innerHeight/2) * -depth;
        el.style.transform = `translate3d(0, ${offset}px, 0)`;
      });
      requestAnimationFrame(raf);
    }
    requestAnimationFrame(raf);
  })();

  // Image modal: open when clicking avatar or about photo
  (function(){
    const imgModal = document.getElementById('imageModal');
    const imgWrap = document.getElementById('imageWrap');
    const closeBtns = imgModal.querySelectorAll('.modal-close');
    function openImg(src, alt){ imgWrap.innerHTML = `<img src="${src}" alt="${alt}">`; imgModal.setAttribute('aria-hidden','false'); }
    function closeImg(){ imgModal.setAttribute('aria-hidden','true'); imgWrap.innerHTML=''; }
    document.querySelectorAll('.avatar img, .photo img').forEach(i=>{
      i.style.cursor = 'zoom-in';
      i.addEventListener('click', ()=> openImg(i.getAttribute('src'), i.getAttribute('alt')||''));
    });
    imgModal.querySelector('.modal-backdrop').addEventListener('click', closeImg);
    closeBtns.forEach(b=>b.addEventListener('click', closeImg));
    window.addEventListener('keydown', (e)=>{ if(e.key==='Escape') closeImg(); });
  })();

  // Portfolio page filtering (guarded)
  (function(){
    const portfolioRoot = document.getElementById('portfolioPage') || document.getElementById('projectsGrid');
    if(!portfolioRoot) return;
    const cats = document.querySelectorAll('.portfolio-cats .cat');
    const cards = document.querySelectorAll('#projectsGrid .card');
    function setCategory(cat, button){
      cats.forEach(c=>{
        const is = c.getAttribute('data-cat')===cat;
        c.classList.toggle('active', is);
        c.setAttribute('aria-pressed', is? 'true' : 'false');
      });
      cards.forEach(card=>{
        const cardCat = card.getAttribute('data-category') || 'all';
        if(cat==='all' || cardCat===cat) card.style.display=''; else card.style.display='none';
      });
    }
    cats.forEach(c=>c.addEventListener('click', (e)=> setCategory(c.getAttribute('data-cat'), c)));
    if(cats.length) setCategory('all');
  })();

  // portfolio filtering removed
});
