const https = require('https');

const token = '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';

function apiRequest(method, path, body) {
  return new Promise((resolve, reject) => {
    const options = {
      hostname: 'api.github.com',
      path,
      method,
      headers: {
        'User-Agent': 'MSN-Push-Script',
        'Authorization': `Bearer ${token}`,
        'Accept': 'application/vnd.github+json',
        'Content-Type': 'application/json',
        'X-GitHub-Api-Version': '2022-11-28'
      }
    };
    const req = https.request(options, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        console.log(`${method} ${path} -> HTTP ${res.statusCode}`);
        try { resolve({ status: res.statusCode, body: JSON.parse(data) }); }
        catch (e) { resolve({ status: res.statusCode, body: data }); }
      });
    });
    req.on('error', reject);
    if (body) req.write(JSON.stringify(body));
    req.end();
  });
}

async function main() {
  // 1. Get current authenticated user
  console.log('Checking authenticated user...');
  const userRes = await apiRequest('GET', '/user');
  console.log('Status:', userRes.status);
  if (userRes.status !== 200) {
    console.error('Token error:', userRes.body);
    return;
  }
  const user = userRes.body;
  console.log('Logged in as:', user.login, '| Name:', user.name);
  
  // 2. Check if repo exists
  console.log('\nChecking if repo exists...');
  const repoRes = await apiRequest('GET', `/repos/${user.login}/msncommunications-website`);
  console.log('Repo check status:', repoRes.status);
  
  if (repoRes.status === 200) {
    console.log('Repo EXISTS:', repoRes.body.html_url);
    console.log('Default branch:', repoRes.body.default_branch);
    console.log('Clone URL:', repoRes.body.clone_url);
  } else if (repoRes.status === 404) {
    console.log('Repo NOT FOUND. Creating it...');
    const createRes = await apiRequest('POST', '/user/repos', {
      name: 'msncommunications-website',
      description: 'MSN Communications Portal - Citizen Services Platform',
      private: false,
      auto_init: false
    });
    console.log('Create repo status:', createRes.status);
    if (createRes.status === 201) {
      console.log('Repo created:', createRes.body.html_url);
    } else {
      console.error('Failed to create:', createRes.body);
    }
  } else {
    console.error('Unexpected status:', repoRes.body);
  }
}

main().catch(console.error);
