async function fetchTikTok() {
  const urlInput = document.getElementById('tiktokUrl').value.trim();
  const loader = document.getElementById('loader');
  const resultCard = document.getElementById('resultCard');
  const mediaBox = document.getElementById('mediaBox');
  const captionText = document.getElementById('captionText');
  const downloadButtons = document.getElementById('downloadButtons');
  const profileHeader = document.getElementById('tiktokProfileHeader');

  if (!urlInput) { alert('Harap masukkan URL TikTok!'); return; }

  loader.style.display = 'block';
  resultCard.style.display = 'none';
  mediaBox.innerHTML = '';
  downloadButtons.innerHTML = '';
  profileHeader.innerHTML = '';

  try {
    const apiUrl = `https://www.tikwm.com/api/?url=${encodeURIComponent(urlInput)}`;
    const res = await fetch(apiUrl);
    const json = await res.json();
    if (json.code !== 0 || !json.data) throw new Error(json.msg || 'Data tidak ditemukan');

    const data = json.data;
    captionText.innerText = data.title || 'Tanpa Judul';

    const author = data.author || {};
    const avatarUrl = author.avatar || '';
    const displayName = author.nickname || 'TikTok User';
    const username = author.unique_id ? '@' + author.unique_id : '';

    profileHeader.innerHTML = `
      <div class="profile-header-avatar">
        ${avatarUrl ? `<img src="${avatarUrl}" alt="Avatar" onerror="this.parentNode.innerHTML='';">` : ''}
      </div>
      <div class="profile-header-info">
        <div class="profile-header-name">${displayName}</div>
        <div class="profile-header-username">${username || '-'}</div>
      </div>
    `;

    const infoHtml = `
      <div class="info-text">
        <div class="info-item">${ICONS.heart}<span>${data.digg_count || 0}</span></div>
        <div class="info-item">${ICONS.comment}<span>${data.comment_count || 0}</span></div>
        <div class="info-item">${ICONS.share}<span>${data.share_count || 0}</span></div>
        <div class="info-item">${ICONS.play}<span>${data.play_count || 0}</span></div>
      </div>
    `;

    const isSlide = data.images && Array.isArray(data.images) && data.images.length > 0;

    if (isSlide) {
      const slideUrls = data.images;
      let carouselHtml = `
        <div class="carousel-wrapper">
          <div class="slide-carousel" id="carouselScroll">
            ${slideUrls.map(url => `<img src="${url}" alt="Slide">`).join('')}
          </div>
          <div class="slide-badge">${slideUrls.length} Slide</div>
          <div class="carousel-nav">
            <button class="carousel-btn" id="carouselPrevBtn" onclick="carouselPrev()">${ICONS.prev} Prev</button>
            <div class="carousel-counter" id="carouselCounter">1 / ${slideUrls.length}</div>
            <button class="carousel-btn" id="carouselNextBtn" onclick="carouselNext()">Next ${ICONS.next}</button>
          </div>
        </div>
      `;
      mediaBox.innerHTML = carouselHtml;

      let btns = infoHtml;
      btns += `<button class="dl-btn primary" onclick="downloadAllSlides()">${ICONS.layers} Download Semua Slide (${slideUrls.length})</button>`;
      slideUrls.forEach((url, idx) => {
        btns += `<button class="dl-btn" onclick="downloadFile('${url}', 'tiktok_slide_${data.id || 'x'}_${idx+1}.jpg')">${ICONS.image} Slide ${idx+1}</button>`;
      });
      if (data.music) {
        btns += `<button class="dl-btn" onclick="downloadFile('${data.music}', 'tiktok_audio_${data.id || 'audio'}.mp3')">${ICONS.music} Audio</button>`;
      }
      downloadButtons.innerHTML = btns;
      window._tiktokSlides = slideUrls;
      window._tiktokItemId = data.id || 'slide';
      setTimeout(initCarousel, 100);
    } else {
      const videoUrl = data.play || data.wmplay;
      const coverUrl = data.cover || data.origin_cover || '';
      if (!videoUrl) throw new Error('Link video tidak ditemukan');
      mediaBox.innerHTML = `<video controls poster="${coverUrl}" src="${videoUrl}"></video>`;

      let btns = infoHtml;
      btns += `<button class="dl-btn primary" onclick="downloadFile('${videoUrl}', 'tiktok_${data.id || 'video'}.mp4')">${ICONS.download} Download Video HD</button>`;
      if (data.music) {
        btns += `<button class="dl-btn" onclick="downloadFile('${data.music}', 'tiktok_audio_${data.id || 'audio'}.mp3')">${ICONS.music} Audio</button>`;
      }
      downloadButtons.innerHTML = btns;
    }
    resultCard.style.display = 'block';
  } catch (error) {
    console.error(error);
    alert('Gagal mengambil data TikTok!');
  } finally {
    loader.style.display = 'none';
  }
}

async function downloadAllSlides() {
  const slides = window._tiktokSlides || [];
  const itemId = window._tiktokItemId || 'slide';
  if (slides.length === 0) return;
  for (let i = 0; i < slides.length; i++) {
    await downloadFile(slides[i], `tiktok_slide_${itemId}_${i+1}.jpg`);
    await new Promise(r => setTimeout(r, 800));
  }
}