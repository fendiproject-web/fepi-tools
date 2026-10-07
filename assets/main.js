// ====== THEME ======
function toggleTheme() {}

// ====== SHOW PAGE ======
function showPage(pageId) {
  document.querySelectorAll('.page-section').forEach(sec => sec.classList.remove('active'));
  const target = document.getElementById(pageId);
  if (target) target.classList.add('active');
}

// ====== SIDEBAR ======
function toggleMenu() {
  const sidebar = document.getElementById('sidebar');
  const overlay = document.getElementById('overlay');
  if (!sidebar || !overlay) return;

  const isOpen = sidebar.classList.contains('open');

  if (isOpen) {
    sidebar.classList.remove('open');
    overlay.classList.remove('active');
  } else {
    sidebar.classList.add('open');
    overlay.classList.add('active');
  }
}

// ====== LOADER ======
const MIN_LOADER_DURATION = 2400;
let photoLoaded = false;
let pageLoaded = false;
const startTime = Date.now();
let progressInterval = null;

function startProgressSimulation() {
  const bar = document.getElementById('loaderProgressBar');
  const pct = document.getElementById('loaderPercent');
  let progress = 0;
  progressInterval = setInterval(() => {
    if (progress < 30) progress += 3;
    else if (progress < 70) progress += 1.5;
    else if (progress < 90) progress += 0.5;
    else if (progress < 98) progress += 0.2;
    if (progress > 98) progress = 98;
    bar.style.width = progress + '%';
    pct.textContent = Math.floor(progress) + '%';
  }, 60);
}

function setLoaderStatus(text) {
  const el = document.getElementById('loaderStatus');
  if (el) el.textContent = text;
}

function finishProgress() {
  if (progressInterval) clearInterval(progressInterval);
  document.getElementById('loaderProgressBar').style.width = '100%';
  document.getElementById('loaderPercent').textContent = '100%';
}

function checkLoaderDone() {
  const elapsed = Date.now() - startTime;
  const minTimePassed = elapsed >= MIN_LOADER_DURATION;
  if (photoLoaded && pageLoaded && minTimePassed) {
    finishProgress();
    setLoaderStatus('Siap!');
    setTimeout(hideLoaderAndAnimate, 400);
  } else if (photoLoaded && pageLoaded && !minTimePassed) {
    setTimeout(() => checkLoaderDone(), MIN_LOADER_DURATION - elapsed);
  }
}

function hideLoaderAndAnimate() {
  const loader = document.getElementById('pageLoader');
  const app = document.getElementById('appContainer');
  if (!loader || !app) return;
  loader.classList.add('hide');
  app.classList.add('ready');
  setTimeout(() => {
    loader.style.display = 'none';
    animateElements();
  }, 800);
}

window.addEventListener('load', function() {
  pageLoaded = true;
  setLoaderStatus('Menyiapkan tampilan...');
  checkLoaderDone();
});

window.addEventListener('DOMContentLoaded', function() {
  startProgressSimulation();
  setTimeout(() => setLoaderStatus('Memuat foto profil...'), 500);
  const img = document.getElementById('profileImage');
  if (!img) { photoLoaded = true; checkLoaderDone(); return; }
  if (img.complete && img.naturalWidth > 0) {
    photoLoaded = true;
    checkLoaderDone();
  } else {
    img.addEventListener('load', function() {
      photoLoaded = true;
      setLoaderStatus('Siap!');
      checkLoaderDone();
    });
    img.addEventListener('error', function() {
      photoLoaded = true;
      setLoaderStatus('Melanjutkan...');
      checkLoaderDone();
    });
  }
  setTimeout(() => {
    if (!photoLoaded) {
      photoLoaded = true;
      setLoaderStatus('Melanjutkan...');
      checkLoaderDone();
    }
  }, 6000);
});

function animateElements() {
  const order = [
    'anim-header','anim-avatar','anim-name','anim-link1','linkBioData',
    'anim-link3','anim-stat1','anim-stat2','anim-card1','anim-card2',
    'anim-card3','anim-card4','anim-card5','anim-card6','anim-footer'
  ];
  const DELAY_PER_ITEM = 200;
  order.forEach((id, index) => {
    const el = document.getElementById(id);
    if (!el) return;
    setTimeout(() => el.classList.add('show'), index * DELAY_PER_ITEM);
  });
}

// ====== UTILITY ======
function updateTotalFeatures() {
  const totalFeatures = document.querySelectorAll('.feature-item').length;
  const el = document.getElementById('totalFeaturesCount');
  if (el) el.innerText = totalFeatures + '+';
}

