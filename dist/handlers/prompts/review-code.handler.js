export class ReviewCodePromptHandler {
    definition = {
        name: 'review-code',
        description: 'Reviews provided code against the strict NestJS Pro Architect standards and returns a prioritized list of violations with fixes.',
        arguments: [
            {
                name: 'code',
                description: 'The code snippet to review',
                required: true,
            },
        ],
    };
    handle(args) {
        const code = args.code ?? '';
        return {
            messages: [
                {
                    role: 'user',
                    content: {
                        type: 'text',
                        text: `You are a Senior Full-Stack Architect.
I want you to review the following code snippet.

Before reviewing, you MUST use the 'get_rules' tool to fetch the rules relevant to this specific type of code.
- If the code is a Controller, fetch 'architecture', 'swagger', and 'crossCutting' rules.
- If the code is a Service, Provider, Strategy, or Workflow orchestrator, fetch 'service' and 'orchestration' rules.
- If the code is a Repository or uses Sequelize, fetch 'database' rules.
- If the code handles passwords or JWTs, fetch 'security' rules.
- ALWAYS fetch the 'typescript' and 'cleanCode' rules.

Code to review:
\`\`\`
${code}
\`\`\`

Provide a structured review with:
1. ❌ VIOLATIONS — list each violation with line reference and severity (Critical/Major/Minor)
2. ✅ WHAT'S GOOD — highlight correct patterns used
3. 🔧 FIXES — provide the corrected code for each violation based ONLY on the fetched rules.`,
                    },
                },
            ],
        };
    }
}
//# sourceMappingURL=review-code.handler.js.map