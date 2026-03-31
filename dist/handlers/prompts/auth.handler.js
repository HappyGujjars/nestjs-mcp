import { NEST_PRO_RULES } from '../../rules/nest-rules.js';
export class AuthPromptHandler {
    definition = {
        name: 'auth-module',
        description: 'Implements a production-grade Authorization Module with Access/Refresh tokens, Redis state management, and OIDC support (Google, Apple, Facebook, GitHub).',
    };
    handle(_args) {
        return {
            messages: [
                {
                    role: 'user',
                    content: {
                        type: 'text',
                        text: `${NEST_PRO_RULES}\n\nYou are now implementing a production-grade Authorization Module. 
            
            Key requirements:
            1. Access and Refresh tokens (stateful Refresh tokens in Redis).
            2. OIDC support for Google, Apple, Facebook, and GitHub.
            3. Standardized response envelopes and error handling (MANDATORY: wrap all async controller methods in catchAsync).
            4. Zod-based DTOs and Swagger documentation (MANDATORY: use ZodValidationPipe for all controller inputs).
            5. Strict adherence to Nest Pro Architect standards (feature-based structure, interfaces, injection tokens, and MANDATORY GenericDbFactory + attribute filtering + {table_name}_id primary keys, plus STRICT adherence to SOLID and descriptive method naming).
            
            Confirm you understand these requirements before proceeding.`,
                    },
                },
            ],
        };
    }
}
//# sourceMappingURL=auth.handler.js.map