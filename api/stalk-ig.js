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
    
    const apiUrl = `https://api.betabotz.eu.org/api/stalk/ig?apikey=${apiKey}&username=${encodeURIComponent(clean)}`;
    
    // Headers browser LENGKAP biar lolos Cloudflare
    const response = await fetch(apiUrl, {
      method: 'GET',
      headers: {
        'User-Agent': 'Mozilla/5.0 (Linux; Android 10; K) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Mobile Safari/537.36',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,*/*;q=0.8',
        'Accept-Language': 'id-ID,id;q=0.9,en-US;q=0.8,en;q=0.7',
        'Accept-Encoding': 'gzip, deflate, br',
        'Connection': 'keep-alive',
        'Upgrade-Insecure-Requests': '1',
        'Sec-Fetch-Dest': 'document',
        'Sec-Fetch-Mode': 'navigate',
        'Sec-Fetch-Site': 'none',
        'Sec-Fetch-User': '?1',
        'Cache-Control': 'max-age=0',
        'Referer': 'https://www.google.com/'
      }
    });
    
    const text = await response.text();
    
    // Cek apakah response JSON atau HTML
    let data;
    try {
      data = JSON.parse(text);
    } catch (e) {
      // Response bukan JSON → kemungkinan Cloudflare
      const isCloudflare = text.includes('Just a moment') || 
                          text.includes('cf-browser-verification') ||
                          text.includes('<!DOCTYPE');
      
      return res.status(200).json({
        status: false,
        message: isCloudflare 
          ? 'Cloudflare challenge: Betabotz memblokir request dari server. Pakai Apps Script saja.'
          : 'Response bukan JSON: ' + text.substring(0, 200),
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
