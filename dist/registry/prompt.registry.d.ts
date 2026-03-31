import { IPromptHandler, PromptDefinition, GetPromptResult } from '../handlers/prompt-handler.interface.js';
/**
 * Registry of all prompt handlers.
 * Register new prompts here — index.ts never needs to change.
 * Implements the Open/Closed Principle: open for extension, closed for modification.
 */
export declare class PromptRegistry {
    private readonly handlers;
    register(handler: IPromptHandler): this;
    resolve(name: string): IPromptHandler;
    listDefinitions(): PromptDefinition[];
    handle(name: string, args: Record<string, string | undefined>): GetPromptResult;
}
