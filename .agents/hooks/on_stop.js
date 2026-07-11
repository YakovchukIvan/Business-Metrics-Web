const fs = require('fs');
const path = require('path');

const currentTaskFile = path.join(__dirname, '..', 'changelog', 'current_task.txt');
const historyFile = path.join(__dirname, '..', 'changelog', 'history.md');

if (fs.existsSync(currentTaskFile)) {
  const content = fs.readFileSync(currentTaskFile, 'utf8').trim();
  if (content) {
    const timestamp = new Date().toLocaleString('uk-UA', { timeZone: 'Europe/Kyiv' });
    const entry = `\n### ${timestamp}\n${content}\n`;

    if (!fs.existsSync(path.dirname(historyFile))) {
      fs.mkdirSync(path.dirname(historyFile), { recursive: true });
    }

    fs.appendFileSync(historyFile, entry);

    // Clear the current task file so it doesn't get logged again
    fs.writeFileSync(currentTaskFile, '');
  }
}

process.exit(0);
