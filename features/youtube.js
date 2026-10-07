async function fetchYouTube() {
  const urlInput = document.getElementById('youtubeUrl').value.trim();
  const loader = document.getElementById('youtubeLoader');
  const resultCard = document.getElementById('youtubeResultCard');
  const thumbBox = document.getElementById('ytThumbBox');
  const titleBox = document.getElementById('ytTitleBox');
  const infoBox = document.getElementById('ytInfoBox');
  const downloadButtons = document.getElementById('ytDownloadButtons');

  if (!urlInput) { alert('Harap masukkan URL YouTube!'); return; }

  loader.style.display = 'block';
  resultCard.style.display = 'none';
  thumbBox.innerHTML = '';
  downloadButtons.innerHTML = '';

  try {
    const [mp4Res, mp3Res] = await Promise.all([
      fetch(`https://api.ikyyxd.my.id/download/ytmp4?q=${encodeURIComponent(urlInput)}`).then(r => r.json()).catch(() => null),
      fetch(`https://api.ikyyxd.my.id/download/ytmp3?url=${encodeURIComponent(urlInput)}`).then(r => r.json()).catch(() => null)
    ]);

    if (!mp4Res?.status && !mp3Res?.status) throw new Error('Gagal ambil data.');

    const info = mp4Res?.result || mp3Res?.result || {};
    const title = info.title || 'Tanpa Judul';
    const thumbnail = info.thumbnail || (mp3Res?.result?.thumbnail) || '';
    const duration = info.duration || mp3Res?.result?.duration || null;
    const videoId = info.id || '';

    if (thumbnail) thumbBox.innerHTML = `<img src="${thumbnail}" alt="Thumbnail">`;
    titleBox.innerText = title;

    let infoHtml = '';
    if (duration) infoHtml += `<div class="info-item">${ICONS.play}<span>${formatDuration(duration)}</span></div>`;
    if (videoId) infoHtml += `<div class="info-item">${ICONS.layers}<span>${videoId}</span></div>`;
    infoBox.innerHTML = infoHtml;

    let btns = '';
    const safeTitle = title.substring(0, 30).replace(/[^a-zA-Z0-9]/g, '_');

    const videoUrl = mp4Res?.result?.VideoUrl?.url;
    if (videoUrl) {
      btns += `<button class="dl-btn primary" onclick="downloadFile('${videoUrl}', 'yt_${safeTitle}.mp4')">${ICONS.download} Video (MP4)</button>`;
    }

    const audioUrl = mp3Res?.result?.audio?.url;
    const audioQuality = mp3Res?.result?.audio?.quality || 'audio';
    if (audioUrl) {
      btns += `<button class="dl-btn" onclick="downloadFile('${audioUrl}', 'yt_${safeTitle}.webm')">${ICONS.music} Audio (${audioQuality})</button>`;
    }

    if (thumbnail) {
      btns += `<button class="dl-btn" onclick="downloadFile('${thumbnail}', 'yt_thumbnail_${videoId}.jpg')">${ICONS.image} Thumbnail</button>`;
    }

    downloadButtons.innerHTML = btns || '<div class="stalk-info-item"><span class="value">Tidak ada link</span></div>';
    resultCard.style.display = 'block';
  } catch (error) {
    console.error(error);
    alert('Gagal: ' + error.message);
  } finally {
    loader.style.display = 'none';
  }
}