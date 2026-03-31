import { IPromptHandler, PromptDefinition, GetPromptResult } from '../prompt-handler.interface.js';
export declare class ModulePromptHandler implements IPromptHandler {
    readonly definition: PromptDefinition;
    handle(args: Record<string, string | undefined>): GetPromptResult;
}
