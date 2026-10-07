async function generateBrat() {
  const textInput = document.getElementById('bratText').value.trim();
  const loader = document.getElementById('bratLoader');
  const resultCard = document.getElementById('bratResultCard');
  const mediaBox = document.getElementById('bratMediaBox');
  const downloadButtons = document.getElementById('bratDownloadButtons');

  if (!textInput) { alert('Harap masukkan teks!'); return; }

  loader.style.display = 'block';
  resultCard.style.display = 'none';
  mediaBox.innerHTML = '';
  downloadButtons.innerHTML = '';

  const imageUrl = `https://api.ikyyxd.my.id/canvas/bratv1?apikey=kyzz&text=${encodeURIComponent(textInput)}`;

  try {
    const img = new Image();
    img.onload = function() {
      mediaBox.innerHTML = `<img src="${imageUrl}" alt="Brat">`;
      downloadButtons.innerHTML = `<button class="dl-btn primary" onclick="downloadFile('${imageUrl}', 'brat.png')">${ICONS.download} Download</button>`;
      resultCard.style.display = 'block';
      loader.style.display = 'none';
    };
    img.onerror = function() {
      alert('Gagal memuat gambar. Coba lagi!');
      loader.style.display = 'none';
    };
    img.src = imageUrl;
  } catch (error) {
    console.error(error);
    alert('Gagal membuat Brat.');
    loader.style.display = 'none';
  }
}