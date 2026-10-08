const http = require('http');
const fs = require('fs');
const path = require('path');

const PORT = 3000;

// Mock database
const mockData = {
    status: "success",
    data: [
        { id: "txn_123", amount: 250.50, currency: "USD", status: "completed", date: "2026-10-08T10:00:00Z" },
        { id: "txn_124", amount: 15.00, currency: "USD", status: "pending", date: "2026-10-08T11:30:00Z" },
        { id: "txn_125", amount: 1200.00, currency: "EUR", status: "failed", date: "2026-10-07T09:15:00Z" },
        { id: "txn_126", amount: 45.99, currency: "GBP", status: "completed", date: "2026-10-06T14:20:00Z" },
        { id: "txn_127", amount: 890.00, currency: "USD", status: "completed", date: "2026-10-05T08:00:00Z" },
        { id: "txn_128", amount: 310.20, currency: "USD", status: "completed", date: "2026-10-04T12:00:00Z" },
        { id: "txn_129", amount: 12.50, currency: "USD", status: "failed", date: "2026-10-03T16:45:00Z" },
        { id: "txn_130", amount: 10500.00, currency: "JPY", status: "completed", date: "2026-10-02T22:10:00Z" }
    ]
};

const server = http.createServer((req, res) => {
    // API Route
    if (req.url === '/api/v1/transactions') {
        // Simulate network latency of 1.5 seconds to show off the skeleton loader
        setTimeout(() => {
            res.writeHead(200, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify(mockData));
        }, 1500);
        return;
    }

    // Static file serving
    let filePath = '.' + req.url;
    if (filePath === './') {
        filePath = './index.html';
    }

    const extname = String(path.extname(filePath)).toLowerCase();
    const mimeTypes = {
        '.html': 'text/html',
        '.js': 'text/javascript',
        '.css': 'text/css',
        '.json': 'application/json',
    };

    const contentType = mimeTypes[extname] || 'application/octet-stream';

    fs.readFile(filePath, (error, content) => {
        if (error) {
            if(error.code == 'ENOENT') {
                res.writeHead(404);
                res.end('File not found');
            } else {
                res.writeHead(500);
                res.end('Server error: ' + error.code);
            }
        } else {
            res.writeHead(200, { 'Content-Type': contentType });
            res.end(content, 'utf-8');
        }
    });
});

server.listen(PORT, () => {
    console.log(`Server running at http://localhost:${PORT}/`);
    console.log(`Serving static files and mock API from: ${__dirname}`);
});
