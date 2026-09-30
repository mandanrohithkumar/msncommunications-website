const https = require('https');

const token = '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';

function apiRequest(method, path, body) {
  return new Promise((resolve, reject) => {
    const postData = body ? JSON.stringify(body) : null;
    const options = {
      hostname: 'api.github.com',
      path,
      method,
      headers: {
        'User-Agent': 'MSN-Push-Script',
        'Authorization': `Bearer ${token}`,
        'Accept': 'application/vnd.github+json',
        'X-GitHub-Api-Version': '2022-11-28',
        ...(postData ? { 'Content-Type': 'application/json', 'Content-Length': Buffer.byteLength(postData) } : {})
      }
    };
    const req = https.request(options, (res) => {
      let data = '';
      res.on('data', c => data += c);
      res.on('end', () => {
        try { resolve({ status: res.statusCode, body: JSON.parse(data), headers: res.headers }); }
        catch (e) { resolve({ status: res.statusCode, body: data, headers: res.headers }); }
      });
    });
    req.on('error', reject);
    if (postData) req.write(postData);
    req.end();
  });
}

async function main() {
  // Check token scopes
  const userRes = await apiRequest('GET', '/user');
  console.log('Token scopes:', userRes.headers['x-oauth-scopes'] || 'NOT SHOWN (fine-grained PAT)');
  console.log('User:', userRes.body.login);

  // Check repo write permissions
  const repoRes = await apiRequest('GET', '/repos/mandanrohithkumar/msncommunications-website');
  console.log('\nRepo permissions:');
  console.log(JSON.stringify(repoRes.body.permissions, null, 2));

  // Check branches
  const branchRes = await apiRequest('GET', '/repos/mandanrohithkumar/msncommunications-website/branches');
  console.log('\nBranches:', branchRes.status, JSON.stringify(branchRes.body));

  // Try a simple test - push a small file via Contents API
  console.log('\nTesting Contents API write (creating test-write.txt)...');
  const testRes = await apiRequest('PUT', '/repos/mandanrohithkumar/msncommunications-website/contents/test-write.txt', {
    message: 'test write access',
    content: Buffer.from('test').toString('base64'),
    branch: 'main'
  });
  console.log('Contents API PUT status:', testRes.status);
  if (testRes.status === 201) {
    console.log('✅ Write access via Contents API WORKS!');
  } else {
    console.log('Contents API response:', JSON.stringify(testRes.body));
  }
}

main().catch(console.error);
