const http = require('http');
const fs = require('fs');
const path = require('path');

const PORT = 8080;
const ROOT_DIR = __dirname;

const MIME_TYPES = {
  '.html': 'text/html; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.gif': 'image/gif',
  '.svg': 'image/svg+xml',
  '.ico': 'image/x-icon',
  '.txt': 'text/plain; charset=utf-8'
};

const server = http.createServer((req, res) => {
  let reqPath = decodeURI(req.url.split('?')[0]);
  if (reqPath === '/') {
    // Return an index directory dashboard listing all runnable files and portals
    res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });
    res.end(`<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>Project Hub - All Files & Portals</title>
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <style>
    body {
      font-family: system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
      background: #0f172a;
      color: #f8fafc;
      margin: 0;
      padding: 40px 20px;
      display: flex;
      justify-content: center;
    }
    .container {
      max-width: 780px;
      width: 100%;
    }
    h1 {
      font-size: 28px;
      margin-bottom: 8px;
      color: #38bdf8;
    }
    p {
      color: #94a3b8;
      margin-bottom: 24px;
    }
    .badge {
      display: inline-block;
      padding: 4px 10px;
      border-radius: 9999px;
      font-size: 12px;
      font-weight: 600;
      background: rgba(56, 189, 248, 0.15);
      color: #38bdf8;
      margin-bottom: 20px;
    }
    .grid {
      display: flex;
      flex-direction: column;
      gap: 16px;
    }
    .card {
      background: #1e293b;
      border: 1px solid #334155;
      border-radius: 12px;
      padding: 20px;
      display: flex;
      align-items: center;
      justify-content: space-between;
      text-decoration: none;
      color: inherit;
      transition: all 0.2s ease;
    }
    .card:hover {
      background: #273549;
      border-color: #38bdf8;
      transform: translateY(-2px);
    }
    .card-title {
      font-size: 18px;
      font-weight: 600;
      color: #f1f5f9;
      margin-bottom: 4px;
    }
    .card-desc {
      font-size: 13px;
      color: #94a3b8;
    }
    .btn {
      padding: 8px 16px;
      background: #0284c7;
      color: #fff;
      border-radius: 6px;
      font-size: 13px;
      font-weight: 500;
      white-space: nowrap;
    }
  </style>
</head>
<body>
  <div class="container">
    <div class="badge">Active Workspace Hub</div>
    <h1>Running Files & Portals</h1>
    <p>All web applications, static HTML pages, and demos running across this project:</p>

    <div class="grid">
      <a href="http://localhost:3000" target="_blank" class="card">
        <div>
          <div class="card-title">Next.js Web Portal (Full Dynamic App)</div>
          <div class="card-desc">React 19 + Next.js App Router, MeeSeva Portal, Admin, APIs, Payment, Vault</div>
        </div>
        <div class="btn">Open :3000</div>
      </a>

      <a href="/kumar/index.html" target="_blank" class="card">
        <div>
          <div class="card-title">MSN Communication & MeeSeva Portal (HTML)</div>
          <div class="card-desc">Standalone HTML5/Tailwind/CSS portal with complete services catalog</div>
        </div>
        <div class="btn">Launch Portal</div>
      </a>

      <a href="/mobile-exit-popup.html" target="_blank" class="card">
        <div>
          <div class="card-title">Mobile Exit Confirmation Popup</div>
          <div class="card-desc">Root mobile exit dialog demo with touch gesture detection and animations</div>
        </div>
        <div class="btn">Launch Demo</div>
      </a>

      <a href="/kumar/public/exit-dialog-demo.html" target="_blank" class="card">
        <div>
          <div class="card-title">Exit Confirmation Dialog Demo</div>
          <div class="card-desc">Exit intent modal preview with retention offer & confirmation</div>
        </div>
        <div class="btn">Launch Demo</div>
      </a>
    </div>
  </div>
</body>
</html>`);
    return;
  }

  let filePath = path.join(ROOT_DIR, reqPath);
  if (!fs.existsSync(filePath)) {
    res.writeHead(404, { 'Content-Type': 'text/plain' });
    res.end('404 Not Found');
    return;
  }

  if (fs.statSync(filePath).isDirectory()) {
    filePath = path.join(filePath, 'index.html');
    if (!fs.existsSync(filePath)) {
      res.writeHead(404, { 'Content-Type': 'text/plain' });
      res.end('404 Not Found: Directory has no index.html');
      return;
    }
  }

  const ext = path.extname(filePath).toLowerCase();
  const contentType = MIME_TYPES[ext] || 'application/octet-stream';

  fs.readFile(filePath, (err, content) => {
    if (err) {
      res.writeHead(500, { 'Content-Type': 'text/plain' });
      res.end('Server Error: ' + err.code);
    } else {
      res.writeHead(200, { 'Content-Type': contentType });
      res.end(content);
    }
  });
});

server.listen(PORT, () => {
  console.log(`Static file server running at http://localhost:${PORT}/`);
});
