export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  
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
  
  const apiKey = process.env.BETABOTZ_API_KEY;
  
  if (!apiKey) {
    return res.status(500).json({
      status: false,
      message: 'API key tidak dikonfigurasi di server'
    });
  }
  
  try {
    let clean = String(username).trim();
    if (clean.includes('instagram.com/')) {
      const match = clean.match(/instagram\.com\/([a-zA-Z0-9._]+)/);
      if (match) clean = match[1];
    }
    clean = clean.replace(/^@/, '');
    
    // URL asli Betabotz
    const betabotzUrl = `https://api.betabotz.eu.org/api/stalk/ig?apikey=${apiKey}&username=${encodeURIComponent(clean)}`;
    
    // Bungkus dengan proxy CORS (biar lolos Cloudflare)
    // Pakai allorigins.win — proxy gratis yang sering lolos Cloudflare
    const proxyUrl = `https://api.allorigins.win/raw?url=${encodeURIComponent(betabotzUrl)}`;
    
    const response = await fetch(proxyUrl, {
      method: 'GET',
      headers: {
        'User-Agent': 'Mozilla/5.0 (Linux; Android 10; K) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Mobile Safari/537.36',
        'Accept': 'application/json, text/plain, */*',
        'Accept-Language': 'id-ID,id;q=0.9,en;q=0.8'
      }
    });
    
    const text = await response.text();
    
    let data;
    try {
      data = JSON.parse(text);
    } catch (e) {
      return res.status(200).json({
        status: false,
        message: 'Proxy gagal — Betabotz masih blokir',
        preview: text.substring(0, 300)
      });
    }
    
    return res.status(200).json(data);
    
  } catch (err) {
    console.error('Error:', err);
    return res.status(500).json({
      status: false,
      message: 'Gagal ambil data: ' + err.message
    });
  }
}
