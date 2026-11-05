// Runs one npm script in every workspace. With no apps or packages yet, exits 0
// so the root scripts still succeed on the first commit.
import { existsSync, readdirSync } from 'node:fs';
import { spawnSync } from 'node:child_process';

const scriptName = process.argv[2];

if (!scriptName) {
  console.error('Usage: node scripts/run-in-workspaces.mjs <script>');
  process.exit(1);
}

function hasWorkspacePackages() {
  const roots = ['apps', 'packages'];

  for (const root of roots) {
    if (!existsSync(root)) {
      continue;
    }

    const names = readdirSync(root);
    for (const name of names) {
      if (existsSync(`${root}/${name}/package.json`)) {
        return true;
      }
    }
  }

  return false;
}

if (!hasWorkspacePackages()) {
  console.log(`No workspaces yet, skipping ${scriptName}`);
  process.exit(0);
}

const result = spawnSync('npm', ['run', scriptName, '--workspaces', '--if-present'], {
  stdio: 'inherit',
  shell: true,
});

process.exit(result.status ?? 1);
