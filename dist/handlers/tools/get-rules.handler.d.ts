import { IToolHandler, ToolDefinition, CallToolResult } from '../tool-handler.interface.js';
export declare class GetRulesToolHandler implements IToolHandler {
    readonly definition: ToolDefinition;
    handle(args: Record<string, unknown>): CallToolResult;
}
