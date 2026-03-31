import type { CallToolResult } from '@modelcontextprotocol/sdk/types.js';

export interface ToolProperty {
  type: string;
  description?: string;
  enum?: string[];
}

export interface ToolDefinition {
  name: string;
  description: string;
  inputSchema: {
    type: 'object';
    properties: Record<string, ToolProperty>;
    required: string[];
  };
}

// Re-export SDK type so handlers only import from this interface file
export type { CallToolResult };

export interface IToolHandler {
  readonly definition: ToolDefinition;
  handle(args: Record<string, unknown>): CallToolResult;
}
