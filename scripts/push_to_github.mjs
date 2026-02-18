import { execSync } from 'child_process';
import { readFileSync } from 'fs';
import path from 'path';

const OWNER = 'Ibrahim-Noor';
const REPO = 'LUMS-RO';
const BRANCH = 'main';

let connectionSettings = null;

async function getAccessToken() {
  if (connectionSettings && connectionSettings.settings.expires_at && new Date(connectionSettings.settings.expires_at).getTime() > Date.now()) {
    return connectionSettings.settings.access_token;
  }

  const hostname = process.env.REPLIT_CONNECTORS_HOSTNAME;
  const xReplitToken = process.env.REPL_IDENTITY
    ? 'repl ' + process.env.REPL_IDENTITY
    : process.env.WEB_REPL_RENEWAL
    ? 'depl ' + process.env.WEB_REPL_RENEWAL
    : null;

  if (!xReplitToken) {
    throw new Error('X_REPLIT_TOKEN not found for repl/depl');
  }

  connectionSettings = await fetch(
    'https://' + hostname + '/api/v2/connection?include_secrets=true&connector_names=github',
    {
      headers: {
        'Accept': 'application/json',
        'X_REPLIT_TOKEN': xReplitToken
      }
    }
  ).then(res => res.json()).then(data => data.items?.[0]);

  const accessToken = connectionSettings?.settings?.access_token || connectionSettings?.settings?.oauth?.credentials?.access_token;

  if (!connectionSettings || !accessToken) {
    throw new Error('GitHub not connected');
  }
  return accessToken;
}

async function getOctokit() {
  const { Octokit } = await import('@octokit/rest');
  const accessToken = await getAccessToken();
  return new Octokit({ auth: accessToken });
}

async function main() {
  console.log('Getting authenticated GitHub client...');
  const octokit = await getOctokit();

  console.log('Getting list of tracked files...');
  const filesOutput = execSync('git ls-files', { encoding: 'utf-8' });
  const files = filesOutput.trim().split('\n').filter(f => f.length > 0);
  console.log(`Found ${files.length} tracked files`);

  const commitMessage = execSync('git log -1 --format=%s 2>/dev/null || echo "Push from Replit"', { encoding: 'utf-8' }).trim();
  const authorName = execSync('git log -1 --format=%an 2>/dev/null || echo "Replit"', { encoding: 'utf-8' }).trim();
  const authorEmail = execSync('git log -1 --format=%ae 2>/dev/null || echo "replit@users.noreply.github.com"', { encoding: 'utf-8' }).trim();

  console.log(`Commit message: ${commitMessage}`);
  console.log(`Author: ${authorName} <${authorEmail}>`);

  let currentCommitSha = null;
  let baseTreeSha = null;
  try {
    const { data: ref } = await octokit.git.getRef({
      owner: OWNER,
      repo: REPO,
      ref: `heads/${BRANCH}`,
    });
    currentCommitSha = ref.object.sha;

    const { data: commit } = await octokit.git.getCommit({
      owner: OWNER,
      repo: REPO,
      commit_sha: currentCommitSha,
    });
    baseTreeSha = commit.tree.sha;
    console.log(`Current commit on ${BRANCH}: ${currentCommitSha}`);
  } catch (e) {
    console.log(`Branch ${BRANCH} not found, will create it.`);
  }

  console.log('Creating blobs for all files...');
  const BATCH_SIZE = 10;
  const treeItems = [];

  for (let i = 0; i < files.length; i += BATCH_SIZE) {
    const batch = files.slice(i, i + BATCH_SIZE);
    const promises = batch.map(async (filePath) => {
      try {
        const content = readFileSync(filePath);
        const base64Content = content.toString('base64');

        const { data: blob } = await octokit.git.createBlob({
          owner: OWNER,
          repo: REPO,
          content: base64Content,
          encoding: 'base64',
        });

        const isExecutable = filePath.endsWith('.sh');

        return {
          path: filePath,
          mode: isExecutable ? '100755' : '100644',
          type: 'blob',
          sha: blob.sha,
        };
      } catch (err) {
        console.error(`Failed to create blob for ${filePath}: ${err.message}`);
        return null;
      }
    });

    const results = await Promise.all(promises);
    treeItems.push(...results.filter(r => r !== null));
    console.log(`  Processed ${Math.min(i + BATCH_SIZE, files.length)}/${files.length} files`);
  }

  console.log('Creating tree...');
  const { data: tree } = await octokit.git.createTree({
    owner: OWNER,
    repo: REPO,
    tree: treeItems,
  });

  console.log('Creating commit...');
  const commitData = {
    owner: OWNER,
    repo: REPO,
    message: commitMessage || 'Push from Replit',
    tree: tree.sha,
    author: {
      name: authorName,
      email: authorEmail,
      date: new Date().toISOString(),
    },
  };

  if (currentCommitSha) {
    commitData.parents = [currentCommitSha];
  }

  const { data: newCommit } = await octokit.git.createCommit(commitData);
  console.log(`Created commit: ${newCommit.sha}`);

  console.log(`Updating ref heads/${BRANCH}...`);
  try {
    await octokit.git.updateRef({
      owner: OWNER,
      repo: REPO,
      ref: `heads/${BRANCH}`,
      sha: newCommit.sha,
      force: true,
    });
    console.log(`Successfully updated ${BRANCH} branch!`);
  } catch (e) {
    await octokit.git.createRef({
      owner: OWNER,
      repo: REPO,
      ref: `refs/heads/${BRANCH}`,
      sha: newCommit.sha,
    });
    console.log(`Successfully created ${BRANCH} branch!`);
  }

  console.log(`\nDone! Pushed ${treeItems.length} files to https://github.com/${OWNER}/${REPO}/tree/${BRANCH}`);
}

main().catch(err => {
  console.error('Error:', err.message);
  process.exit(1);
});
