export class SystemDesignPromptHandler {
    definition = {
        name: 'system-design',
        description: 'Evaluates requirements and provides an authoritative architectural recommendation based on the NestJS Pro Architecture Matrix.',
        arguments: [
            {
                name: 'requirements',
                description: 'The system requirements or architectural question to evaluate',
                required: true,
            },
        ],
    };
    handle(args) {
        const requirements = args.requirements ?? '';
        return {
            messages: [
                {
                    role: 'user',
                    content: {
                        type: 'text',
                        text: `You are a Principal Cloud Architect specializing in the NestJS ecosystem.
I have the following system design requirements:

\`\`\`
${requirements}
\`\`\`

Before responding, you MUST use the 'read_resource' tool (if available) or assume you have read the 'nest-pro://architecture-matrix' resource to understand our architectural constraints and tradeoff opinions.

Provide a structured architectural recommendation that includes:
1. 🏗 RECOMMENDED TECHNOLOGY
2. 💡 REASONING (Why this over alternatives, strictly based on the Architecture Matrix, focusing on cost and DevOps overhead)
3. 🛠 The "NestJS Way" to integrate it (e.g., specific modules or patterns to use)

Remember the Core Reuse Principle: ALWAYS prioritize leveraging existing infrastructure (like Redis) over introducing new services if applicable.`,
                    },
                },
            ],
        };
    }
}
//# sourceMappingURL=system-design.handler.js.map