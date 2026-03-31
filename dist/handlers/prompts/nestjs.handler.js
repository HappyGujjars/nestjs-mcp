import { NEST_PRO_RULES } from '../../rules/nest-rules.js';
export class NestjsPromptHandler {
    definition = {
        name: 'rules',
        description: 'Activates Senior Full-Stack Architect mode: enforces strict NestJS + Sequelize coding standards, Zod validation, design patterns, and clean architecture.',
    };
    handle(_args) {
        return {
            messages: [
                {
                    role: 'user',
                    content: {
                        type: 'text',
                        text: `${NEST_PRO_RULES}\n\nYou are now operating as a Senior Full-Stack Architect. Apply ALL the above standards to every piece of code you write or review. Confirm you understand these rules before proceeding.`,
                    },
                },
            ],
        };
    }
}
//# sourceMappingURL=nestjs.handler.js.map