/**
 * Registry of all tool handlers.
 * Register new tools here — index.ts never needs to change.
 * Implements the Open/Closed Principle: open for extension, closed for modification.
 */
export class ToolRegistry {
    handlers = new Map();
    register(handler) {
        this.handlers.set(handler.definition.name, handler);
        return this;
    }
    resolve(name) {
        const handler = this.handlers.get(name);
        if (!handler)
            throw new Error(`Tool not found: ${name}`);
        return handler;
    }
    listDefinitions() {
        return [...this.handlers.values()].map((h) => h.definition);
    }
    handle(name, args) {
        return this.resolve(name).handle(args);
    }
}
//# sourceMappingURL=tool.registry.js.map