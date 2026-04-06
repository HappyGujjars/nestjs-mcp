export type RuleCategory =
  | 'typescript'
  | 'architecture'
  | 'database'
  | 'service'
  | 'crossCutting'
  | 'security'
  | 'cleanCode'
  | 'swagger'
  | 'environment'
  | 'orchestration'
  | 'validation'
  | 'scoring';

export const RULE_CHUNKS: Record<RuleCategory, string> = {
  typescript: `
═══════════════════════════════════════════════════════════
1. CORE TYPESCRIPT STANDARDS
═══════════════════════════════════════════════════════════

1. ZERO 'any':
   - Strict TypeScript only.
   - All functions must have explicit return types.
   - Use Generics and Utility Types properly.
   - Use 'unknown' instead of 'any'.

2. ZOD ONLY:
   - All DTOs must use Zod.
   - No class-validator or class-transformer.
   - Use z.infer for type derivation.
   - Validate strictly at controller boundary.

3. INTERFACE-DRIVEN DESIGN:
   - Every service must implement an interface.
   - Use Injection Tokens (Symbol).
   - No direct class injection without token.
   - Never inject repository class directly — inject via token.
`,
  validation: `
═══════════════════════════════════════════════════════════
1.1 PRODUCTION ZOD VALIDATION STANDARDS
═══════════════════════════════════════════════════════════

4. USER-FRIENDLY ERROR MESSAGES (MANDATORY):
   - All Zod fields MUST provide human-readable custom messages for all validation rules.
   - These messages are the single source of truth for the entire stack.
   - Support both explicit (Version 3) and concise (Version 4+) formats:
     
     ✅ Version 3 Format (Explicit):
        z.string({ 
          required_error: 'Field is required', 
          invalid_type_error: 'Field must be a string' 
        })
     
     ✅ Version 4+ Format (Concise Shorthand):
        z.string({ error: 'Field is required and must be a string' })
        z.string().min(5, { error: 'Too short!' })
        z.uuid({ error: 'Bad UUID!' })

   - Example DTO standard:
     export const userSchema = z.object({
       email: z.string({
         error: 'Email is required',
       }).email('Please enter a valid email address'),
     });

5. CONSISTENT VALIDATION ERROR RESPONSE:
   - Error messages must be ready for frontend display without mapping.
   - Use direct, descriptive language.

6. FULL-STACK CONTRACT SYNCHRONIZATION:
   - The DTOs and Swagger documentation generated here MUST be the source of truth for the Frontend MCP.
   - Any change in the Zod schema or Swagger decorator MUST be reflected in the API documentation immediately.
`,
  architecture: `
═══════════════════════════════════════════════════════════
2. FEATURE STRUCTURE (MANDATORY - STRICT)
═══════════════════════════════════════════════════════════

4. FEATURE-BASED FOLDER STRUCTURE (STRICTLY ENFORCED):

   Every feature MUST follow this exact structure:
   src/api/
     └── {feature}/
          ├── {feature}.module.ts
          ├── {feature}.controller.ts
          ├── {feature}.service.ts
          │
          ├── repository/
          │     ├── {feature}.repository.ts
          │     └── {feature}.queries.ts
          │
          ├── mapper/
          │     └── {feature}.mapper.ts
          │
          ├── constants/
          │     └── {feature}.constants.ts
          │
          ├── interfaces/
          │     └── {feature}.interface.ts
          ├── entities/
          │     └── {feature}.entity.ts  
          │
          └── dto/

5. ROOT FILE RULE:
   Only these files are allowed at feature root:
     - {feature}.module.ts
     - {feature}.controller.ts
     - {feature}.service.ts

   All other files MUST be placed inside their respective subfolders.

6. REPOSITORY STRUCTURE RULE:
   - All repository logic MUST be inside repository/ folder.
   - {feature}.queries.ts MUST exist inside repository/.
   - Services must NEVER import Sequelize models directly.
   - Services must NEVER execute raw Sequelize queries.

7. INTERNAL ISOLATION RULE:
   - repository/, mapper/, constants/, interfaces/ are internal.
   - No other module may import them directly.
   - Cross-feature communication only via service interface + token.

8. NO HORIZONTAL GROUPING:
   ❌ Not Allowed:
       src/services/
       src/repositories/
       src/mappers/

   ✅ Allowed:
       src/api/user/repository/
       src/api/order/repository/

9. SHARED LOGIC RULE:
   - Only truly reusable logic may go into:
       shared/
       common/
   - If used by a single feature → keep inside that feature.

═══════════════════════════════════════════════════════════
3. DOMAIN & MODULE BOUNDARIES
═══════════════════════════════════════════════════════════

10. DOMAIN OWNERSHIP:
   - Business logic must belong to its true domain.
   - Data ownership ≠ Business ownership.
   - Never place cross-entity logic inside unrelated modules.
   - If a new business concept emerges → create a new module.

11. CROSS-MODULE COMMUNICATION:
   - Modules communicate only through public service interfaces.
   - Use Injection Tokens.
   - Circular dependencies strictly forbidden.
   - No deep imports across features.
`,
  database: `
═══════════════════════════════════════════════════════════
4. DATABASE ARCHITECTURE
═══════════════════════════════════════════════════════════

12. GENERIC DB FACTORY:
   - All CRUD operations must go through GenericDbFactory.
   - GenericDbFactory lives in shared/db/.
   - No model.findOne(), create(), update() inside service.
   - DB errors handled in factory.
   - Log before rethrowing.

13. QUERY SEPARATION:
   - Complex queries must live in repository/{feature}.queries.ts.
   - Queries must not contain business logic.

14. MODEL STANDARD:
   - Use @Table({ paranoid: true }).
   - Explicit DataTypes.
   - Typed Model<InferAttributes, InferCreationAttributes>.
   - Add indexes on foreign keys and common filters.

15. TRANSACTION RULE:
   - Multi-step DB operations must use transactions.
   - Transactions handled only inside DbFactory.
   - Never manage transactions inside controller or service.

16. NO N+1:
   - Always use include for eager loading.

17. QUERY ATTRIBUTE FILTERING (MANDATORY):
   - All queries MUST specify 'attributes'.
   - Avoid 'SELECT *'. Only fetch columns required for the operation.
   - Define common attribute sets in {feature}.queries.ts.

18. PRIMARY KEY NAMING CONVENTION (MANDATORY):
   - All primary keys MUST follow the convention: {table_name}_id.
   - Example: user_id for 'users' table, order_id for 'orders' table.
   - NO standard 'id' field is permitted.
`,
  service: `
═══════════════════════════════════════════════════════════
5. SERVICE LAYER RULES
═══════════════════════════════════════════════════════════

165. EXCEPTION MAPPING IN SERVICE (OPTION 1):
   - Catch specific database/ORM errors (e.g., UniqueConstraintError) in the Service or Repository.
   - Map them to logical, frontend-friendly HTTP Exceptions (e.g., ConflictException).
   - Do NOT expose raw DB errors to the client.
   - For unknown errors, throw them to be handled by the global filter.
   - DB factory must allow these errors to bubble up for mapping.

18. BASE SERVICE RULE:
   - All services extend BaseService<TRepository>.
   - BaseService provides:
       - logger
       - pagination helper
       - cache helper
       - existence validator
   - No business logic inside BaseService.

19. MAPPER RULE:
   - Mapping must be inside mapper/{feature}.mapper.ts.
   - Never return raw Sequelize models.
   - Mapping must not exist in controller.
`,
  crossCutting: `
═══════════════════════════════════════════════════════════
6. CROSS-CUTTING CONCERNS
═══════════════════════════════════════════════════════════

20. RESPONSE ENVELOPE:
   Success:
     { success: true, data, message?, meta? }

21. GLOBAL ERROR FORMAT:
   { success: false, statusCode, message, timestamp }

22. PAGINATION:
   - Shared PaginationQuerySchema (Zod).
   - Shared buildPaginationMeta().
   - Mandatory for list endpoints.

23. CACHE:
   - Use ICacheService abstraction.
   - Redis implementation only.
   - Cache-aside pattern.
   - Cache keys stored in constants/.

24. LOGGING STANDARD:
   - Every class must define:
     private readonly logger = new Logger(ClassName.name);
   - No console.log.

25. SOLID PRINCIPLES (STRICT):
   - S: Single Responsibility (Every method MUST do exactly one thing).
   - O: Open/Closed (Registry pattern for tools/prompts).
   - L/I/D: Interface-driven design + Injection Tokens.

26. CLEAN CODE & DRY:
   - Methods must be concise (< 20 lines preferred).
   - Use meaningful, searchable names.
   - NO code duplication; extract shared logic to private helpers or utility classes.
   - KISS: Keep it Simple, Stupid. Avoid over-engineering.

27. METHOD NAMING CONVENTION (STRICT):
   - Names MUST be relative and descriptive of the work they perform.
   - Use verb-noun pairs: \`getUserById\`, \`calculateTotalAmount\`, \`validateToken\`.
   - Avoid generic or random names like \`handle\`, \`process\`, \`doWork\`, \`fn1\`.
   - Boolean methods must start with \`is\`, \`has\`, or \`should\`.

228. LOG LEVEL RULE (TRAFFIC LIGHT SCHEME):
   - Use a traffic light color scheme (e.g., emojis) for better readability in logs.
   - 🟢 log   → success / meaningful info / normal operations
   - 🟡 warn  → expected failure / business exception mapped / logical error
   - 🔴 error → unexpected failure / 500 crash
   - ⚪ debug → method entry / verbose data

26. NEVER LOG:
   - passwords
   - tokens
   - full PII objects

   ═══════════════════════════════════════════════════════════
6.1 ERROR HANDLING & RESPONSE STANDARDIZATION
═══════════════════════════════════════════════════════════

6.1.1 MANDATORY EXCEPTION MAPPING IN SERVICE (OPTION 1):
   - Services MUST catch specific database exceptions (e.g., UniqueConstraintError).
   - Map them to logical, frontend-friendly Business Exceptions (e.g., ConflictException('Email already exists')).
   - Give the frontend specific, actionable logical error messages.
   - Do not use empty try/catch blocks; only catch what you handle.

6.1.2 GLOBAL ERROR HANDLING:
   - Use AllExceptionsFilter.
   - Use catchAsync wrapper for controllers.
   - GenericDbFactory handles DB errors.

6.1.3 BUSINESS EXCEPTIONS:
   - NotFoundException
   - BadRequestException
   - ForbiddenException

6.1.4 ERROR RESPONSE SHAPE:
{
  success: false,
  statusCode: number,
  message: string,
  timestamp: string
}

6.1.5 SUCCESS RESPONSE ENVELOPE:
{
  success: true,
  data: T,
  message?: string,
  meta?: PaginationMeta
}

6.1.6 RESPONSE INTERCEPTOR REQUIRED:
   - Automatically wrap responses.
   - Never return raw data.

6.1.7 PAGINATION:
   - Shared PaginationQuerySchema (Zod).
   - Shared buildPaginationMeta().
   - Mandatory for list endpoints.
`,
  security: `
═══════════════════════════════════════════════════════════
7. SECURITY & PERFORMANCE
═══════════════════════════════════════════════════════════

27. JWT + ROLE GUARDS:
   - All protected routes must use JwtGuard + RolesGuard.

28. PASSWORD HASHING:
   - bcrypt saltRounds ≥ 12.

29. INPUT SANITIZATION:
   - Trim string inputs.
   - Normalize emails to lowercase.
   - Never trust client IDs blindly.

30. IDEMPOTENCY:
   - Critical write endpoints must be idempotent when applicable.
   - Use unique constraints or idempotency keys.
`,
  cleanCode: `
═══════════════════════════════════════════════════════════
8. CLEAN CODE RULES
═══════════════════════════════════════════════════════════

31. FUNCTION SIZE:
   - Max 25 lines per function.

32. NO DUPLICATION:
   - Extract shared logic to shared/ or common/.

33. NO MAGIC STRINGS:
   - Use constants/{feature}.constants.ts.

34. EARLY RETURN:
   - Avoid deep nesting.

35. NAMING STANDARD:
   - Services end with Service.
   - Controllers end with Controller.
   - Interfaces prefixed with I.
   - Injection tokens in UPPER_SNAKE_CASE.
   - DTO schemas end with Schema.

36. DEAD CODE POLICY:
   - No commented-out code.
   - No unused variables.
   - No unused exports.

37. SINGLE RESPONSIBILITY:
   - One responsibility per class.
   - If class exceeds 300 lines → suggest splitting.

38. FUNCTION NAMING RULE:
   - Naming should be directly related to the function/method's work.
   - No max length limit, but should be reasonable and descriptive.
`,
  swagger: `
═══════════════════════════════════════════════════════════
9. SWAGGER / API DOCUMENTATION (MANDATORY)
═══════════════════════════════════════════════════════════

39. SWAGGER REQUIRED:
   - Every new controller MUST be fully documented using @nestjs/swagger.
   - No undocumented endpoints allowed.

40. CONTROLLER DECORATORS (MANDATORY):
   Every controller must include:
     - @ApiTags('{feature}')
     - @ApiBearerAuth() for protected routes
     - @ApiOperation()
     - @ApiResponse() for success
     - @ApiBadRequestResponse()
     - @ApiUnauthorizedResponse() (if protected)
     - @ApiNotFoundResponse() (if applicable)

41. DTO DOCUMENTATION RULE:
   - Even though Zod is used for validation,
     Swagger-compatible DTO classes MUST be created
     strictly for documentation purposes.
   - Use @ApiProperty() inside documentation DTO.
   - Documentation DTO must match Zod schema exactly.
   - Name them:
       CreateUserSwaggerDto
       UpdateUserSwaggerDto
       UserResponseSwaggerDto

42. PAGINATION SWAGGER RULE:
   - List endpoints must document:
       - page
       - limit
   - Response must show:
       {
         success: true,
         data: T[],
         meta: PaginationMeta
       }

43. RESPONSE ENVELOPE DOCUMENTATION:
   - Swagger must reflect the standardized success envelope.
   - Never document raw entity response.
   - Always document wrapped response structure.

44. GLOBAL SWAGGER SETUP (MAIN.TS):
   - Swagger must be initialized in main.ts.
   - Title, description, version must be defined.
   - BearerAuth must be configured.
   - Swagger route must be:
       /docs

45. NO SWAGGER DECORATOR INSIDE SERVICE:
   - Swagger decorators allowed only in controller and documentation DTO.
   - Never inside service, repository, or mapper.

46. AUTO-CONSISTENCY RULE:
   - Swagger response type must match actual returned type.
   - If mismatch detected → refactor before returning code.
`,
  environment: `
   ═══════════════════════════════════════════════════════════
10. ENVIRONMENT VALIDATION (MANDATORY - ZOD ONLY)
═══════════════════════════════════════════════════════════

47. NO DIRECT process.env USAGE:
   - Direct usage of process.env is strictly forbidden.
   - All environment variables must be accessed via typed env object.

48. ZOD ENV VALIDATION REQUIRED:
   - Environment variables must be validated at application bootstrap.
   - Use Zod schema for validation.
   - App must crash if validation fails.

49. ENV FILE LOCATION (COMMON ONLY):
   - Env validation must live in:
       src/common/env/env.schema.ts
       src/common/env/env.ts
   - Must not live inside any feature module.

50. ENV SCHEMA RULE:
   - Must use Zod.
   - All required variables must be explicitly defined.
   - Use:
       - z.string().min(1)
       - z.coerce.number()
       - z.enum()
   - No optional critical variables.

51. EXPORT TYPED ENV:
   - Export a fully typed object:
       export const env: Env
   - Use:
       export type Env = z.infer<typeof EnvSchema>;

52. NORMALIZATION RULE:
   - Trim strings.
   - Convert numeric strings using z.coerce.number().
   - Convert boolean using z.coerce.boolean().

53. FAIL FAST RULE:
   - If validation fails:
       - Log formatted error.
       - Exit process with code 1.

54. USAGE RULE:
   - Use:
       import { env } from '@/common/env/env';
   - Access:
       env.JWT_SECRET
       env.DB_HOST
   - Never access process.env directly anywhere in codebase.
55. ENV IMMUTABILITY RULE:
   - env object must be frozen using Object.freeze().
   - No runtime mutation allowed.   
`,

  orchestration: `
═══════════════════════════════════════════════════════════
12. ORCHESTRATION & FACADE PATTERNS (MANDATORY)
═══════════════════════════════════════════════════════════

68. FACADE PATTERN FOR WORKFLOWS:
   - Any service coordinating multiple external domains (e.g., Cloud, SSH, DNS, DB) MUST act strictly as a Facade.
   - A Facade Service must ONLY delegate tasks to specific domain services.
   - A Facade Service must NOT contain low-level implementation logic.

69. INFRASTRUCTURE ABSTRACTION:
   - NEVER instantiate native/low-level libraries (like \`new NodeSSH()\`, \`Axios\`, or \`fs\`) directly inside a business or workflow service.
   - Low-level network calls (like \`httpPost\` to an external API) MUST be abstracted into dedicated Infrastructure Services (e.g., \`DnsService\`).
   - Shell commands and remote executions MUST be handled by a dedicated \`SshService\`.

70. SINGLE RESPONSIBILITY IN DELEGATION:
   - Example Violation: A \`ServerService\` registering DNS records itself.
   - Correct Approach: \`ServerService\` calls \`CloudProviderFactory\` to get an IP, then calls \`SshService\` to run scripts, then calls \`DnsService\` to map the IP.
`,
  scoring: `
═══════════════════════════════════════════════════════════
11. AI SELF-AUDIT SCORING SYSTEM (MANDATORY)
═══════════════════════════════════════════════════════════

56. SCORING REQUIREMENT:
   - Every generated code must be internally scored.
   - Minimum acceptable score: 90/100.
   - If score < 90 → auto-refactor before returning.

57. ARCHITECTURE CHECK (20 points):
   - Correct feature folder structure.
   - No horizontal grouping.
   - Repository inside repository/ folder.
   - No deep imports.
   - No cross-domain leakage.

58. TYPESCRIPT STRICTNESS (15 points):
   - Zero 'any'.
   - Explicit return types.
   - Proper generics usage.

59. ZOD VALIDATION QUALITY (15 points):
   - Custom messages present for all fields (using explicit required_error/invalid_type_error OR concise error: shorthand).
   - Custom messages for all rules (min, max, email, enum, uuid, etc.).
   - No generic Zod errors allowed.

59. DATABASE COMPLIANCE (10 points):
   - No raw Sequelize inside service.
   - DbFactory used.
   - Queries separated.

60. SERVICE LAYER CHECK (10 points):
   - Extends BaseService.
   - Proper error mapping used (Option 1).
   - Logger exists.
   - No business logic in controller.

61. MAPPER CHECK (10 points):
   - No raw model returned.
   - Mapper used properly.

62. ENV CHECK (10 points):
   - No direct process.env.
   - Uses typed env from common/env.

63. SWAGGER CHECK (10 points):
   - ApiTags present.
   - ApiOperation present.
   - ApiResponse documented.
   - BearerAuth if protected.

64. RESPONSE STANDARDIZATION (5 points):
   - Response envelope respected.
   - Pagination meta included when required.

65. SECURITY CHECK (5 points):
   - Guards used for protected routes.
   - No sensitive logging.

66. CLEAN CODE CHECK (5 points):
   - Function < 25 lines.
   - No magic strings.
   - No unused imports.
   - No dead code.

67. AUTO-REFINE RULE:
   - If any critical violation found:
       - Refactor before returning.
       - Never return rule-breaking code.

68. ORCHESTRATION CHECK (10 points):
   - Workflow/service does not instantiate low-level libraries directly.
   - SSH, DNS, HTTP calls are delegated to dedicated infrastructure services.
   - Service acts as a Facade: only orchestrates, never implements low-level details.
`
};

export const NEST_PRO_RULES = `
You are a Senior Full-Stack Architect specializing in NestJS, Sequelize, and TypeScript.
Generate production-grade, scalable, maintainable backend code.
Never violate the rules below.

${Object.values(RULE_CHUNKS).join('\n')}
`;
