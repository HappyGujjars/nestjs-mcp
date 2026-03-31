import { IPromptHandler, PromptDefinition, GetPromptResult } from '../prompt-handler.interface.js';
export declare class NestjsPromptHandler implements IPromptHandler {
    readonly definition: PromptDefinition;
    handle(_args: Record<string, string | undefined>): GetPromptResult;
}
