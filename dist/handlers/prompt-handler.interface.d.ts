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
export type { GetPromptResult, PromptMessage };
export interface IPromptHandler {
    readonly definition: PromptDefinition;
    handle(args: Record<string, string | undefined>): GetPromptResult;
}
