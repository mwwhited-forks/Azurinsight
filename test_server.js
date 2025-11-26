const http = require('http');

function request(method, path, body) {
    return new Promise((resolve, reject) => {
        const options = {
            hostname: 'localhost',
            port: 5000,
            path: path,
            method: method,
            headers: {
                'Content-Type': 'application/json'
            }
        };

        const req = http.request(options, (res) => {
            let data = '';
            res.on('data', (chunk) => {
                data += chunk;
            });
            res.on('end', () => {
                resolve({ statusCode: res.statusCode, body: data });
            });
        });

        req.on('error', (e) => {
            reject(e);
        });

        if (body) {
            req.write(JSON.stringify(body));
        }
        req.end();
    });
}

async function test() {
    try {
        console.log('Testing Purge...');
        const purgeRes = await request('DELETE', '/api/purge');
        console.log('Purge Response:', purgeRes.statusCode, purgeRes.body);

        console.log('Testing Granular Delete (missing params)...');
        const deleteRes = await request('DELETE', '/api/telemetry');
        console.log('Delete Response:', deleteRes.statusCode, deleteRes.body);

    } catch (e) {
        console.error('Error:', e.message);
    }
}

test();
