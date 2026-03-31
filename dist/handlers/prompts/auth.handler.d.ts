import { IPromptHandler, PromptDefinition, GetPromptResult } from '../prompt-handler.interface.js';
export declare class AuthPromptHandler implements IPromptHandler {
    readonly definition: PromptDefinition;
    handle(_args: Record<string, string | undefined>): GetPromptResult;
}
