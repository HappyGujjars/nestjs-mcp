# NestJS Pro Architect MCP Server

This Model Context Protocol (MCP) server transforms any connected AI into a Senior Full-Stack Architect specializing in NestJS, Sequelize, and TypeScript. It enforces production-grade, scalable, and maintainable backend code standards.

## Features Implemented

We have successfully implemented a highly optimized, token-efficient architecture using "Chunked Rules" and specific "Boilerplates".

### 1. Chunked Rule Engine
Instead of injecting a monolithic 500+ line rulebook into the AI's context (which consumes excessive tokens and slows down responses), the rules are categorized. The AI intelligently fetches only the rules it needs for the current task.

**Available Rule Categories:**
- \`typescript\` (Zero 'any', Zod Only, Interfaces)
- \`architecture\` (Feature folders, Root files, No cross-domain leakage)
- \`database\` (GenericDbFactory, Queries, Sequelize Models)
- \`service\` (No try/catch, BaseService, Mappers)
- \`crossCutting\` (Pagination, Response Envelopes, Error Handling)
- \`security\` (JWT, Guards, Passwords, Idempotency)
- \`cleanCode\` (25 line max, Naming rules, No magic strings)
- \`swagger\` (Mandatory decorators, DTO schemas)
- \`environment\` (Zod env validation, Fail-fast)
- \`scoring\` (AI self-audit rules)

### 2. Boilerplate Library
A modular library of proven, production-ready NestJS code patterns.

**Available Boilerplates:**
- \`generic-db-factory\`: Centralized DB operations with automatic error handling.
- \`zod-validation-pipe\`: Global input validation translating Zod errors to HTTP 400.
- \`global-exception-filter\`: Standardized error JSON responses.
- \`response-interceptor\`: Standardized success envelopes \`{ success: true, data: T }\`.
- \`logging-interceptor\`: Global request/response timing and logging.
- \`catchAsync\`: Express utility for async controllers.
- \`jwt-guard\`: Authentication guard respecting \`@Public()\` decorators.
- \`strategy-pattern\`: Enterprise design pattern example (e.g., Payment Processing).
- \`repository-pattern\`: Example repository delegating to the GenericDbFactory.
- \`function-naming\`: Examples of clear, descriptive method names (e.g., \`activateUserSubscription\` instead of \`process\`).

---

## How to Invoke (Best Practices for AI)

### Reviewing Code (The "Smart Prompt" Approach)
The \`review-code\` prompt instructs the AI to dynamically fetch the rules it needs before reviewing the code.
**Invocation:** Provide the code snippet.
**AI Workflow:**
1. AI analyzes the snippet (e.g., it's a Controller).
2. AI calls tool \`get_rules({ category: 'architecture' })\`.
3. AI calls tool \`get_rules({ category: 'swagger' })\`.
4. AI provides the review.

### Generating a New Module
The \`module\` prompt scaffolds an entire feature (Controller, Service, Repository, DTOs, Maps).
**Invocation:** \`module(featureName: "billing")\`
**AI Workflow:** 
1. The MCP provides the scaffold instructions.
2. The AI generates the required files using the requested features.
3. If the AI forgets exactly how the \`GenericDbFactory\` works, it calls \`get_code({ pattern: 'generic-db-factory' })\` to remember the signature.

### Evaluating Architecture
The `system-design` prompt instructs the AI to evaluate your requirements and recommend backend tools (queues, databases, realtime) based on the authoritative `architecture-matrix`.
**Invocation:** `system-design(requirements: "High throughput chat app")`
**AI Workflow:**
1. AI reads the system requirements.
2. AI consults the `nest-pro://architecture-matrix` resource.
3. AI returns a recommendation prioritizing existing tools (like Redis) over new complexity (like Kafka).

### Direct Tool Usage
If the AI is working independently and needs to check a standard:
- **Fetch specific rule:** Call \`get_rules({ category: 'database' })\`
- **Fetch boilerplate:** Call \`get_code({ pattern: 'jwt-guard' })\`

---

## Example Chat Prompts for Developers
When you are chatting with your AI assistant, you can copy-paste these exact prompts to trigger the MCP capabilities beautifully:

**1. Code Review (Smart Rules)**
> *"Review this file. Use your 'review-code' prompt protocol to fetch the specific rules you need first, then give me a structured list of violations and fixes."*

**2. Module Generation**
> *"Use your 'module' prompt to generate a new feature module called 'Auth'. Make sure you follow the boilerplate patterns provided in your tools."*

**3. System Architecture Consultation**
> *"Use your 'system-design' prompt to evaluate this requirement: 'I need to process 5,000 background email jobs per minute, and we currently have Redis running'. Consult your architecture matrix before responding."*

**4. General Project Setup**
> *"Use your 'nestjs' prompt to initialize yourself as my Senior Architect for this session. Read the 'nest-pro://module-structure' resource so you know how I expect files to be organized."*

---

## Resources
- \`nest-pro://rules\`: Returns the entire, combined monolithic rulebook.
- \`nest-pro://module-structure\`: Returns a visual tree of the required module folder structure.
