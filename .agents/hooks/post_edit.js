const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

let filePath = process.env.CLAUDE_TOOL_INPUT_FILE_PATH;

if (!filePath) {
    try {
        const args = JSON.parse(process.env.AGY_TOOL_ARGS || process.env.CLAUDE_TOOL_INPUT || '{}');
        filePath = args.TargetFile || args.AbsolutePath || args.targetFile;
    } catch (e) {
        // Fallback
    }
}

// Ensure filePath is a string before matching
if (filePath && typeof filePath === 'string' && filePath.match(/\.(ts|js|json)$/)) {
    try {
        // Run prettier
        execSync(`npx prettier --write "${filePath}"`, { stdio: 'ignore' });
        
        // Run eslint for JS/TS files
        if (filePath.match(/\.(ts|js)$/)) {
            execSync(`npx eslint --fix "${filePath}"`, { stdio: 'ignore' });
        }
        
        const logPath = path.join(__dirname, 'test.log');
        fs.appendFileSync(logPath, `Auto-formatted: ${filePath}\n`);
    } catch (e) {
        const logPath = path.join(__dirname, 'test.log');
        fs.appendFileSync(logPath, `Linting failed for ${filePath}: ${e.message}\n`);
    }
}

process.exit(0);
