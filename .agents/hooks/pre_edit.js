const input = process.env.CLAUDE_TOOL_INPUT_FILE_PATH || process.env.CLAUDE_TOOL_INPUT || process.env.AGY_TOOL_ARGS || JSON.stringify(process.env);

if (input.includes('.env') || input.includes('docker-compose.yml')) {
    console.error('Critical Error: Editing .env or docker-compose.yml is forbidden without manual permission.');
    process.exit(2);
}

console.log(JSON.stringify({ decision: 'allow' }));
process.exit(0);
