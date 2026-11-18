const http = require('http');
const fs = require('fs');
const path = require('path');

const PORT = 8080;
const APK_PATH = path.join(__dirname, 'Dhaka-City-Gangstar-FIXED.apk');

const server = http.createServer((req, res) => {
  if (req.url === '/download' || req.url === '/Dhaka-City-Gangstar-FIXED.apk' || req.url === '/Dhaka-City-Gangstar.apk') {
    if (!fs.existsSync(APK_PATH)) {
      res.writeHead(404, { 'Content-Type': 'text/plain' });
      return res.end('APK file not found on server.');
    }
    const stat = fs.statSync(APK_PATH);
    res.writeHead(200, {
      'Content-Type': 'application/vnd.android.package-archive',
      'Content-Length': stat.size,
      'Content-Disposition': 'attachment; filename="Dhaka-City-Gangstar-FIXED.apk"'
    });
    fs.createReadStream(APK_PATH).pipe(res);
  } else {
    res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });
    res.end(`
      <!DOCTYPE html>
      <html>
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Download Dhaka City Gangstar FIXED APK</title>
        <style>
          body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background: #0b0f19; color: #fff; text-align: center; padding: 40px 20px; }
          .card { background: #161f30; max-width: 440px; margin: 0 auto; padding: 32px; border-radius: 20px; box-shadow: 0 10px 30px rgba(0,0,0,0.7); border: 1px solid rgba(255,255,255,0.08); }
          .logo { width: 96px; height: 96px; border-radius: 22px; box-shadow: 0 6px 20px rgba(0,0,0,0.5); margin-bottom: 16px; border: 2px solid #f59e0b; }
          h1 { color: #f59e0b; font-size: 24px; margin: 0 0 6px 0; font-weight: 800; }
          p { color: #94a3b8; font-size: 14px; margin: 0 0 20px 0; }
          .badge { display: inline-block; background: #1e293b; padding: 6px 14px; border-radius: 999px; font-size: 12px; color: #10b981; font-weight: 600; margin-bottom: 24px; border: 1px solid rgba(16,185,129,0.3); }
          .btn { display: block; width: 100%; box-sizing: border-box; background: linear-gradient(135deg, #10b981, #059669); color: white; text-decoration: none; padding: 16px 20px; border-radius: 14px; font-size: 17px; font-weight: bold; transition: 0.2s; box-shadow: 0 4px 15px rgba(16,185,129,0.4); }
          .btn:active { transform: scale(0.98); }
          .info { margin-top: 22px; font-size: 12px; color: #64748b; line-height: 1.6; text-align: left; background: rgba(0,0,0,0.25); padding: 14px; border-radius: 10px; }
          .tag { color: #38bdf8; font-weight: bold; }
        </style>
      </head>
      <body>
        <div class="card">
          <img class="logo" src="data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'><rect width='100' height='100' fill='%230f172a'/><circle cx='50' cy='50' r='35' fill='%23f59e0b'/><text x='50' y='57' font-size='22' text-anchor='middle' fill='%23000' font-weight='bold'>DCG</text></svg>" alt="Icon" />
          <h1>DHAKA CITY GANGSTAR</h1>
          <p>ঢাকা সিটি গ্যাংস্টার • Open-World 3D Action</p>
          <div class="badge">Fixed Build • Android 12 to 16 • 30.1 MB</div>
          <a class="btn" href="/download">⬇️ Download Fixed APK</a>
          <div class="info">
            • <span class="tag">Startup Crash Fixed</span>: Safe AppCompatActivity launch theme.<br>
            • <span class="tag">Custom 3D Icon</span>: Cinematic Dhaka Expressway & Skyline.<br>
            • <span class="tag">How to Install</span>: Tap download, open file in Downloads, tap <b>Install</b> (enable "Install unknown apps" if prompted).
          </div>
        </div>
      </body>
      </html>
    `);
  }
});

server.listen(PORT, '0.0.0.0', () => {
  console.log('APK Download server running on http://0.0.0.0:' + PORT);
});
