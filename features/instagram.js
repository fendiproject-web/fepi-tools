async function fetchInstagram() {
  const urlInput = document.getElementById('igUrl').value.trim();
  const loader = document.getElementById('igLoader');
  const resultCard = document.getElementById('igResultCard');
  const mediaBox = document.getElementById('igMediaBox');
  const downloadButtons = document.getElementById('igDownloadButtons');

  if (!urlInput) { alert('Harap masukkan URL Instagram!'); return; }

  loader.style.display = 'block';
  resultCard.style.display = 'none';
  mediaBox.innerHTML = '';
  downloadButtons.innerHTML = '';

  const apiUrl = `https://api.ikyyxd.my.id/download/instagram?apikey=kyzz&query=${encodeURIComponent(urlInput)}`;

  try {
    const res = await fetch(apiUrl);
    const json = await res.json();
    if (!json.status || !json.result || !json.result.download_urls) throw new Error('Data tidak ditemukan');

    const uniqueUrls = [...new Set(json.result.download_urls)];
    if (uniqueUrls.length === 0) throw new Error('Media tidak ditemukan');

    const firstUrl = uniqueUrls[0];
    const isVideo = firstUrl.includes('.mp4') || firstUrl.includes('video');
    const isCarousel = uniqueUrls.length > 1;

    if (isVideo && !isCarousel) {
      mediaBox.innerHTML = `<video controls src="${uniqueUrls[0]}"></video>`;
      downloadButtons.innerHTML = `<button class="dl-btn primary" onclick="downloadFile('${uniqueUrls[0]}', 'instagram_video.mp4')">${ICONS.download} Download Video</button>`;
    } else if (!isVideo && !isCarousel) {
      mediaBox.innerHTML = `<img src="${uniqueUrls[0]}" alt="Instagram Photo">`;
      downloadButtons.innerHTML = `<button class="dl-btn primary" onclick="downloadFile('${uniqueUrls[0]}', 'instagram_photo.jpg')">${ICONS.download} Download Foto</button>`;
    } else {
      let carouselItems = '';
      uniqueUrls.forEach(url => {
        const itemIsVideo = url.includes('.mp4') || url.includes('video');
        carouselItems += itemIsVideo ? `<video controls src="${url}"></video>` : `<img src="${url}" alt="Media">`;
      });
      let carouselHtml = `
        <div class="carousel-wrapper">
          <div class="slide-carousel" id="carouselScroll">${carouselItems}</div>
          <div class="slide-badge">${uniqueUrls.length} Media</div>
          <div class="carousel-nav">
            <button class="carousel-btn" id="carouselPrevBtn" onclick="carouselPrev()">${ICONS.prev} Prev</button>
            <div class="carousel-counter" id="carouselCounter">1 / ${uniqueUrls.length}</div>
            <button class="carousel-btn" id="carouselNextBtn" onclick="carouselNext()">Next ${ICONS.next}</button>
          </div>
        </div>
      `;
      mediaBox.innerHTML = carouselHtml;

      let btns = `<button class="dl-btn primary" onclick="downloadAllIgMedia()">${ICONS.layers} Download Semua (${uniqueUrls.length})</button>`;
      uniqueUrls.forEach((url, idx) => {
        const itemIsVideo = url.includes('.mp4') || url.includes('video');
        const ext = itemIsVideo ? 'mp4' : 'jpg';
        const label = itemIsVideo ? 'Video' : 'Foto';
        btns += `<button class="dl-btn" onclick="downloadFile('${url}', 'instagram_${label.toLowerCase()}_${idx+1}.${ext}')">${label} ${idx+1}</button>`;
      });
      downloadButtons.innerHTML = btns;
      window._igMediaUrls = uniqueUrls;
      setTimeout(initCarousel, 100);
    }
    resultCard.style.display = 'block';
  } catch (error) {
    console.error(error);
    alert('Gagal mengambil data Instagram!');
  } finally {
    loader.style.display = 'none';
  }
}

async function downloadAllIgMedia() {
  const urls = window._igMediaUrls || [];
  if (urls.length === 0) return;
  for (let i = 0; i < urls.length; i++) {
    const itemIsVideo = urls[i].includes('.mp4') || urls[i].includes('video');
    const ext = itemIsVideo ? 'mp4' : 'jpg';
    await downloadFile(urls[i], `instagram_media_${i+1}.${ext}`);
    await new Promise(r => setTimeout(r, 800));
  }
}