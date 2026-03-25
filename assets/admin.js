(function(){
  const { getSiteData, saveSiteData, resetSiteData } = window.AngelSite || {};
  const el = (id) => document.getElementById(id);
  const qs = (sel, root=document) => root.querySelector(sel);
  let data = getSiteData();

  const panels = [
    {id:'site', label:'網站基本設定'},
    {id:'home', label:'首頁內容'},
    {id:'about', label:'關於愛天使'},
    {id:'types', label:'特教領域'},
    {id:'news', label:'最新消息'},
    {id:'event', label:'活動與攤位'},
    {id:'sponsors', label:'贊助夥伴'},
    {id:'contact', label:'聯絡資訊'},
    {id:'system', label:'系統工具'}
  ];

  function guard(){
    const ok = sessionStorage.getItem('angel_admin_ok') === '1';
    el('loginView').style.display = ok ? 'none' : '';
    el('adminView').style.display = ok ? '' : 'none';
  }
  function renderNav(){
    el('adminNav').innerHTML = panels.map((panel, idx) => `<button class="${idx===0?'active':''}" data-target="panel-${panel.id}">${panel.label}</button>`).join('');
    el('adminNav').querySelectorAll('button').forEach(btn => {
      btn.addEventListener('click', () => {
        document.querySelectorAll('.admin-nav button').forEach(b => b.classList.remove('active'));
        document.querySelectorAll('.admin-panel').forEach(p => p.classList.remove('active'));
        btn.classList.add('active');
        el(btn.dataset.target).classList.add('active');
      });
    });
  }
  function bindPreviewUpload(inputId, fileId, wrapId, imgId){
    const input = el(inputId), file = el(fileId), wrap = el(wrapId), img = el(imgId);
    if (!input || !file || !wrap || !img) return;
    function refresh(){
      const val = String(input.value || '').trim();
      if (val){
        wrap.style.display = '';
        img.src = val;
      } else {
        wrap.style.display = 'none';
        img.removeAttribute('src');
      }
    }
    input.addEventListener('input', refresh);
    file.addEventListener('change', (e) => {
      const f = e.target.files && e.target.files[0];
      if (!f) return;
      const reader = new FileReader();
      reader.onload = () => {
        input.value = String(reader.result || '');
        input.dispatchEvent(new Event('input', {bubbles:true}));
        refresh();
      };
      reader.readAsDataURL(f);
    });
    refresh();
  }
  function bindSimple(){
    const map = {
      siteNameInput:['site','name'], siteTaglineInput:['site','tagline'], siteNameFontFamilyInput:['site','nameFontFamily'], siteNameFontSizeInput:['site','nameFontSize'], siteLogoInput:['site','logoImage'], heroTitleInput:['site','heroTitle'],
      heroSubtitleInput:['site','heroSubtitle'], heroImageInput:['site','heroImage'], homeIntroTitleInput:['home','introTitle'], homeIntroTextInput:['home','introText'],
      carouselTitleInput:['home','carouselTitle'], carouselSubtitleInput:['home','carouselSubtitle'], registrationTitleInput:['home','registrationTitle'], registrationSubtitleInput:['home','registrationSubtitle'], eventTitleInput:['event','title'],
      eventDescInput:['event','desc'], contactEmailInput:['contact','email'], contactPhoneInput:['contact','phone'],
      contactAddressInput:['contact','address'], contactNoticeInput:['contact','formNotice'],
      contactPanelImageInput:['contact','panelImage'], contactPanelLinkInput:['contact','panelLink'], adminPasswordInput:['admin','password']
    };
    Object.entries(map).forEach(([id, path]) => {
      const input = el(id); if (!input) return;
      input.value = data[path[0]]?.[path[1]] ?? '';
      input.addEventListener('input', () => { data[path[0]][path[1]] = input.value; });
    });
    el('contactFormHiddenInput').checked = !!data.contact.formHidden;
    el('contactFormHiddenInput').addEventListener('change', () => data.contact.formHidden = el('contactFormHiddenInput').checked);
    bindPreviewUpload('siteLogoInput', 'siteLogoFile', 'siteLogoPreviewWrap', 'siteLogoPreview');
    const siteLogoInputEl = el('siteLogoInput');
    if (siteLogoInputEl) siteLogoInputEl.addEventListener('input', () => { data.site.logoImage = siteLogoInputEl.value; });
    bindPreviewUpload('heroImageInput', 'heroImageFile', 'heroImagePreviewWrap', 'heroImagePreview');
    bindPreviewUpload('contactPanelImageInput', 'contactPanelImageFile', 'contactPanelPreviewWrap', 'contactPanelPreview');
    renderHeroButtonsEditor();
    renderHeroInfoEditor();
  }

  function ensureSiteCollections(){
    data.site = data.site || {};
    if (!Array.isArray(data.site.heroButtons)) data.site.heroButtons = [];
    if (!Array.isArray(data.site.heroInfoItems)) data.site.heroInfoItems = [];
  }
  function readImageFile(file, cb){
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => cb(String(reader.result || ''));
    reader.readAsDataURL(file);
  }

  function moveItem(arr, from, delta){
    const to = from + delta;
    if (!Array.isArray(arr) || from < 0 || to < 0 || from >= arr.length || to >= arr.length) return;
    const [item] = arr.splice(from, 1);
    arr.splice(to, 0, item);
  }
  function renderHeroButtonsEditor(){
    ensureSiteCollections();
    const wrap = el('heroButtonsEditor');
    if (!wrap) return;
    wrap.innerHTML = data.site.heroButtons.map((item, idx) => `
      <div class="editor-card">
        <div class="editor-item-head">
          <div class="editor-item-title">按鈕 ${idx+1}</div>
          <div class="inline-actions">
            <button type="button" class="btn btn-soft" data-move-hero-btn-up="${idx}">上移</button>
            <button type="button" class="btn btn-soft" data-move-hero-btn-down="${idx}">下移</button>
            <button type="button" class="btn btn-secondary" data-remove-hero-btn="${idx}">移除</button>
          </div>
        </div>
        <div class="row-2">
          <label>按鈕文字<input class="input" data-hero-btn-text="${idx}" value="${escapeHtml(item.text || '')}" /></label>
          <label>超連結<input class="input" data-hero-btn-link="${idx}" value="${escapeHtml(item.link || '')}" /></label>
        </div>
        <div class="row-2">
          <label>樣式
            <select class="input" data-hero-btn-style="${idx}">
              <option value="primary" ${item.style === 'secondary' ? '' : 'selected'}>主要按鈕</option>
              <option value="secondary" ${item.style === 'secondary' ? 'selected' : ''}>次要按鈕</option>
            </select>
          </label>
          <label>圖片路徑或 base64<input class="input" data-hero-btn-image="${idx}" value="${escapeHtml(item.image || '')}" /></label>
        </div>
        <div class="inline-actions">
          <label class="btn btn-soft">上傳圖片<input type="file" accept="image/*" data-hero-btn-file="${idx}" hidden></label>
          <label><input type="checkbox" data-hero-btn-hidden="${idx}" ${item.hidden ? 'checked' : ''}/> 隱藏此按鈕</label>
        </div>
      </div>
    `).join('') || '<div class="empty-note">目前沒有按鈕，請新增。</div>';
    wrap.querySelectorAll('[data-remove-hero-btn]').forEach(btn => btn.addEventListener('click', () => { data.site.heroButtons.splice(Number(btn.dataset.removeHeroBtn), 1); renderHeroButtonsEditor(); }));
    wrap.querySelectorAll('[data-move-hero-btn-up]').forEach(btn => btn.addEventListener('click', () => { moveItem(data.site.heroButtons, Number(btn.dataset.moveHeroBtnUp), -1); renderHeroButtonsEditor(); }));
    wrap.querySelectorAll('[data-move-hero-btn-down]').forEach(btn => btn.addEventListener('click', () => { moveItem(data.site.heroButtons, Number(btn.dataset.moveHeroBtnDown), 1); renderHeroButtonsEditor(); }));
    wrap.querySelectorAll('[data-hero-btn-text]').forEach(input => input.addEventListener('input', e => data.site.heroButtons[Number(e.target.dataset.heroBtnText)].text = e.target.value));
    wrap.querySelectorAll('[data-hero-btn-link]').forEach(input => input.addEventListener('input', e => data.site.heroButtons[Number(e.target.dataset.heroBtnLink)].link = e.target.value));
    wrap.querySelectorAll('[data-hero-btn-style]').forEach(input => input.addEventListener('change', e => data.site.heroButtons[Number(e.target.dataset.heroBtnStyle)].style = e.target.value));
    wrap.querySelectorAll('[data-hero-btn-image]').forEach(input => input.addEventListener('input', e => data.site.heroButtons[Number(e.target.dataset.heroBtnImage)].image = e.target.value));
    wrap.querySelectorAll('[data-hero-btn-hidden]').forEach(input => input.addEventListener('change', e => data.site.heroButtons[Number(e.target.dataset.heroBtnHidden)].hidden = e.target.checked));
    wrap.querySelectorAll('[data-hero-btn-file]').forEach(input => input.addEventListener('change', e => {
      const idx = Number(e.target.dataset.heroBtnFile);
      readImageFile(e.target.files[0], (src) => {
        data.site.heroButtons[idx].image = src;
        renderHeroButtonsEditor();
      });
    }));
  }
  function renderHeroInfoEditor(){
    ensureSiteCollections();
    const wrap = el('heroInfoEditor');
    if (!wrap) return;
    wrap.innerHTML = data.site.heroInfoItems.map((item, idx) => `
      <div class="editor-card">
        <div class="editor-item-head">
          <div class="editor-item-title">資訊卡 ${idx+1}</div>
          <div class="inline-actions">
            <button type="button" class="btn btn-soft" data-move-hero-info-up="${idx}">上移</button>
            <button type="button" class="btn btn-soft" data-move-hero-info-down="${idx}">下移</button>
            <button type="button" class="btn btn-secondary" data-remove-hero-info="${idx}">移除</button>
          </div>
        </div>
        <div class="row-2">
          <label>標籤<input class="input" data-hero-info-label="${idx}" value="${escapeHtml(item.label || '')}" /></label>
          <label>內容<input class="input" data-hero-info-value="${idx}" value="${escapeHtml(item.value || '')}" /></label>
        </div>
        <div class="row-2">
          <label>超連結<input class="input" data-hero-info-link="${idx}" value="${escapeHtml(item.link || '')}" /></label>
          <label>連結文字<input class="input" data-hero-info-linktext="${idx}" value="${escapeHtml(item.linkText || '')}" /></label>
        </div>
        <div class="row-2">
          <label>圖片路徑或 base64<input class="input" data-hero-info-image="${idx}" value="${escapeHtml(item.image || '')}" /></label>
          <label><input type="checkbox" data-hero-info-hidden="${idx}" ${item.hidden ? 'checked' : ''}/> 隱藏此資訊卡</label>
        </div>
        <div class="inline-actions">
          <label class="btn btn-soft">上傳圖片<input type="file" accept="image/*" data-hero-info-file="${idx}" hidden></label>
        </div>
      </div>
    `).join('') || '<div class="empty-note">目前沒有資訊卡，請新增。</div>';
    wrap.querySelectorAll('[data-remove-hero-info]').forEach(btn => btn.addEventListener('click', () => { data.site.heroInfoItems.splice(Number(btn.dataset.removeHeroInfo), 1); renderHeroInfoEditor(); }));
    wrap.querySelectorAll('[data-move-hero-info-up]').forEach(btn => btn.addEventListener('click', () => { moveItem(data.site.heroInfoItems, Number(btn.dataset.moveHeroInfoUp), -1); renderHeroInfoEditor(); }));
    wrap.querySelectorAll('[data-move-hero-info-down]').forEach(btn => btn.addEventListener('click', () => { moveItem(data.site.heroInfoItems, Number(btn.dataset.moveHeroInfoDown), 1); renderHeroInfoEditor(); }));
    wrap.querySelectorAll('[data-hero-info-label]').forEach(input => input.addEventListener('input', e => data.site.heroInfoItems[Number(e.target.dataset.heroInfoLabel)].label = e.target.value));
    wrap.querySelectorAll('[data-hero-info-value]').forEach(input => input.addEventListener('input', e => data.site.heroInfoItems[Number(e.target.dataset.heroInfoValue)].value = e.target.value));
    wrap.querySelectorAll('[data-hero-info-link]').forEach(input => input.addEventListener('input', e => data.site.heroInfoItems[Number(e.target.dataset.heroInfoLink)].link = e.target.value));
    wrap.querySelectorAll('[data-hero-info-linktext]').forEach(input => input.addEventListener('input', e => data.site.heroInfoItems[Number(e.target.dataset.heroInfoLinktext)].linkText = e.target.value));
    wrap.querySelectorAll('[data-hero-info-image]').forEach(input => input.addEventListener('input', e => data.site.heroInfoItems[Number(e.target.dataset.heroInfoImage)].image = e.target.value));
    wrap.querySelectorAll('[data-hero-info-hidden]').forEach(input => input.addEventListener('change', e => data.site.heroInfoItems[Number(e.target.dataset.heroInfoHidden)].hidden = e.target.checked));
    wrap.querySelectorAll('[data-hero-info-file]').forEach(input => input.addEventListener('change', e => {
      const idx = Number(e.target.dataset.heroInfoFile);
      readImageFile(e.target.files[0], (src) => {
        data.site.heroInfoItems[idx].image = src;
        renderHeroInfoEditor();
      });
    }));
  }

  function escapeHtml(str){
    return String(str || '').replace(/[&<>"']/g, s => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[s]));
  }
  function fieldHtml(field, value){
    if (field.type === 'textarea') return `<label>${field.label}<textarea class="input" data-key="${field.key}">${escapeHtml(value || '')}</textarea></label>`;
    if (field.type === 'checkbox') return `<label class="check-row"><input type="checkbox" data-key="${field.key}" ${value ? 'checked' : ''} /> ${field.label}</label>`;
    return `<label>${field.label}<input class="input" data-key="${field.key}" value="${escapeHtml(value || '')}" /></label>`;
  }
  function addRow(container, cfg, values={}){
    const item = document.createElement('div');
    item.className = 'list-item';
    const supportsMedia = cfg.supportsMedia !== false;
    const supportsVideo = cfg.supportsVideo === true;
    const mediaHtml = supportsMedia ? `
      <div class="row-2 compact-grid">
        <label>連結<input class="input" data-key="link" value="${escapeHtml(values.link || values.url || '')}" placeholder="例如 event.html 或 https://..." /></label>
        <label>按鈕文字<input class="input" data-key="linkText" value="${escapeHtml(values.linkText || '')}" placeholder="例如 了解更多" /></label>
      </div>
      <label>圖片路徑或 base64<input class="input" data-key="image" value="${escapeHtml(values.image || '')}" placeholder="可貼上圖片網址，或直接用下方上傳圖片" /></label>
      ${supportsVideo ? `<label>YouTube 影片連結<input class="input" data-key="videoUrl" value="${escapeHtml(values.videoUrl || '')}" placeholder="可貼上 YouTube 影片網址"></label>` : ``}
      <label>上傳圖片<input class="input list-file" type="file" accept="image/*" /></label>
      <div class="upload-help">支援本機上傳；圖片會儲存在目前瀏覽器中。</div>
      <div class="image-preview" ${values.image ? '' : 'style="display:none"'}><img src="${escapeHtml(values.image || '')}" alt="預覽"></div>
      <label class="check-row"><input type="checkbox" data-key="hidden" ${values.hidden ? 'checked' : ''} /> 隱藏此項目</label>
    ` : '';
    item.innerHTML = `
      <div class="list-item-head">
        <strong>${cfg.title}</strong>
        <div class="inline-actions">
          <button class="small-btn move-up" type="button">上移</button>
          <button class="small-btn move-down" type="button">下移</button>
          <button class="small-btn danger" type="button">刪除</button>
        </div>
      </div>
      <div class="editor-grid">
        ${cfg.inputs.map(field => fieldHtml(field, values[field.key])).join('')}
        ${mediaHtml}
      </div>
    `;
    qs('.danger', item).addEventListener('click', () => item.remove());
    qs('.move-up', item).addEventListener('click', () => {
      const prev = item.previousElementSibling;
      if (prev) container.insertBefore(item, prev);
    });
    qs('.move-down', item).addEventListener('click', () => {
      const next = item.nextElementSibling;
      if (next) container.insertBefore(next, item);
    });
    if (supportsMedia){
      const imageInput = item.querySelector('[data-key="image"]');
      const preview = item.querySelector('.image-preview');
      const previewImg = preview.querySelector('img');
      function refreshPreview(val){
        if (val){ preview.style.display = ''; previewImg.src = val; }
        else preview.style.display = 'none';
      }
      imageInput.addEventListener('input', () => refreshPreview(imageInput.value.trim()));
      item.querySelector('.list-file').addEventListener('change', (e) => {
        const file = e.target.files[0];
        if (!file) return;
        const reader = new FileReader();
        reader.onload = () => {
          imageInput.value = String(reader.result || '');
          refreshPreview(imageInput.value);
        };
        reader.readAsDataURL(file);
      });
    }
    container.appendChild(item);
  }
  function readList(container){
    return [...container.querySelectorAll('.list-item')].map(item => {
      const out = {};
      item.querySelectorAll('[data-key]').forEach(input => {
        out[input.dataset.key] = input.type === 'checkbox' ? input.checked : input.value;
      });
      if (out.url && !out.link) out.link = out.url;
      return out;
    }).filter(v => Object.entries(v).some(([k,val]) => k !== 'hidden' && val));
  }
  function renderLists(){
    const cfgs = [
      ['carouselEditor', data.home.carouselSlides, {title:'輪播項目', supportsVideo:true, inputs:[{label:'輪播標題', key:'title'},{label:'圖片說明文字', key:'caption', type:'textarea'}]}, 'addCarouselSlide'],
      ['statsEditor', data.home.stats, {title:'首頁統計', inputs:[{label:'標題', key:'label'},{label:'內容', key:'value'}]}, 'addStat'],
      ['featureEditor', data.home.features, {title:'首頁特色', supportsVideo:true, inputs:[{label:'標題', key:'title'},{label:'說明', key:'text', type:'textarea'}]}, 'addFeature'],
      ['registrationEditor', data.home.registrations, {title:'報名資訊', inputs:[{label:'標題', key:'title'},{label:'說明', key:'text', type:'textarea'}]}, 'addRegistration'],
      ['aboutEditor', data.about.cards, {title:'關於卡片', inputs:[{label:'上方標籤', key:'label'},{label:'標題', key:'title'},{label:'說明', key:'text', type:'textarea'}]}, 'addAboutCard'],
      ['typesEditor', data.educationTypes, {title:'特教領域', inputs:[{label:'名稱', key:'name'},{label:'說明', key:'summary', type:'textarea'}]}, 'addType'],
      ['newsEditor', data.news, {title:'最新消息', inputs:[{label:'日期', key:'date'},{label:'標題', key:'title'},{label:'摘要', key:'summary', type:'textarea'}]}, 'addNews'],
      ['scheduleEditor', data.event.schedule, {title:'活動時程', inputs:[{label:'時間', key:'time'},{label:'內容', key:'item'}]}, 'addSchedule'],
      ['boothEditor', data.event.booths, {title:'攤位資料', inputs:[{label:'名稱', key:'name'},{label:'分類', key:'category'},{label:'說明', key:'desc', type:'textarea'}]}, 'addBooth'],
      ['sponsorEditor', data.sponsors, {title:'贊助單位', inputs:[{label:'名稱', key:'name'},{label:'層級', key:'level'}]}, 'addSponsor']
    ];
    cfgs.forEach(([editorId, arr, fieldCfg, addBtnId]) => {
      const wrap = el(editorId); if (!wrap) return;
      wrap.innerHTML = '';
      (arr || []).forEach(v => addRow(wrap, fieldCfg, v));
      el(addBtnId).onclick = () => addRow(wrap, fieldCfg, {});
    });
  }
  function collectLists(){
    data.home.carouselSlides = readList(el('carouselEditor'));
    data.home.stats = readList(el('statsEditor'));
    data.home.features = readList(el('featureEditor'));
    data.home.registrations = readList(el('registrationEditor'));
    data.about.cards = readList(el('aboutEditor'));
    data.educationTypes = readList(el('typesEditor'));
    data.news = readList(el('newsEditor'));
    data.event.schedule = readList(el('scheduleEditor'));
    data.event.booths = readList(el('boothEditor'));
    data.sponsors = readList(el('sponsorEditor'));
  }
  function bindToolbar(){
    el('saveAll').onclick = () => {
      collectLists();
      data.admin.lastUpdated = new Date().toISOString().slice(0,10);
      saveSiteData(data);
      alert('已儲存網站資料。前台重新整理後就會同步更新。');
      el('lastUpdated').textContent = data.admin.lastUpdated || '-';
    };
    el('previewSite').onclick = () => window.open('index.html', '_blank');
    el('exportJson').onclick = () => {
      collectLists();
      const blob = new Blob([JSON.stringify(data, null, 2)], {type:'application/json'});
      const a = document.createElement('a');
      a.href = URL.createObjectURL(blob);
      a.download = 'angel-site-data.json';
      a.click();
      setTimeout(() => URL.revokeObjectURL(a.href), 1000);
    };
    el('importJson').addEventListener('change', async (e) => {
      const file = e.target.files[0];
      if (!file) return;
      const text = await file.text();
      try{
        data = JSON.parse(text);
        saveSiteData(data);
        location.reload();
      }catch(err){
        alert('匯入失敗，請確認 JSON 格式正確。');
      }
    });
    el('resetSite').onclick = () => {
      if(confirm('確定要還原成預設網站內容嗎？')) resetSiteData();
    };
    el('logoutBtn').onclick = () => {
      sessionStorage.removeItem('angel_admin_ok');
      guard();
    };
  }
  function bindLogin(){
    el('loginForm').addEventListener('submit', (e) => {
      e.preventDefault();
      const pwd = el('loginPassword').value;
      const currentData = getSiteData();
      if (pwd === (currentData.admin.password || 'admin1234')){
        sessionStorage.setItem('angel_admin_ok', '1');
        guard();
      } else alert('密碼錯誤');
    });
  }
  document.addEventListener('DOMContentLoaded', () => {
    bindLogin();
    renderNav();
    bindSimple();
    renderLists();
    bindToolbar();
    el('lastUpdated').textContent = data.admin.lastUpdated || '-';
    guard();
  });
})();
