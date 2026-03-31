import type { GetPromptResult, PromptMessage } from '@modelcontextprotocol/sdk/types.js';

export interface PromptArgument {
  name: string;
  description: string;
  required?: boolean;
}

export interface PromptDefinition {
  name: string;
  description: string;
  arguments?: PromptArgument[];
}

// Re-export SDK types so handlers only import from this interface file
export type { GetPromptResult, PromptMessage };

export interface IPromptHandler {
  readonly definition: PromptDefinition;
  handle(args: Record<string, string | undefined>): GetPromptResult;
}
