(function(){
  const STORAGE_KEY = 'angel_site_data_v12';
  const deepClone = (obj) => JSON.parse(JSON.stringify(obj));
  const merge = (target, source) => {
    if (!source || typeof source !== 'object') return target;
    Object.keys(source).forEach(key => {
      if (Array.isArray(source[key])) target[key] = source[key];
      else if (source[key] && typeof source[key] === 'object') {
        target[key] = merge(target[key] && typeof target[key] === 'object' ? target[key] : {}, source[key]);
      } else target[key] = source[key];
    });
    return target;
  };
  const defaults = deepClone(window.ANGEL_DEFAULT_DATA || {});
  function migrateData(data){
    if (!data.about || !Array.isArray(data.about.cards)) {
      data.about = data.about || {};
      data.about.cards = [
        { label:'使命', title:'我們在做什麼', text:data.about.mission || '', image:'', link:'', linkText:'了解更多', hidden:false },
        { label:'願景', title:'我們想成為什麼', text:data.about.vision || '', image:'', link:'', linkText:'了解更多', hidden:false },
        { label:'故事', title:'愛天使的起點', text:data.about.story || '', image:'', link:'', linkText:'了解更多', hidden:false }
      ];
    }
    (data.sponsors || []).forEach(item => {
      if (!item.link && item.url) item.link = item.url;
      if (!item.linkText) item.linkText = '合作連結';
      if (typeof item.hidden !== 'boolean') item.hidden = false;
    });
    [['home','stats'],['home','features'],['home','carouselSlides'],['home','registrations'],['event','schedule'],['event','booths']].forEach(([a,b]) => {
      ((data[a]||{})[b] || []).forEach(item => {
        if (typeof item.hidden !== 'boolean') item.hidden = false;
        if (item.linkText == null) item.linkText = '了解更多';
        if (item.videoUrl == null) item.videoUrl = '';
      });
    });
    (data.educationTypes || []).forEach(item => {
      if (typeof item.hidden !== 'boolean') item.hidden = false;
      if (item.linkText == null) item.linkText = '了解更多';
    });
    (data.news || []).forEach(item => {
      if (typeof item.hidden !== 'boolean') item.hidden = false;
      if (item.linkText == null) item.linkText = '了解更多';
    });
    (data.about.cards || []).forEach(item => {
      if (typeof item.hidden !== 'boolean') item.hidden = false;
      if (item.linkText == null) item.linkText = '了解更多';
    });
    const home = data.home = data.home || {};

    const site = data.site = data.site || {};
    if (site.logoImage == null) site.logoImage = '';
    if (site.nameFontFamily == null) site.nameFontFamily = "'Noto Sans TC', 'Microsoft JhengHei', sans-serif";
    if (site.nameFontSize == null) site.nameFontSize = '32';
    if (!Array.isArray(site.heroButtons)) {
      site.heroButtons = [
        { text: site.primaryButtonText || '立即報名', link: site.primaryButtonLink || 'contact.html#contact-form', style:'primary', image:'', hidden:false },
        { text: site.secondaryButtonText || '了解愛天使', link: site.secondaryButtonLink || 'about.html', style:'secondary', image:'', hidden:false }
      ];
    }
    if (!Array.isArray(site.heroInfoItems)) {
      site.heroInfoItems = [
        { label:'日期', value: site.heroDate || '', link:'', linkText:'', image:'', hidden:false },
        { label:'地點', value: site.heroLocation || '', link:'', linkText:'', image:'', hidden:false }
      ];
    }
    (site.heroButtons || []).forEach(item => {
      if (typeof item.hidden !== 'boolean') item.hidden = false;
      if (!item.style) item.style = 'primary';
      if (item.image == null) item.image = '';
    });
    (site.heroInfoItems || []).forEach(item => {
      if (typeof item.hidden !== 'boolean') item.hidden = false;
      if (item.image == null) item.image = '';
      if (item.linkText == null) item.linkText = '';
    });
    if (!Array.isArray(home.registrations)) {
      home.registrations = [
        { title:'我想表演', text:'舞台演出、節目提案與表演相關報名入口。', image:(data.site && data.site.heroImage) || '', link:'https://example.com/performance-signup', linkText:'前往報名', hidden:false },
        { title:'我要認攤', text:'攤位認領、攤位合作與園遊會攤主報名入口。', image:(data.site && data.site.heroImage) || '', link:'https://example.com/booth-signup', linkText:'前往報名', hidden:false },
        { title:'我想參加活動', text:'一般民眾、親子家庭與參與者活動報名入口。', image:(data.site && data.site.heroImage) || '', link:'https://example.com/event-signup', linkText:'前往報名', hidden:false }
      ];
    }
    if (!home.registrationTitle) home.registrationTitle = '活動報名資訊';
    if (!home.registrationSubtitle) home.registrationSubtitle = '歡迎依需求快速前往不同報名入口。';
    data.contact = data.contact || {};
    if (typeof data.contact.formHidden !== 'boolean') data.contact.formHidden = false;
    return data;
  }
  function getSiteData(){
    try{
      const raw = localStorage.getItem(STORAGE_KEY);
      if(!raw) return migrateData(deepClone(defaults));
      return migrateData(merge(deepClone(defaults), JSON.parse(raw)));
    }catch(e){
      return migrateData(deepClone(defaults));
    }
  }
  function saveSiteData(data){
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  }
  function resetSiteData(){
    localStorage.removeItem(STORAGE_KEY);
    location.reload();
  }
  function formatDate(dateStr){
    if(!dateStr) return '';
    const d = new Date(dateStr);
    if (String(d) === 'Invalid Date') return dateStr;
    return d.toLocaleDateString('zh-TW');
  }
  function setText(id, text){
    const el = document.getElementById(id);
    if (el) el.textContent = text || '';
  }
  function setAttr(id, attr, value){
    const el = document.getElementById(id);
    if (el) el.setAttribute(attr, value || '');
  }
  function isVisible(item){
    return !(item && (item.hidden === true || item.hidden === 'true' || item.hidden === 1 || item.hidden === '1'));
  }
  function resolveItems(items){
    return (items || []).filter(item => item && isVisible(item));
  }
  function targetAttr(link){
    return /^https?:/i.test(link || '') ? ' target="_blank" rel="noreferrer"' : '';
  }
  function getYoutubeEmbedUrl(url){
    if (!url) return '';
    const input = String(url).trim();
    let m = input.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/|youtube\.com\/shorts\/)([A-Za-z0-9_-]{6,})/i);
    if (!m) {
      try{
        const u = new URL(input);
        const v = u.searchParams.get('v');
        if (v) return `https://www.youtube.com/embed/${v}`;
      }catch(e){}
      return '';
    }
    return `https://www.youtube.com/embed/${m[1]}`;
  }
  function mediaBlock(item, alt=''){
    const yt = getYoutubeEmbedUrl(item && item.videoUrl);
    if (yt) return `<div class="media-frame-wrap"><iframe src="${yt}" title="${alt}" loading="lazy" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" allowfullscreen></iframe></div>`;
    return item && item.image ? `<div class="card-image-wrap"><img class="card-image" src="${item.image}" alt="${alt}"></div>` : '';
  }
  function actionButton(item, fallback='了解更多'){
    if (!item || !item.link) return '';
    return `<a class="inline-link" href="${item.link}"${targetAttr(item.link)}>${item.linkText || fallback}</a>`;
  }
  function cardImage(item, alt=''){
    return item && item.image ? `<div class="card-image-wrap"><img class="card-image" src="${item.image}" alt="${alt}"></div>` : '';
  }
  function toggleDisplay(id, show){
    const el = document.getElementById(id);
    if (el) el.style.display = show ? '' : 'none';
  }
  function renderCommon(data){
    setText('siteName', data.site.name);
    setText('footerSiteName', data.site.name);
    const siteNameEl = document.getElementById('siteName');
    if (siteNameEl){
      siteNameEl.style.fontFamily = data.site.nameFontFamily || "'Noto Sans TC', 'Microsoft JhengHei', sans-serif";
      const size = parseInt(data.site.nameFontSize || '32', 10);
      if (!Number.isNaN(size)){
        const desktop = Math.max(12, size);
        const tablet = Math.max(12, Math.round(desktop * 0.78));
        const mobile = Math.max(12, Math.round(desktop * 0.62));
        siteNameEl.style.fontSize = `clamp(${mobile}px, 2.6vw, ${desktop}px)`;
        siteNameEl.style.lineHeight = '1.1';
      }
      siteNameEl.style.fontWeight = '900';
    }
    const hero = document.querySelector('.hero');
    if (hero && data.site.heroImage) hero.style.backgroundImage = `linear-gradient(180deg, rgba(255,255,255,.16), rgba(255,255,255,.1)), url("${data.site.heroImage}")`;
    if (data.site.heroImage) document.documentElement.style.setProperty('--site-bg-image', `url("${data.site.heroImage}")`);
    const logoSrc = String(data.site.logoImage || '').trim();
    const logoImgs = document.querySelectorAll('#siteLogoImage, .site-logo-image');
    const logoFallbacks = document.querySelectorAll('#siteLogoFallback, .site-logo-fallback');
    if (logoSrc){
      logoImgs.forEach(img => {
        img.src = logoSrc;
        img.style.display = 'block';
      });
      logoFallbacks.forEach(el => { el.style.display = 'none'; });
    } else {
      logoImgs.forEach(img => {
        img.removeAttribute('src');
        img.style.display = 'none';
      });
      logoFallbacks.forEach(el => { el.style.display = ''; });
    }
  }
  let carouselTimer = null;
  function renderCarousel(data){
    setText('carouselTitle', data.home.carouselTitle);
    setText('carouselSubtitle', data.home.carouselSubtitle);
    const track = document.getElementById('homeCarouselTrack');
    const dots = document.getElementById('carouselDots');
    const prev = document.getElementById('carouselPrev');
    const next = document.getElementById('carouselNext');
    const wrap = document.getElementById('homeCarousel');
    const slides = resolveItems(data.home.carouselSlides).filter(item => item.image || getYoutubeEmbedUrl(item.videoUrl));
    if (!track || !dots || !wrap) return;
    if (!slides.length){
      track.innerHTML = '<div class="empty-note" style="margin:18px">尚未設定輪播圖片。</div>';
      dots.innerHTML = '';
      if (prev) prev.style.display = 'none';
      if (next) next.style.display = 'none';
      return;
    }
    let current = 0;
    track.innerHTML = slides.map(item => {
      const media = getYoutubeEmbedUrl(item.videoUrl)
        ? `<div class="carousel-media">${mediaBlock(item, item.title || '')}</div>`
        : `<a class="carousel-media" href="${item.link || '#'}"${targetAttr(item.link)}><img src="${item.image}" alt="${item.title || ''}"></a>`;
      const action = item.link ? `<div class="carousel-caption-action"><a class="inline-link" href="${item.link}"${targetAttr(item.link)}>${item.linkText || '了解更多'}</a></div>` : '';
      return `
      <div class="carousel-slide${getYoutubeEmbedUrl(item.videoUrl) ? ' is-video' : ''}">
        ${media}
        <div class="carousel-caption">
          <h3>${item.title || ''}</h3>
          <p>${item.caption || ''}</p>
          ${action}
        </div>
      </div>
    `}).join('');
    dots.innerHTML = slides.map((_, idx) => `<button aria-label="前往第${idx+1}張"></button>`).join('');
    const dotEls = [...dots.querySelectorAll('button')];
    function update(){
      track.style.transform = `translateX(-${current * 100}%)`;
      dotEls.forEach((d, i) => d.classList.toggle('active', i === current));
    }
    function go(idx){ current = (idx + slides.length) % slides.length; update(); }
    dotEls.forEach((dot, idx) => dot.addEventListener('click', () => { go(idx); restart(); }));
    if (prev) prev.onclick = () => { go(current - 1); restart(); };
    if (next) next.onclick = () => { go(current + 1); restart(); };
    function start(){ if (slides.length > 1) carouselTimer = setInterval(() => go(current + 1), 5000); }
    function stop(){ if (carouselTimer) clearInterval(carouselTimer); carouselTimer = null; }
    function restart(){ stop(); start(); }
    wrap.addEventListener('mouseenter', stop);
    wrap.addEventListener('mouseleave', start);
    update();
    start();
  }

  function renderHome(data){
    setText('heroTitle', data.site.heroTitle);
    setText('heroSubtitle', data.site.heroSubtitle);
    const visibleHeroButtons = resolveItems((data.site || {}).heroButtons);
    const visibleHeroInfoItems = resolveItems((data.site || {}).heroInfoItems);
    const heroButtons = document.getElementById('heroButtons');
    if (heroButtons) heroButtons.innerHTML = visibleHeroButtons.map(item => `
      <a class="btn ${item.style === 'secondary' ? 'btn-secondary' : 'btn-primary'}${item.image ? ' btn-with-thumb' : ''}" href="${item.link || '#'}"${targetAttr(item.link)}>
        ${item.image ? `<img class="btn-thumb" src="${item.image}" alt="${item.text || ''}">` : ''}
        <span>${item.text || '了解更多'}</span>
      </a>
    `).join('');
    const heroInfoItems = document.getElementById('heroInfoItems');
    if (heroInfoItems) heroInfoItems.innerHTML = visibleHeroInfoItems.map(item => `
      <div class="info-item ${item.image ? 'info-item-rich' : ''}">
        ${item.image ? `<img class="info-thumb" src="${item.image}" alt="${item.label || ''}">` : ''}
        <div class="info-label">${item.label || ''}</div>
        <div class="info-value">${item.value || ''}</div>
        ${actionButton(item)}
      </div>
    `).join('');
    toggleDisplay('heroCard', !!((data.site.heroTitle || '').trim() || (data.site.heroSubtitle || '').trim() || visibleHeroButtons.length));
    toggleDisplay('heroInfoCard', visibleHeroInfoItems.length > 0);
    setText('homeIntroTitle', data.home.introTitle);
    setText('homeIntroText', data.home.introText);
    const stats = document.getElementById('homeStats');
    const visibleStats = resolveItems(data.home.stats);
    toggleDisplay('homeStatsCard', visibleStats.length > 0);
    if (stats) stats.innerHTML = visibleStats.map(item => `
      <div class="info-item ${item.image ? 'info-item-rich' : ''}">
        ${item.image ? `<img class="info-thumb" src="${item.image}" alt="${item.label || ''}">` : ''}
        <div class="info-label">${item.label || ''}</div>
        <div class="info-value">${item.value || ''}</div>
        ${actionButton(item)}
      </div>
    `).join('');
    const features = document.getElementById('homeFeatures');
    if (features) features.innerHTML = resolveItems(data.home.features).map(item => `
      <article class="feature-card rich-card">
        ${mediaBlock(item, item.title || '')}
        <span class="kicker">重點內容</span>
        <h3>${item.title || ''}</h3>
        <p>${item.text || ''}</p>
        ${actionButton(item)}
      </article>
    `).join('');
    const registrations = document.getElementById('homeRegistrations');
    setText('registrationTitle', (data.home || {}).registrationTitle);
    setText('registrationSubtitle', (data.home || {}).registrationSubtitle);
    if (registrations) registrations.innerHTML = resolveItems((data.home || {}).registrations).map(item => `
      <article class="feature-card rich-card signup-card">
        ${mediaBlock(item, item.title || '')}
        <span class="kicker">報名入口</span>
        <h3>${item.title || ''}</h3>
        <p>${item.text || ''}</p>
        <div class="hero-actions signup-actions">
          <a class="btn btn-primary" href="${item.link || '#'}"${targetAttr(item.link)}>${item.linkText || '前往報名'}</a>
        </div>
      </article>
    `).join('') || '<div class="empty-note">目前沒有可顯示的報名資訊。</div>';
    const news = document.getElementById('homeNews');
    if (news) news.innerHTML = resolveItems(data.news).slice(0,3).map(item => `
      <article class="news-card rich-card">
        ${mediaBlock(item, item.title || '')}
        <span class="kicker">${formatDate(item.date)}</span>
        <h3>${item.title || ''}</h3>
        <p>${item.summary || ''}</p>
        ${actionButton(item, '查看內容')}
      </article>
    `).join('');
  }
  function renderAbout(data){
    const wrap = document.getElementById('aboutCards');
    if (wrap) wrap.innerHTML = resolveItems((data.about || {}).cards).map(item => `
      <article class="feature-card rich-card">
        ${mediaBlock(item, item.title || '')}
        <span class="kicker">${item.label || ''}</span>
        <h3>${item.title || ''}</h3>
        <p>${item.text || ''}</p>
        ${actionButton(item)}
      </article>
    `).join('');
  }
  function renderTypes(data){
    const wrap = document.getElementById('educationTypes');
    if (wrap) wrap.innerHTML = resolveItems(data.educationTypes).map(item => `
      <article class="type-card rich-card">
        ${cardImage(item, item.name || '')}
        <span class="kicker">特教領域</span>
        <h3>${item.name || ''}</h3>
        <p>${item.summary || ''}</p>
        ${actionButton(item, '延伸了解')}
      </article>
    `).join('');
  }
  function renderNewsPage(data){
    const wrap = document.getElementById('newsList');
    if (wrap) wrap.innerHTML = resolveItems(data.news).map(item => `
      <article class="news-card rich-card">
        ${mediaBlock(item, item.title || '')}
        <span class="kicker">${formatDate(item.date)}</span>
        <h3>${item.title || ''}</h3>
        <p>${item.summary || ''}</p>
        ${actionButton(item, '查看內容')}
      </article>
    `).join('');
  }
  function renderEvent(data){
    setText('eventTitle', data.event.title);
    setText('eventDesc', data.event.desc);
    const schedule = document.getElementById('scheduleList');
    const scheduleItems = resolveItems(data.event.schedule);
    if (schedule) schedule.innerHTML = scheduleItems.map(item => `
      <div class="schedule-item ${item.image ? 'schedule-item-rich' : ''}">
        ${item.image ? `<img class="schedule-thumb" src="${item.image}" alt="${item.item || ''}">` : ''}
        <div>
          <div class="schedule-time">${item.time || ''}</div>
          <div>${item.item || ''}</div>
          ${actionButton(item)}
        </div>
      </div>
    `).join('') || '<div class="empty-note">目前沒有可顯示的時程。</div>';
    const booths = document.getElementById('boothList');
    if (booths) booths.innerHTML = resolveItems(data.event.booths).map(item => `
      <article class="booth-card rich-card">
        ${cardImage(item, item.name || '')}
        <span class="kicker">${item.category || ''}</span>
        <h3>${item.name || ''}</h3>
        <p>${item.desc || ''}</p>
        ${actionButton(item)}
      </article>
    `).join('') || '<div class="empty-note">目前沒有可顯示的攤位。</div>';
  }
  function renderSponsors(data){
    const wrap = document.getElementById('sponsorList');
    if (wrap) wrap.innerHTML = resolveItems(data.sponsors).map(item => `
      <article class="sponsor-card rich-card">
        ${cardImage(item, item.name || '')}
        <span class="kicker">${item.level || ''}</span>
        <h3>${item.name || ''}</h3>
        ${actionButton(item, '合作連結')}
      </article>
    `).join('');
  }
  function renderContact(data){
    setText('contactEmail', data.contact.email);
    setText('contactPhone', data.contact.phone);
    setText('contactAddress', data.contact.address);
    setText('contactNotice', data.contact.formNotice);
    const imgWrap = document.getElementById('contactMediaWrap');
    const img = document.getElementById('contactMediaImage');
    const link = document.getElementById('contactMediaLink');
    if (imgWrap && img && data.contact.panelImage){
      imgWrap.style.display = '';
      img.src = data.contact.panelImage;
      link.href = data.contact.panelLink || '#';
      if (/^https?:/i.test(data.contact.panelLink || '')) { link.target = '_blank'; link.rel = 'noreferrer'; }
    }
    toggleDisplay('contactFormPanel', !data.contact.formHidden);
  }
  window.AngelSite = { getSiteData, saveSiteData, resetSiteData, formatDate };
  document.addEventListener('DOMContentLoaded', function(){
    const data = getSiteData();
    renderCommon(data);
    renderCarousel(data);
    renderHome(data);
    renderAbout(data);
    renderTypes(data);
    renderNewsPage(data);
    renderEvent(data);
    renderSponsors(data);
    renderContact(data);
    const current = location.pathname.split('/').pop() || 'index.html';
    document.querySelectorAll('.nav a[data-page]').forEach(a => {
      if (a.getAttribute('data-page') === current) a.classList.add('active');
    });
    const form = document.getElementById('contact-form');
    if (form){
      form.addEventListener('submit', function(e){
        e.preventDefault();
        alert('已送出示意表單。正式上線時可串接 Email、Google 表單、資料庫或 CRM。');
        form.reset();
      });
    }
  });
})();
