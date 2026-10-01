export default async function handler(req, res) {
  // CORS headers — biar HTML bisa akses
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  
  // Handle preflight OPTIONS
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }
  
  const username = req.query.username;
  
  if (!username) {
    return res.status(400).json({
      status: false,
      message: 'Username tidak boleh kosong'
    });
  }
  
  // API key diambil dari Environment Variable Vercel
  // TIDAK kelihatan di kode ini, aman!
  const apiKey = process.env.BETABOTZ_API_KEY;
  
  if (!apiKey) {
    return res.status(500).json({
      status: false,
      message: 'API key tidak dikonfigurasi di server'
    });
  }
  
  try {
    // Clean username (hapus @, URL, dll)
    let clean = String(username).trim();
    if (clean.includes('instagram.com/')) {
      const match = clean.match(/instagram\.com\/([a-zA-Z0-9._]+)/);
      if (match) clean = match[1];
    }
    clean = clean.replace(/^@/, '');
    
    const apiUrl = `https://api.betabotz.eu.org/api/stalk/ig?apikey=${apiKey}&username=${encodeURIComponent(clean)}`;
    
    const response = await fetch(apiUrl, {
      method: 'GET',
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        'Accept': 'application/json'
      }
    });
    
    const data = await response.json();
    
    // Kirim balik ke frontend (TANPA api key)
    return res.status(200).json(data);
    
  } catch (err) {
    console.error('Error:', err);
    return res.status(500).json({
      status: false,
      message: 'Gagal ambil data: ' + err.message
    });
  }
}
