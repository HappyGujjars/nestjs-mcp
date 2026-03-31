import { IToolHandler, ToolDefinition, CallToolResult } from '../handlers/tool-handler.interface.js';
/**
 * Registry of all tool handlers.
 * Register new tools here — index.ts never needs to change.
 * Implements the Open/Closed Principle: open for extension, closed for modification.
 */
export declare class ToolRegistry {
    private readonly handlers;
    register(handler: IToolHandler): this;
    resolve(name: string): IToolHandler;
    listDefinitions(): ToolDefinition[];
    handle(name: string, args: Record<string, unknown>): CallToolResult;
}
