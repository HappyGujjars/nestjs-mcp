import { NEST_PRO_RULES, RULE_CHUNKS } from '../../rules/nest-rules.js';
export class GetRulesToolHandler {
    definition = {
        name: 'get_rules',
        description: 'Returns the full NestJS Pro Architect coding standards and rules. Can optionally filter by category to save tokens.',
        inputSchema: {
            type: 'object',
            properties: {
                category: {
                    type: 'string',
                    description: 'The specific category of rules to retrieve (e.g. database, architecture, security, orchestration, etc.)',
                },
            },
            required: [],
        },
    };
    handle(args) {
        const category = args.category;
        if (category && category in RULE_CHUNKS) {
            return {
                content: [{ type: 'text', text: RULE_CHUNKS[category] }],
            };
        }
        return {
            content: [{ type: 'text', text: NEST_PRO_RULES }],
        };
    }
}
//# sourceMappingURL=get-rules.handler.js.map