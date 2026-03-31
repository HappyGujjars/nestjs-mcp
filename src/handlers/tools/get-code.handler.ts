import { IToolHandler, ToolDefinition, CallToolResult } from '../tool-handler.interface.js';
import { BOILERPLATES, BoilerplatePattern } from '../../rules/boilerplates.js';

export class GetCodeToolHandler implements IToolHandler {
  readonly definition: ToolDefinition = {
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

  handle(args: Record<string, unknown>): CallToolResult {
    const pattern = args.pattern as BoilerplatePattern;
    const code = BOILERPLATES[pattern];

    if (!code) {
      return { content: [{ type: 'text', text: `Unknown pattern: ${pattern}` }] };
    }

    return { content: [{ type: 'text', text: code }] };
  }
}
