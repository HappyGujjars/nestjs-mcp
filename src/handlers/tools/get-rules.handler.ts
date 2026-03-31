import { IToolHandler, ToolDefinition, CallToolResult } from '../tool-handler.interface.js';
import { NEST_PRO_RULES, RULE_CHUNKS, RuleCategory } from '../../rules/nest-rules.js';

export class GetRulesToolHandler implements IToolHandler {
  readonly definition: ToolDefinition = {
    name: 'get_rules',
    description:
      'Returns the full NestJS Pro Architect coding standards and rules. Can optionally filter by category to save tokens.',
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

  handle(args: Record<string, unknown>): CallToolResult {
    const category = args.category as string | undefined;

    if (category && category in RULE_CHUNKS) {
      return {
        content: [{ type: 'text', text: RULE_CHUNKS[category as RuleCategory] }],
      };
    }

    return {
      content: [{ type: 'text', text: NEST_PRO_RULES }],
    };
  }
}
