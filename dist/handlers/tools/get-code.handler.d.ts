import { IToolHandler, ToolDefinition, CallToolResult } from '../tool-handler.interface.js';
export declare class GetCodeToolHandler implements IToolHandler {
    readonly definition: ToolDefinition;
    handle(args: Record<string, unknown>): CallToolResult;
}
