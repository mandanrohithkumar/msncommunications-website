const git = require('isomorphic-git');
const http = require('isomorphic-git/http/node');
const fs = require('fs');
const path = require('path');

const dir = path.resolve(__dirname);
const remote = 'https://github.com/mandanrohithkumar/msncommunications-website.git';
const username = 'mandanrohithkumar';
const token = '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';

const onAuth = () => ({ username, password: token });

async function push() {
  console.log('Working dir:', dir);

  console.log('\n[1] Initializing git repo...');
  await git.init({ fs, dir, defaultBranch: 'main' });

  // Ensure .gitignore exists
  const gitignorePath = path.join(dir, '.gitignore');
  if (!fs.existsSync(gitignorePath)) {
    fs.writeFileSync(gitignorePath, 'node_modules/\n.next/\n.env\n.env.local\n*.log\n');
    console.log('.gitignore created.');
  }

  console.log('\n[2] Staging all files (this may take a moment)...');
  await git.add({ fs, dir, filepath: '.' });
  console.log('All files staged.');

  console.log('\n[3] Committing...');
  const sha = await git.commit({
    fs,
    dir,
    message: 'Initial commit: MSN Communications Portal — Full Codebase',
    author: { name: 'Mandan Rohith Kumar', email: 'mandanrohithkumar@gmail.com' },
  });
  console.log('Commit SHA:', sha);

  console.log('\n[4] Setting remote origin...');
  try { await git.deleteRemote({ fs, dir, remote: 'origin' }); } catch (e) {}
  await git.addRemote({ fs, dir, remote: 'origin', url: remote });

  console.log('\n[5] Pushing to GitHub (may take 1-2 minutes for large repo)...');
  await git.push({
    fs,
    http,
    dir,
    remote: 'origin',
    ref: 'main',
    onAuth,
    force: true,
    onProgress: (e) => {
      if (e.phase) process.stdout.write(`\r  ${e.phase} ${e.loaded || 0}/${e.total || '?'}   `);
    },
  });

  console.log('\n\n✅ SUCCESS! Code pushed to GitHub.');
  console.log(`🔗 https://github.com/mandanrohithkumar/msncommunications-website`);
}

push().catch(err => {
  console.error('\n❌ FAILED:', err.message || err);
  process.exit(1);
});
