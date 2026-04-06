const express = require('express');
const path = require('path');

const PORT = process.env.PORT || 3001;
const app = express();

const mimeTypes = {
  '.html': 'text/html',
  '.js': 'application/javascript',
  '.css': 'text/css',
  '.json': 'application/json',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.gif': 'image/gif',
  '.svg': 'image/svg+xml',
  '.ico': 'image/x-icon',
  '.mp4': 'video/mp4',
  '.mp3': 'audio/mpeg',
  '.woff': 'font/woff',
  '.woff2': 'font/woff2',
  '.ttf': 'font/ttf',
};

const DIST_DIR = path.join(__dirname, 'dist');
const SERVER_DIR = __dirname;

app.use((req, res, next) => {
  let filePath = req.path === '/' ? '/index.html' : req.path;
  const fullPath = path.join(DIST_DIR, filePath);
  const ext = path.extname(fullPath).toLowerCase();
  const contentType = mimeTypes[ext] || 'application/octet-stream';

  if (!fullPath.startsWith(DIST_DIR)) {
    return res.status(403).send('Forbidden');
  }

  res.sendFile(fullPath, { headers: { 'Content-Type': contentType } }, (err) => {
    if (err && err.code === 'ENOENT') {
      // SPA fallback
      res.sendFile(path.join(DIST_DIR, 'index.html'), (err2) => {
        if (err2) res.status(404).send('Not Found');
      });
    }
  });
});

app.listen(PORT, () => {
  console.log(`Foliou Demo running at http://localhost:${PORT}/`);
});