const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');


// Smart Linter Logic
try {
  console.log('🔍 Checking for modified apps to run lint...');
  const rootDir = path.join(__dirname, '..', '..');

  // Get all modified, added, or deleted files (both staged and unstaged)
  let changedFiles = '';
  try {
    changedFiles = execSync('git diff --name-only HEAD', { encoding: 'utf-8', cwd: rootDir });
  } catch (e) {}

  // also check untracked files just in case
  let untrackedFiles = '';
  try {
    untrackedFiles = execSync('git ls-files --others --exclude-standard', { encoding: 'utf-8', cwd: rootDir });
  } catch (e) {}

  const allFiles = (changedFiles + '\n' + untrackedFiles).trim();

  if (allFiles) {
    // Find unique apps in apps/* that were modified
    const appsSet = new Set();
    const lines = allFiles.split('\n');
    for (const line of lines) {
      const match = line.match(/^apps\/([^\/]+)\//);
      if (match) {
        appsSet.add(match[1]);
      }
    }

    for (const app of appsSet) {
      const appDir = path.join(rootDir, 'apps', app);
      const packageJsonPath = path.join(appDir, 'package.json');
      if (fs.existsSync(packageJsonPath)) {
        const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'));
        if (packageJson.scripts && packageJson.scripts.lint) {
          console.log(`📦 Changes detected in apps/${app}. Running linter...`);
          execSync(`npm --prefix apps/${app} run lint`, { stdio: 'inherit', cwd: rootDir });
        }
      }
    }
  } else {
    console.log('ℹ️ No changes detected. Skipping lint.');
  }
} catch (e) {
  console.error('⚠️ Linter hook encountered an error:', e.message);
}

process.exit(0);
