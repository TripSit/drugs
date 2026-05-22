## Agents
### Analysis Strategy

When asked to analyze or understand a large section of the codebase:

1. Do NOT read all files directly. First map the directory structure.
2. Use the Task tool to delegate file reading to sub-agents.
3. Each sub-agent should read no more than 10–15 files and return a structured summary.
4. Use Claude Haiku for sub-agent tasks where possible.
5. Collect summaries before drawing conclusions.