const input = process.env.CLAUDE_TOOL_INPUT || process.env.AGY_TOOL_ARGS || JSON.stringify(process.env);
const dangerousPatterns = /rm\s+-rf|DROP\s+TABLE|del\s+\/f\s+\/s/i;

if (dangerousPatterns.test(input)) {
  console.error('Critical Error: Detected a destructive command (rm -rf, DROP TABLE, etc.). Forbidden.');
  process.exit(2);
}

console.log(JSON.stringify({ decision: 'allow' }));
process.exit(0);
