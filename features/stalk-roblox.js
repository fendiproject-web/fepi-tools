async function fetchRoblox() {
  const usernameInput = document.getElementById('robloxUsername').value.trim();
  const loader = document.getElementById('robloxLoader');
  const resultCard = document.getElementById('robloxResultCard');
  const avatarBox = document.getElementById('robloxAvatarBox');
  const detailsBox = document.getElementById('robloxDetailsBox');

  if (!usernameInput) { alert('Harap masukkan Username Roblox!'); return; }

  loader.style.display = 'block';
  resultCard.style.display = 'none';

  const apiUrl = `https://api.ikyyxd.my.id/stalk/roblox?username=${encodeURIComponent(usernameInput)}`;

  try {
    const res = await fetch(apiUrl);
    const json = await res.json();
    if (!json.status || !json.result) throw new Error('Data tidak ditemukan.');

    const acc = json.result.account || {};
    const presence = json.result.presence || {};
    const stats = json.result.stats || {};

    if (acc.profilePicture) {
      avatarBox.style.display = 'block';
      avatarBox.innerHTML = `<img src="${acc.profilePicture}" alt="Roblox Avatar" onerror="this.parentNode.style.display='none'">`;
    } else {
      avatarBox.style.display = 'none';
    }

    detailsBox.innerHTML = `
      <div class="stalk-info-item"><span class="label">Display Name</span><span class="value">${acc.displayName || '-'}</span></div>
      <div class="stalk-info-item"><span class="label">Username</span><span class="value">@${acc.username || '-'}</span></div>
      <div class="stalk-info-item"><span class="label">Status</span><span class="value">${presence.isOnline ? 'Online' : 'Offline'}</span></div>
      <div class="stalk-info-item"><span class="label">Aktivitas</span><span class="value">${presence.recentGame || '-'}</span></div>
      <div class="stalk-info-item"><span class="label">Teman</span><span class="value">${stats.friendCount ?? 0}</span></div>
      <div class="stalk-info-item"><span class="label">Pengikut</span><span class="value">${stats.followers ?? 0}</span></div>
      <div class="stalk-info-item"><span class="label">Mengikuti</span><span class="value">${stats.following ?? 0}</span></div>
      <div class="stalk-info-item"><span class="label">Banned</span><span class="value">${acc.isBanned ? 'Ya' : 'Tidak'}</span></div>
      <div class="stalk-info-item"><span class="label">Dibuat</span><span class="value">${formatDate(acc.created)}</span></div>
      <div class="stalk-info-item"><span class="label">Deskripsi</span><span class="value">${acc.description || '-'}</span></div>
    `;
    resultCard.style.display = 'block';
  } catch (error) {
    console.error(error);
    alert('Gagal mengambil data Roblox!');
  } finally {
    loader.style.display = 'none';
  }
}