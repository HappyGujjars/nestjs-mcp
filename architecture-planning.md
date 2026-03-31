# Architecture & System Design MCP Extension Plan

This document outlines the roadmap for extending the `nest-pro-architect` MCP server from a "code-quality enforcer" into a "System Design Expert." This will allow the AI agent to make informed, cost-effective, and highly scalable architectural recommendations (e.g., choosing between BullMQ vs. Kafka vs. RabbitMQ or PostgreSQL vs. MongoDB).

## Phase 1: The Architecture Matrix Resource

**Goal:** Provide the AI with a structured, opinionated source of truth regarding backend technologies, their tradeoffs, and how well they fit into the NestJS ecosystem.

**Implementation Steps:**
1. Create a new file: `src/rules/architecture-matrix.ts`.
2. Define a TypeScript object/markdown string block detailing common architectural domains:
    - **Message Queues:** Compare Redis (BullMQ), RabbitMQ, and Kafka based on throughput, DevOps cost, and persistence guarantees.
    - **Databases:** Compare PostgreSQL, MongoDB, and Redis based on relational needs, dynamic schemas, and caching.
    - **Caching Strategies:** Compare Cache-Aside with Redis vs. In-Memory caching.
    - **WebSockets / Realtime:** Socket.io vs. raw WebSockets and when to use the Redis Pub/Sub adapter.
3. Update `src/index.ts` to expose a new MCP Resource: `nest-pro://architecture-matrix`.
4. **Contextual Rule Engine:** The matrix must include a hard rule: *"If a technology like Redis is already implemented in the project, prioritize using it for new features (e.g., use BullMQ or Redis PubSub) before introducing a completely new infrastructure piece (like Kafka) to minimize DevOps overhead and cost."*

*This allows the AI to ingest this matrix and answer complex "which technology should I use?" questions using expert opinions, directly prioritizing cost-efficiency and leveraging existing infrastructure.*

## Phase 2: System Design Prompt (`system-design`)

**Goal:** Create a specific AI persona/prompt tailored for answering architectural questions and evaluating tech stacks.

**Implementation Steps:**
1. Add a new prompt to `ListPromptsRequestSchema` called `system-design`.
2. Accept arguments such as `requirements` (e.g., "High throughput chat app").
3. In the prompt output, force the AI to:
    - Read the `nest-pro://architecture-matrix` resource.
    - Provide a structured response detailing:
        - The Recommended Technology.
        - The Reasoning (Why this over the alternatives, referencing the matrix).
        - The "NestJS Way" to integrate it (e.g., pointing to `@nestjs/microservices`).

## Phase 3: Architectural Decision Record (ADR) Generator

**Goal:** Ensure that when an architectural decision is made (e.g., "We are using Kafka"), it is permanently documented in the codebase.

**Implementation Steps:**
1. Create a new MCP Tool: `generate_adr`.
2. The tool accepts arguments: `title`, `context`, `decision`, `consequences`.
3. The tool generates a standardized Markdown file in a specific project directory (e.g., `docs/architecture/adr/`).
4. This ensures human developers can understand *why* the AI chose a specific technology 6 months after the code was written.

## Phase 4: Project Analyzer Tool (Future/Advanced)

**Goal:** Allow the AI to automatically analyze `package.json` to detect what technologies the project is currently using to tailor its recommendations.

**Implementation Steps:**
1. Create an `analyze_stack` tool.
2. The MCP server reads the local `package.json` and returns a summary: "Project uses PostgreSQL, Redis, and BullMQ."
3. When asked for a new feature suggestion, the AI prefers existing stack components over introducing new complexity.

---

## Execution Strategy

I recommend we start with **Phase 1** and **Phase 2**. 
Creating the `architecture-matrix.ts` file and exposing it as a resource will immediately grant the AI the specific domain knowledge you described (comparing Kafka vs. Redis, evaluating DevOps cost vs. performance).
