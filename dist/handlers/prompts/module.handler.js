import { NEST_PRO_RULES } from '../../rules/nest-rules.js';
export class ModulePromptHandler {
    definition = {
        name: 'module',
        description: 'Generates a complete NestJS feature module scaffold: controller, service, repository, queries, model, interface, and Zod DTOs.',
        arguments: [
            {
                name: 'featureName',
                description: 'Name of the feature (e.g. user, product, order)',
                required: true,
            },
        ],
    };
    handle(args) {
        const featureName = args.featureName ?? 'feature';
        const Feature = featureName.charAt(0).toUpperCase() + featureName.slice(1);
        const FEATURE_UPPER = featureName.toUpperCase();
        return {
            messages: [
                {
                    role: 'user',
                    content: {
                        type: 'text',
                        text: `${NEST_PRO_RULES}

### 🚀 TASK: Generate Complete "${Feature}" Feature Module
Generate a production-grade NestJS feature module for "${featureName}" following the **MANDATORY** feature-based structure.

### 📂 REQUIRED FOLDER STRUCTURE
src/api/${featureName}/
├── ${featureName}.module.ts
├── ${featureName}.controller.ts
├── ${featureName}.service.ts
├── repository/
│   ├── ${featureName}.repository.ts
│   └── ${featureName}.queries.ts
├── mapper/
│   └── ${featureName}.mapper.ts
├── interfaces/
│   └── ${featureName}.interface.ts
├── entities/
│   └── ${featureName}.entity.ts
├── constants/
│   └── ${featureName}.constants.ts
└── dto/
    ├── ${featureName}.dto.ts          (Zod schemas + inferred types)
    └── ${featureName}-swagger.dto.ts  (Class-based Swagger documentation DTOs)

### 🛡️ STRICT IMPLEMENTATION RULES
1. **CONTROLLER**:
   - MUST use \`@ApiTags('${featureName}')\`, \`@ApiBearerAuth()\`, and \`@ApiOperation()\`.
   - ALL async methods MUST be wrapped in \`catchAsync(async (req, res) => { ... })\`.
   - MALL incoming data (body/query/params) MUST be validated with \`ZodValidationPipe\`.
   - Never return raw models; use \`${Feature}Mapper\` to transform data to DTOs.

2. **SERVICE**:
   - MUST implement \`I${Feature}Service\` interface.
   - MUST use \`InjectRepository\` via interface token, never direct class injection.
   - Only business logic; delegate data access to Repository.

3. **REPOSITORY**:
   - MUST implement \`I${Feature}Repository\`.
   - ALL CRUD operations MUST use \`GenericDbFactory\`.
   - ALL queries in \`${featureName}.queries.ts\` MUST specify \`attributes\` (NO SELECT *).

4. **DEPENDENCY INJECTION**:
   - Define and use Symbol tokens in \`interfaces/${featureName}.interface.ts\`:
     \`export const ${FEATURE_UPPER}_SERVICE_TOKEN = Symbol('${FEATURE_UPPER}_SERVICE_TOKEN');\`
     \`export const ${FEATURE_UPPER}_REPOSITORY_TOKEN = Symbol('${FEATURE_UPPER}_REPOSITORY_TOKEN');\`

5. **ENTITY**:
   - MUST use \`Model<InferAttributes<${Feature}Entity>, InferCreationAttributes<${Feature}Entity>>\`.
   - **MANDATORY PK**: The primary key MUST be named \`${featureName}_id\` (e.g., \`user_id\` for users). Standard \`id\` is FORBIDDEN.
   - Use \`@Table({ paranoid: true })\`.

6. **LOGGING**:
   - Explicit Logger in every class: \`private readonly logger = new Logger(${Feature}.name)\`.
   - DEBUG on entries, LOG on success, WARN on expected failures.

7. **CLEAN CODE & SOLID (MANDATORY)**:
   - **SRP**: Every method MUST have a single responsibility.
   - **DRY**: Do not repeat code; use private helpers or common utilities.
   - **NAMING**: Every method name MUST be relative and descriptive (verb-noun pairs). Avoid random names like \`handle\` or \`process\`.
   - **Method Length**: Keep methods concise and focused.

Include standard CRUD operations with proper multi-layered error handling and pagination metadata.`,
                    },
                },
            ],
        };
    }
}
//# sourceMappingURL=module.handler.js.map