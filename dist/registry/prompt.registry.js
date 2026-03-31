/**
 * Registry of all prompt handlers.
 * Register new prompts here — index.ts never needs to change.
 * Implements the Open/Closed Principle: open for extension, closed for modification.
 */
export class PromptRegistry {
    handlers = new Map();
    register(handler) {
        this.handlers.set(handler.definition.name, handler);
        return this;
    }
    resolve(name) {
        const handler = this.handlers.get(name);
        if (!handler)
            throw new Error(`Prompt not found: ${name}`);
        return handler;
    }
    listDefinitions() {
        return [...this.handlers.values()].map((h) => h.definition);
    }
    handle(name, args) {
        return this.resolve(name).handle(args);
    }
}
//# sourceMappingURL=prompt.registry.js.map