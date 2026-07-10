#!/bin/bash
cat >> .agents/hooks/test.log
echo "Stop fired: $(date -Iseconds)" >> .agents/hooks/test.log
echo '{"decision": "allow"}'
exit 0