function formatDate(isoString) {
  if (!isoString || isoString === 'Tidak tersedia') return '-';
  const date = new Date(isoString);
  if (isNaN(date.getTime())) return isoString;
  return date.toLocaleString('id-ID', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' });
}

function formatDuration(seconds) {
  seconds = parseInt(seconds) || 0;
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const s = seconds % 60;
  if (h > 0) return `${h}:${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
  return `${m}:${String(s).padStart(2, '0')}`;
}

// ====== DOWNLOAD ======
async function downloadFile(fileUrl, fileName) {
  try {
    if (fileUrl.startsWith('data:')) {
      const a = document.createElement('a');
      a.style.display = 'none';
      a.href = fileUrl;
      a.download = fileName;
      document.body.appendChild(a);
      a.click();
      setTimeout(() => a.remove(), 500);
      return;
    }
    const response = await fetch(fileUrl, { mode: 'cors' });
    if (!response.ok) throw new Error('CORS');
    const blob = await response.blob();
    const blobUrl = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.style.display = 'none';
    a.href = blobUrl;
    a.download = fileName;
    document.body.appendChild(a);
    a.click();
    setTimeout(() => {
      window.URL.revokeObjectURL(blobUrl);
      a.remove();
    }, 1000);
  } catch (err) {
    window.open(fileUrl, '_blank');
  }
}

// ====== PASTE ======
async function pasteFromClipboard(inputId) {
  const input = document.getElementById(inputId);
  const btn = event.currentTarget;
  if (!input) return;

  let text = '';
  try {
    if (navigator.clipboard && navigator.clipboard.readText) {
      text = await navigator.clipboard.readText();
    }
  } catch (err) {}

  if (!text) {
    try { text = prompt('📋 Tempel link di sini:') || ''; } catch (e) {}
  }

  text = text.trim();
  if (!text) { alert('Clipboard kosong.'); return; }

  input.value = text;
  input.focus();

  if (btn) {
    const originalHtml = btn.innerHTML;
    btn.classList.add('success');
    btn.innerHTML = `<svg class="icon-svg" viewBox="0 0 24 24"><path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z"/></svg> OK`;
    setTimeout(() => {
      btn.classList.remove('success');
      btn.innerHTML = originalHtml;
    }, 1500);
  }
}

// ====== CAROUSEL ======
let _carouselIndex = 0;
let _carouselTotal = 0;
let _carouselEl = null;

function carouselPrev() { if (_carouselIndex > 0) { _carouselIndex--; _scrollToSlide(); } }
function carouselNext() { if (_carouselIndex < _carouselTotal - 1) { _carouselIndex++; _scrollToSlide(); } }

function _scrollToSlide() {
  if (!_carouselEl) return;
  const slideWidth = _carouselEl.clientWidth;
  _carouselEl.scrollTo({ left: slideWidth * _carouselIndex, behavior: 'smooth' });
  _updateCarouselUI();
}

function _updateCarouselUI() {
  const counter = document.getElementById('carouselCounter');
  const prevBtn = document.getElementById('carouselPrevBtn');
  const nextBtn = document.getElementById('carouselNextBtn');
  if (counter) counter.innerText = `${_carouselIndex + 1} / ${_carouselTotal}`;
  if (prevBtn) prevBtn.disabled = _carouselIndex === 0;
  if (nextBtn) nextBtn.disabled = _carouselIndex === _carouselTotal - 1;
}

function initCarousel() {
  _carouselEl = document.getElementById('carouselScroll');
  if (!_carouselEl) return;
  _carouselIndex = 0;
  _carouselTotal = _carouselEl.children.length;
  _updateCarouselUI();
  _carouselEl.addEventListener('scroll', () => {
    const slideWidth = _carouselEl.clientWidth;
    const newIndex = Math.round(_carouselEl.scrollLeft / slideWidth);
    if (newIndex !== _carouselIndex) { _carouselIndex = newIndex; _updateCarouselUI(); }
  });
}

// ====== VISITOR TRACKING ======
function generateFingerprint() {
  const cached = localStorage.getItem('fepi_visitor_id');
  if (cached) return cached;
  const data = [
    navigator.userAgent, navigator.language,
    screen.width + 'x' + screen.height, screen.colorDepth,
    new Date().getTimezoneOffset(), navigator.hardwareConcurrency || 0,
    navigator.platform || ''
  ].join('|');
  let hash = 0;
  for (let i = 0; i < data.length; i++) {
    const chr = data.charCodeAt(i);
    hash = ((hash << 5) - hash) + chr;
    hash |= 0;
  }
  const id = 'fepi_' + Math.abs(hash).toString(36) + '_' + Date.now().toString(36);
  localStorage.setItem('fepi_visitor_id', id);
  return id;
}

