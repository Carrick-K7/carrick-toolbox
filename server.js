/**
 * 简单的HTTP服务器
 * 用于解决ES6模块的CORS问题，并支持SPA路由
 */

import http from 'http';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const PORT = 3000;

// MIME类型映射
const mimeTypes = {
  '.html': 'text/html',
  '.js': 'text/javascript',
  '.css': 'text/css',
  '.json': 'application/json',
  '.png': 'image/png',
  '.jpg': 'image/jpg',
  '.gif': 'image/gif',
  '.svg': 'image/svg+xml',
  '.wav': 'audio/wav',
  '.mp4': 'video/mp4',
  '.woff': 'application/font-woff',
  '.ttf': 'application/font-ttf',
  '.eot': 'application/vnd.ms-fontobject',
  '.otf': 'application/font-otf',
  '.wasm': 'application/wasm'
};

// SPA路由处理 - 工具路径映射
function parseToolRoute(pathname) {
  // 匹配 /tool/:id 格式
  const toolMatch = pathname.match(/^\/tool\/([^\/]+)$/);
  if (toolMatch) {
    return { toolId: toolMatch[1], isToolRoute: true };
  }
  // 匹配 /tools/:id 格式（兼容旧格式）
  const toolsMatch = pathname.match(/^\/tools\/([^\/]+)$/);
  if (toolsMatch) {
    return { toolId: toolsMatch[1], isToolRoute: true };
  }
  return { isToolRoute: false };
}

const server = http.createServer((req, res) => {
  // 启用CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') {
    res.writeHead(200);
    res.end();
    return;
  }

  let pathname = req.url.split('?')[0]; // 移除查询参数

  // 检查是否是工具路由
  const { toolId, isToolRoute } = parseToolRoute(pathname);

  // 默认加载index.html
  if (pathname === '/') {
    pathname = '/index.html';
  }

  // 如果是工具路由，也返回index.html (SPA fallback)
  if (isToolRoute) {
    console.log(`[SPA] Routing to tool: ${toolId}`);
    pathname = '/index.html';
  }

  const filePath = path.join(__dirname, pathname);
  const ext = path.parse(filePath).ext;
  const mimeType = mimeTypes[ext] || 'application/octet-stream';

  fs.readFile(filePath, (err, data) => {
    if (err) {
      if (err.code === 'ENOENT') {
        // 文件不存在，检查是否是SPA路由（非API请求）
        if (!pathname.startsWith('/api/') && !pathname.includes('.')) {
          // 返回index.html让前端路由处理
          fs.readFile(path.join(__dirname, 'index.html'), (err, indexData) => {
            if (err) {
              res.writeHead(500, { 'Content-Type': 'text/html' });
              res.end('<h1>500 Internal Server Error</h1>');
            } else {
              res.writeHead(200, { 'Content-Type': 'text/html' });
              res.end(indexData);
            }
          });
        } else {
          // 文件不存在，返回404
          res.writeHead(404, { 'Content-Type': 'text/html' });
          res.end('<h1>404 Not Found</h1>');
        }
      } else {
        // 服务器错误
        res.writeHead(500, { 'Content-Type': 'text/html' });
        res.end('<h1>500 Internal Server Error</h1>');
      }
    } else {
      // 成功返回文件
      res.writeHead(200, { 'Content-Type': mimeType });
      res.end(data);
    }
  });
});

server.listen(PORT, () => {
  console.log(`🚀 Carrick Toolbox 开发服务器已启动`);
  console.log(`📱 访问地址: http://localhost:${PORT}`);
  console.log(`🛠️  工具路由: http://localhost:${PORT}/tool/:id`);
  console.log(`🔄 按 Ctrl+C 停止服务器`);
});

// 优雅关闭
process.on('SIGINT', () => {
  console.log('\n👋 服务器已停止');
  process.exit(0);
});
