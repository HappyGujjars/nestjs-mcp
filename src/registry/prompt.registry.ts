import { IPromptHandler, PromptDefinition, GetPromptResult } from '../handlers/prompt-handler.interface.js';

/**
 * Registry of all prompt handlers.
 * Register new prompts here — index.ts never needs to change.
 * Implements the Open/Closed Principle: open for extension, closed for modification.
 */
export class PromptRegistry {
  private readonly handlers = new Map<string, IPromptHandler>();

  register(handler: IPromptHandler): this {
    this.handlers.set(handler.definition.name, handler);
    return this;
  }

  resolve(name: string): IPromptHandler {
    const handler = this.handlers.get(name);
    if (!handler) throw new Error(`Prompt not found: ${name}`);
    return handler;
  }

  listDefinitions(): PromptDefinition[] {
    return [...this.handlers.values()].map((h) => h.definition);
  }

  handle(name: string, args: Record<string, string | undefined>): GetPromptResult {
    return this.resolve(name).handle(args);
  }
}
