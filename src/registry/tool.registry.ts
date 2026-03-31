import { IToolHandler, ToolDefinition, CallToolResult } from '../handlers/tool-handler.interface.js';

/**
 * Registry of all tool handlers.
 * Register new tools here — index.ts never needs to change.
 * Implements the Open/Closed Principle: open for extension, closed for modification.
 */
export class ToolRegistry {
  private readonly handlers = new Map<string, IToolHandler>();

  register(handler: IToolHandler): this {
    this.handlers.set(handler.definition.name, handler);
    return this;
  }

  resolve(name: string): IToolHandler {
    const handler = this.handlers.get(name);
    if (!handler) throw new Error(`Tool not found: ${name}`);
    return handler;
  }

  listDefinitions(): ToolDefinition[] {
    return [...this.handlers.values()].map((h) => h.definition);
  }

  handle(name: string, args: Record<string, unknown>): CallToolResult {
    return this.resolve(name).handle(args);
  }
}
