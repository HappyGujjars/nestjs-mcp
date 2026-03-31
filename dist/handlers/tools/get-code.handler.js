import { BOILERPLATES } from '../../rules/boilerplates.js';
export class GetCodeToolHandler {
    definition = {
        name: 'get_code',
        description: 'Returns ready-to-use boilerplate code for common NestJS patterns.',
        inputSchema: {
            type: 'object',
            properties: {
                pattern: {
                    type: 'string',
                    enum: Object.keys(BOILERPLATES),
                    description: 'The boilerplate pattern to retrieve',
                },
            },
            required: ['pattern'],
        },
    };
    handle(args) {
        const pattern = args.pattern;
        const code = BOILERPLATES[pattern];
        if (!code) {
            return { content: [{ type: 'text', text: `Unknown pattern: ${pattern}` }] };
        }
        return { content: [{ type: 'text', text: code }] };
    }
}
//# sourceMappingURL=get-code.handler.js.map