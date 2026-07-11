const input = process.env.CLAUDE_TOOL_INPUT || process.env.AGY_TOOL_ARGS || JSON.stringify(process.env);
const dangerousPatterns = /rm\s+-rf|DROP\s+TABLE|del\s+\/f\s+\/s/i;

if (dangerousPatterns.test(input)) {
    console.error('Критична помилка: Виявлено деструктивну команду (rm -rf, DROP TABLE, тощо). Заборонено.');
    process.exit(2);
}

console.log(JSON.stringify({ decision: 'allow' }));
process.exit(0);