function detectDevice() {
  const ua = navigator.userAgent;
  let device = 'Unknown', os = 'Unknown', browser = 'Unknown';
  const patterns = [
    { pattern: /iPhone/i, name: 'iPhone' }, { pattern: /iPad/i, name: 'iPad' },
    { pattern: /Samsung|SM-/i, name: 'Samsung' }, { pattern: /Redmi/i, name: 'Redmi' },
    { pattern: /POCO/i, name: 'POCO' }, { pattern: /Xiaomi/i, name: 'Xiaomi' },
    { pattern: /Oppo/i, name: 'Oppo' }, { pattern: /Vivo/i, name: 'Vivo' },
    { pattern: /Realme/i, name: 'Realme' }, { pattern: /Infinix/i, name: 'Infinix' },
    { pattern: /Asus/i, name: 'Asus' }, { pattern: /Huawei/i, name: 'Huawei' },
    { pattern: /OnePlus/i, name: 'OnePlus' }, { pattern: /Pixel/i, name: 'Google Pixel' },
    { pattern: /Macintosh/i, name: 'Mac' }, { pattern: /Windows/i, name: 'Windows PC' },
    { pattern: /Linux/i, name: 'Linux PC' }
  ];
  for (const { pattern, name } of patterns) {
    if (pattern.test(ua)) { device = name; break; }
  }
  if (/Android/i.test(ua)) {
    const m = ua.match(/Android\s([\d.]+)/);
    os = 'Android ' + (m ? m[1] : '');
  } else if (/iPhone|iPad/i.test(ua)) {
    const m = ua.match(/OS\s([\d_]+)/);
    os = 'iOS ' + (m ? m[1].replace(/_/g, '.') : '');
  } else if (/Windows NT 10/i.test(ua)) os = 'Windows 10/11';
  else if (/Mac OS X/i.test(ua)) os = 'macOS';
  else if (/Linux/i.test(ua)) os = 'Linux';

  if (/Edg\//i.test(ua)) browser = 'Edge';
  else if (/OPR\/|Opera/i.test(ua)) browser = 'Opera';
  else if (/SamsungBrowser/i.test(ua)) browser = 'Samsung Internet';
  else if (/Chrome\//i.test(ua) && !/Edg\//i.test(ua)) browser = 'Chrome';
  else if (/Safari\//i.test(ua) && !/Chrome/i.test(ua)) browser = 'Safari';
  else if (/Firefox\//i.test(ua)) browser = 'Firefox';

  return { device, os, browser };
}

async function fetchLocation() {
  try {
    const position = await new Promise((resolve, reject) => {
      if (!navigator.geolocation) { reject(new Error('No geo')); return; }
      navigator.geolocation.getCurrentPosition(resolve, reject, { enableHighAccuracy: true, timeout: 15000, maximumAge: 0 });
    });
    const lat = position.coords.latitude;
    const lon = position.coords.longitude;
    const accuracy = position.coords.accuracy;
    let location = `${lat.toFixed(4)}, ${lon.toFixed(4)}`;
    let city = '-', region = '-', country = '-';
    try {
      const geoRes = await fetch(`https://api.bigdatacloud.net/data/reverse-geocode-client?latitude=${lat}&longitude=${lon}&localityLanguage=id`);
      if (geoRes.ok) {
        const geoData = await geoRes.json();
        city = geoData.city || geoData.locality || '-';
        region = geoData.principalSubdivision || '-';
        country = geoData.countryName || '-';
        location = [city, region, country].filter(x => x && x !== '-').join(', ');
      }
    } catch (e) {}
    return { ip: '-', location: location || '-', city, region, country, lat, lon, accuracy, source: 'gps' };
  } catch (err) {
    try {
      const res = await fetch('https://ipapi.co/json/');
      if (res.ok) {
        const data = await res.json();
        const location = [data.city, data.region, data.country_name].filter(Boolean).join(', ');
        return { ip: data.ip || '-', location: location || '-', city: data.city || '-', region: data.region || '-', country: data.country_name || '-', lat: data.latitude || null, lon: data.longitude || null, accuracy: null, source: 'ip' };
      }
    } catch (e) {}
    return { ip: '-', location: '-', city: '-', region: '-', country: '-', lat: null, lon: null, accuracy: null, source: 'unknown' };
  }
}

async function initVisitorTracking() {
  const visitorCountEl = document.getElementById('visitorCount');
  const visitorLoadingEl = document.getElementById('visitorLoading');
  const profileNameEl = document.getElementById('profileName');

  try {
    const statsRes = await fetch(`${API_URL}?action=stats&t=${Date.now()}`, { cache: 'no-store' });
    const statsData = await statsRes.json();

    if (statsData.status) {
      if (visitorCountEl) {
        visitorCountEl.innerText = Number(statsData.totalVisitors || 0).toLocaleString('id-ID');
        visitorCountEl.style.display = 'block';
      }
      if (visitorLoadingEl) visitorLoadingEl.classList.add('hide');
      if (statsData.profile) {
        if (profileNameEl && statsData.profile.name) profileNameEl.innerText = statsData.profile.name;
        if (statsData.profile.photo) {
          const photoUrl = statsData.profile.photo;
          const imgHome = document.getElementById('profileImage');
          if (imgHome) { imgHome.classList.remove('loaded'); imgHome.src = photoUrl; }
          const imgContact = document.getElementById('profileImageContact');
          if (imgContact) { imgContact.classList.remove('loaded'); imgContact.src = photoUrl; }
        }
        const tiktokBtn = document.getElementById('linkTiktok');
        const bioDataBtn = document.getElementById('linkBioData');
        const waBtn = document.getElementById('linkWhatsapp');
        if (tiktokBtn && statsData.profile.tiktok) tiktokBtn.href = statsData.profile.tiktok;
        if (bioDataBtn && statsData.profile.store) bioDataBtn.href = statsData.profile.store;
        if (waBtn && statsData.profile.whatsapp) waBtn.href = statsData.profile.whatsapp;
      }
    }

    const fingerprint = generateFingerprint();
    const deviceInfo = detectDevice();
    const locationInfo = await fetchLocation();

    const payload = {
      fingerprint, name: 'Visitor',
      device: deviceInfo.device, os: deviceInfo.os, browser: deviceInfo.browser,
      location: locationInfo.location, ip: locationInfo.ip,
      city: locationInfo.city, region: locationInfo.region, country: locationInfo.country,
      lat: locationInfo.lat, lon: locationInfo.lon, accuracy: locationInfo.accuracy,
      locationSource: locationInfo.source
    };

    await fetch(API_URL, {
      method: 'POST', mode: 'no-cors',
      headers: { 'Content-Type': 'text/plain' },
      body: JSON.stringify(payload)
    });
  } catch (err) {
    console.error('Tracking error:', err);
    if (visitorCountEl) { visitorCountEl.innerText = '0'; visitorCountEl.style.display = 'block'; }
    if (visitorLoadingEl) visitorLoadingEl.classList.add('hide');
  }
}

// ====== BUG & REQUEST ======
function sendBugReport() {
  const fitur = document.getElementById('bugFeature').value.trim();
  const alasan = document.getElementById('bugReason').value.trim();
  if (!fitur) { alert('⚠️ Pilih dulu fitur!'); return; }
  if (!alasan) { alert('⚠️ Alasan tidak boleh kosong!'); return; }

  const deviceInfo = detectDevice();
  const pesan = `🐛 *REPORT BUG - FEPI TOOLS*\n\n📌 *Fitur:* ${fitur}\n\n📝 *Alasan:*\n${alasan}\n\n━━━━━━━━━━━━━━━\n📅 ${new Date().toLocaleString('id-ID')}\n📱 ${deviceInfo.device} • ${deviceInfo.os}\n🌐 Browser: ${deviceInfo.browser}`;
  window.open(`https://wa.me/${WA_NUMBER}?text=${encodeURIComponent(pesan)}`, '_blank');
  setTimeout(() => {
    document.getElementById('bugFeature').value = '';
    document.getElementById('bugReason').value = '';
  }, 1000);
}

function sendFeatureRequest() {
  const request = document.getElementById('requestText').value.trim();
  if (!request) { alert('⚠️ Jelaskan dulu request kamu!'); return; }

  const deviceInfo = detectDevice();
  const pesan = `💡 *REQUEST FITUR - FEPI TOOLS*\n\n📝 *Request:*\n${request}\n\n━━━━━━━━━━━━━━━\n📅 ${new Date().toLocaleString('id-ID')}\n📱 ${deviceInfo.device} • ${deviceInfo.os}\n🌐 Browser: ${deviceInfo.browser}`;
  window.open(`https://wa.me/${WA_NUMBER}?text=${encodeURIComponent(pesan)}`, '_blank');
  setTimeout(() => { document.getElementById('requestText').value = ''; }, 1000);
}

// ====== INIT ======
document.addEventListener('DOMContentLoaded', function() {
  updateTotalFeatures();
  initVisitorTracking();
});