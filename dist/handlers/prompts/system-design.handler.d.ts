import { IPromptHandler, PromptDefinition, GetPromptResult } from '../prompt-handler.interface.js';
export declare class SystemDesignPromptHandler implements IPromptHandler {
    readonly definition: PromptDefinition;
    handle(args: Record<string, string | undefined>): GetPromptResult;
}
