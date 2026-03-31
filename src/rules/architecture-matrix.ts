export const ARCHITECTURE_MATRIX = `
# NEST_PRO_ARCHITECT: SYSTEM DESIGN & ARCHITECTURE MATRIX

This document outlines the authoritative architectural choices for the NestJS Pro Architect. 
When making system design decisions, evaluating tech stacks, or suggesting infrastructure add-ons, the AI must consult this matrix and adhere to its guidelines.

## 0. CORE DECISION RULE: THE REUSE PRINCIPLE (MANDATORY)
**CONTEXTUAL RULE ENGINE:** If a technology like Redis is already implemented in the project, prioritize using it for new features (e.g., use BullMQ for queuing or Redis PubSub for events) before introducing a completely new infrastructure piece (like Kafka or RabbitMQ) to minimize DevOps overhead and cost. ALWAYS examine the existing stack before recommending new tools.

---

## 1. MESSAGE QUEUES & EVENT BROKERS
- **Redis + BullMQ:** 
  - **Use Case:** Background jobs (e.g., email sending, report generation), delayed processing, simple event-driven architecture within the same monolith or closely coupled microservices.
  - **Pros:** Lowest DevOps overhead (especially if Redis is already deployed). UI dashboard available (BullMQ Board). Great NestJS integration.
  - **Cons:** Not designed for massive, persistent event streaming or highly complex routing.

- **RabbitMQ:**
  - **Use Case:** Complex message routing (topic, direct, fanout exchanges), standard microservices communication.
  - **Pros:** Robust, standard AMQP support, excellent NestJS Microservices integration.
  - **Cons:** Moderate DevOps overhead.

- **Kafka:**
  - **Use Case:** Massive throughput (>10k events/sec), event sourcing, log aggregation, real-time analytics.
  - **Pros:** Highly scalable, persistent event logs, replayable streams.
  - **Cons:** Very high DevOps complexity and infrastructure cost. Overkill for 95% of standard CRUD applications. Only recommend if explicitly required by volume or replayability needs.

---

## 2. DATABASES
- **PostgreSQL (via Sequelize):**
  - **Use Case:** Default choice for almost all applications. Relational data, ACID compliance, structured transactions.
  - **Pros:** Extremely robust, handles complex queries, excellent Sequelize/NestJS ecosystem.
  - **Cons:** Schema migrations required.

- **MongoDB:**
  - **Use Case:** Highly dynamic schemas, rapid prototyping with unstructured data, CMS storage, product catalogs with varying attributes.
  - **Pros:** Flexible, horizontally scalable.
  - **Cons:** Lack of strict transactions across collections (historically), risk of data inconsistency if not modeled carefully. Do not use for highly relational data (like users, orders, shipping, payments).

- **Redis (as a DB):**
  - **Use Case:** Caching, rate limiting, session storage, real-time leaderboards, ephemeral data.
  - **Pros:** Blazing fast.
  - **Cons:** Ephemeral (can lose data depending on persistence config). Not a primary system-of-record.

---

## 3. CACHING STRATEGIES
- **Cache-Aside Pattern (with Redis):**
  - **Default Approach:** Application code checks cache first. If a miss, queries DB, saves to cache, returns data.
  - **Invalidation:** Must clear cache on DB update/delete.
  - **NestJS Tooling:** Use built-in \`CacheModule\` configured with \`cache-manager-redis-store\`.

- **In-Memory Caching:**
  - **Use Case:** Very small specific datasets (e.g., app configuration loaded at startup), single instance deployments.
  - **Cons:** Does not scale across multiple pods/instances (leads to stale data across the cluster).

---

## 4. WEBSOCKETS & REAL-TIME
- **Socket.io:**
  - **Use Case:** Standard real-time features (chat, notifications, live updates).
  - **Pros:** Built-in fallbacks (long polling), rooms & namespaces, excellent NestJS \`@WebSocketGateway\` support.
  - **Scaling:** If deployed across multiple pods, MUST use the \`@nestjs/platform-socket.io\` Redis Adapter. (Leveraging the Core Reuse Principle).

- **Raw WebSockets (ws):**
  - **Use Case:** Extreme performance, low-level binary streaming, strict bandwidth limits.
  - **Pros:** Lightweight.
  - **Cons:** Lacks built-in rooms/broadcasting logic, making clustering difficult.
`;
