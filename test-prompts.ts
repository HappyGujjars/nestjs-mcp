import { PromptRegistry } from './src/registry/prompt.registry.js';
import { NestjsPromptHandler } from './src/handlers/prompts/nestjs.handler.js';
import { ModulePromptHandler } from './src/handlers/prompts/module.handler.js';
import { ReviewCodePromptHandler } from './src/handlers/prompts/review-code.handler.js';
import { SystemDesignPromptHandler } from './src/handlers/prompts/system-design.handler.js';
import { AuthPromptHandler } from './src/handlers/prompts/auth.handler.js';

const registry = new PromptRegistry()
  .register(new NestjsPromptHandler())
  .register(new ModulePromptHandler())
  .register(new ReviewCodePromptHandler())
  .register(new SystemDesignPromptHandler())
  .register(new AuthPromptHandler());

const definitions = registry.listDefinitions();
console.log('Registered Prompts:', definitions.map(d => d.name));

if (definitions.length === 5) {
  console.log('Verification Success: All 5 prompts are registered.');
} else {
  console.log('Verification Failed: Expected 5 prompts, found ' + definitions.length);
}
