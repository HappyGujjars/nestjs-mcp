/**
 * MCP Server — Composition Root
 *
 * This file is the only place that wires together handlers and registries.
 * It contains ZERO business logic. To add a new prompt or tool, simply
 * register a new handler here — no other file needs to change (OCP).
 */
import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import {
  ListPromptsRequestSchema,
  GetPromptRequestSchema,
  ListToolsRequestSchema,
  CallToolRequestSchema,
  ListResourcesRequestSchema,
  ReadResourceRequestSchema,
} from '@modelcontextprotocol/sdk/types.js';

// ─── Registries ──────────────────────────────────────────────────────────────
import { PromptRegistry } from './registry/prompt.registry.js';
import { ToolRegistry } from './registry/tool.registry.js';

// ─── Prompt Handlers (Strategy Pattern) ─────────────────────────────────────
import { NestjsPromptHandler } from './handlers/prompts/nestjs.handler.js';
import { ModulePromptHandler } from './handlers/prompts/module.handler.js';
import { ReviewCodePromptHandler } from './handlers/prompts/review-code.handler.js';
import { SystemDesignPromptHandler } from './handlers/prompts/system-design.handler.js';
import { AuthPromptHandler } from './handlers/prompts/auth.handler.js';

// ─── Tool Handlers (Strategy Pattern) ────────────────────────────────────────
import { GetRulesToolHandler } from './handlers/tools/get-rules.handler.js';
import { GetCodeToolHandler } from './handlers/tools/get-code.handler.js';

// ─── Resources (static data, no logic) ───────────────────────────────────────
import { NEST_PRO_RULES } from './rules/nest-rules.js';
import { ARCHITECTURE_MATRIX } from './rules/architecture-matrix.js';

// ─── Wire up Registries ───────────────────────────────────────────────────────
const promptRegistry = new PromptRegistry()
  .register(new NestjsPromptHandler())
  .register(new ModulePromptHandler())
  .register(new ReviewCodePromptHandler())
  .register(new SystemDesignPromptHandler())
  .register(new AuthPromptHandler());

const toolRegistry = new ToolRegistry()
  .register(new GetRulesToolHandler())
  .register(new GetCodeToolHandler());

// ─── Server ───────────────────────────────────────────────────────────────────
const server = new Server(
  { name: 'nest-pro-architect', version: '2.0.0' },
  { capabilities: { prompts: {}, tools: {}, resources: {} } },
);

// ─── Prompts ──────────────────────────────────────────────────────────────────
server.setRequestHandler(ListPromptsRequestSchema, async () => ({
  prompts: promptRegistry.listDefinitions(),
}));

server.setRequestHandler(GetPromptRequestSchema, async (request) => {
  const { name, arguments: args } = request.params;
  return promptRegistry.handle(name, (args ?? {}) as Record<string, string | undefined>);
});

// ─── Tools ────────────────────────────────────────────────────────────────────
server.setRequestHandler(ListToolsRequestSchema, async () => ({
  tools: toolRegistry.listDefinitions(),
}));

server.setRequestHandler(CallToolRequestSchema, async (request) => {
  const { name, arguments: args } = request.params;
  return toolRegistry.handle(name, (args ?? {}) as Record<string, unknown>);
});

// ─── Resources ────────────────────────────────────────────────────────────────
const MODULE_STRUCTURE = `
NestJS Feature Module Structure:

src/
├── common/
│   ├── filters/           → GlobalExceptionFilter
│   ├── interceptors/      → ResponseInterceptor, LoggingInterceptor
│   ├── decorators/        → @CurrentUser(), @Public()
│   ├── guards/            → JwtGuard, RolesGuard
│   ├── pipes/             → ZodValidationPipe
│   ├── factory/           → GenericDbFactory
│   └── utils/             → catchAsync, helpers
├── config/                → Zod-validated env config
└── api/
    └── {feature}/
        ├── {feature}.module.ts      → NestJS module + DI tokens
        ├── {feature}.controller.ts  → REST endpoints, Zod pipe usage
        ├── {feature}.service.ts     → Business logic only
        ├── {feature}.repository.ts  → Data access via GenericDbFactory
        ├── {feature}.queries.ts     → Complex Sequelize query objects
        ├── {feature}.model.ts       → Sequelize model (paranoid + typed)
        ├── {feature}.interface.ts   → IService, IRepository interfaces
        └── dto/
            └── {feature}.dto.ts     → Zod schemas + z.infer<> types
`;

server.setRequestHandler(ListResourcesRequestSchema, async () => {
  const promptResources = promptRegistry.listDefinitions().map((def) => ({
    uri: `nest-pro://prompt/${def.name}`,
    name: `Prompt: ${def.name}`,
    description: def.description || `Prompt template for ${def.name}`,
    mimeType: 'text/markdown',
  }));

  return {
    resources: [
      {
        uri: 'nest-pro://rules',
        name: 'NestJS Pro Architect Rules',
        description: 'Full coding standards for NestJS + Sequelize development',
        mimeType: 'text/plain',
      },
      {
        uri: 'nest-pro://module-structure',
        name: 'Feature Module File Structure',
        description: 'Standard directory and file layout for a NestJS feature module',
        mimeType: 'text/plain',
      },
      {
        uri: 'nest-pro://architecture-matrix',
        name: 'System Design & Architecture Matrix',
        description: 'Authoritative architectural choices and tech stack tradeoffs for NestJS',
        mimeType: 'text/markdown',
      },
      ...promptResources,
    ],
  };
});

server.setRequestHandler(ReadResourceRequestSchema, async (request) => {
  const { uri } = request.params;

  if (uri.startsWith('nest-pro://prompt/')) {
    const promptName = uri.replace('nest-pro://prompt/', '');
    try {
      const result = promptRegistry.handle(promptName, {});
      const content = result.messages
        .map((m) => (m.content.type === 'text' ? m.content.text : ''))
        .join('\n');
      return {
        contents: [{ uri, mimeType: 'text/markdown', text: content }],
      };
    } catch (err) {
      throw new Error(`Prompt resource not found: ${uri}`);
    }
  }

  const resourceMap: Record<string, { mimeType: string; text: string }> = {
    'nest-pro://rules': { mimeType: 'text/plain', text: NEST_PRO_RULES },
    'nest-pro://module-structure': { mimeType: 'text/plain', text: MODULE_STRUCTURE },
    'nest-pro://architecture-matrix': { mimeType: 'text/markdown', text: ARCHITECTURE_MATRIX },
  };

  const resource = resourceMap[uri];
  if (!resource) throw new Error(`Resource not found: ${uri}`);

  return { contents: [{ uri, ...resource }] };
});

// ─── Start ────────────────────────────────────────────────────────────────────
const transport = new StdioServerTransport();
await server.connect(transport);
