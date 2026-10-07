async function fetchFreeFire() {
  const uidInput = document.getElementById('ffUid').value.trim();
  const loader = document.getElementById('ffLoader');
  const resultCard = document.getElementById('ffResultCard');
  const bannerBox = document.getElementById('ffBannerBox');
  const detailsBox = document.getElementById('ffDetailsBox');

  if (!uidInput) { alert('Harap masukkan UID FF!'); return; }

  loader.style.display = 'block';
  resultCard.style.display = 'none';

  const apiUrl = `https://api.ikyyxd.my.id/stalk/epepid?uid=${encodeURIComponent(uidInput)}`;

  try {
    const res = await fetch(apiUrl);
    const json = await res.json();
    if (!json.status || !json.data) throw new Error('Data tidak ditemukan.');

    const data = json.data;
    if (data.banner_image) {
      bannerBox.style.display = 'block';
      bannerBox.innerHTML = `<img src="${data.banner_image}" alt="FF Banner" onerror="this.parentNode.style.display='none'">`;
    } else {
      bannerBox.style.display = 'none';
    }

    detailsBox.innerHTML = `
      <div class="stalk-info-item"><span class="label">Nama</span><span class="value">${data.name || '-'}</span></div>
      <div class="stalk-info-item"><span class="label">UID</span><span class="value">${data.uid || '-'}</span></div>
      <div class="stalk-info-item"><span class="label">Level</span><span class="value">${data.level ?? '-'}</span></div>
      <div class="stalk-info-item"><span class="label">Region</span><span class="value">${data.region || '-'}</span></div>
      <div class="stalk-info-item"><span class="label">Likes</span><span class="value">${data.likes ? Number(data.likes).toLocaleString('id-ID') : '0'}</span></div>
      <div class="stalk-info-item"><span class="label">BR Point</span><span class="value">${data.br_rank_point ?? '-'}</span></div>
      <div class="stalk-info-item"><span class="label">CS Point</span><span class="value">${data.cs_rank_point ?? '-'}</span></div>
      <div class="stalk-info-item"><span class="label">Guild</span><span class="value">${data.guild_name || '-'}</span></div>
      <div class="stalk-info-item"><span class="label">Dibuat</span><span class="value">${formatDate(data.created_at)}</span></div>
      <div class="stalk-info-item"><span class="label">Login</span><span class="value">${formatDate(data.last_login)}</span></div>
    `;
    resultCard.style.display = 'block';
  } catch (error) {
    console.error(error);
    alert('Gagal mengambil data. Pastikan UID benar!');
  } finally {
    loader.style.display = 'none';
  }
}