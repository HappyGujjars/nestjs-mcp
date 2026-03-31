export const BOILERPLATES = {
    'generic-db-factory': `
// src/common/factory/generic-db.factory.ts
import {
  Injectable,
  Logger,
  NotFoundException,
  InternalServerErrorException,
} from '@nestjs/common';
import {
  Model,
  ModelStatic,
  FindOptions,
  CreateOptions,
  WhereOptions,
} from 'sequelize';

export interface GetRecordOptions extends FindOptions {
  /**
   * When true, throws NotFoundException if no record is found.
   * Use this in service methods that REQUIRE a record to exist (e.g. findById).
   */
  throwIfNotFound?: boolean;
  /** Human-readable label used in the not-found error message, e.g. 'User' */
  entityLabel?: string;
}

@Injectable()
export class GenericDbFactory {
  private readonly logger = new Logger(GenericDbFactory.name);

  // ─── READ ────────────────────────────────────────────────────────────────

  /**
   * Find a single record.
   * Pass throwIfNotFound: true + entityLabel for automatic NotFoundException.
   */
  async getRecord<T extends Model>(
    model: ModelStatic<T>,
    options: GetRecordOptions,
  ): Promise<T | null> {
    const { throwIfNotFound = false, entityLabel, ...findOptions } = options;
    const modelName = model.name;

    this.logger.debug(\`[getRecord] ⚪ \${modelName} | query: \${JSON.stringify(findOptions.where ?? {})}\`);

    try {
      const record = await model.findOne(findOptions);

      if (!record) {
        this.logger.warn(\`[getRecord] 🟡 \${modelName} not found | where: \${JSON.stringify(findOptions.where ?? {})}\`);
        if (throwIfNotFound) {
          throw new NotFoundException(\`\${entityLabel ?? modelName} not found\`);
        }
      } else {
        const pk = (model as any).primaryKeyAttribute || 'id';
        this.logger.debug(\`[getRecord] ⚪ \${modelName} found | \${pk}: \${(record as any)[pk] ?? 'N/A'}\`);
      }

      return record;
    } catch (err) {
      if (err instanceof NotFoundException) throw err;
      this.logger.error(\`[getRecord] 🔴 \${modelName} DB error\`, err instanceof Error ? err.stack : String(err));
      throw err;
    }
  }

  /** Find all records matching options. Logs result count. */
  async getRecords<T extends Model>(
    model: ModelStatic<T>,
    options: FindOptions,
  ): Promise<T[]> {
    const modelName = model.name;
    this.logger.debug(\`[getRecords] ⚪ \${modelName} | query: \${JSON.stringify(options.where ?? {})}\`);

    try {
      const records = await model.findAll(options);
      this.logger.debug(\`[getRecords] ⚪ \${modelName} → \${records.length} record(s) returned\`);
      return records;
    } catch (err) {
      this.logger.error(\`[getRecords] 🔴 \${modelName} DB error\`, err instanceof Error ? err.stack : String(err));
      throw err;
    }
  }

  // ─── WRITE ───────────────────────────────────────────────────────────────

  /** Create a single record. Logs the created record's id. */
  async createRecord<T extends Model>(
    model: ModelStatic<T>,
    data: T['_creationAttributes'],
    options?: CreateOptions,
  ): Promise<T> {
    const modelName = model.name;
    this.logger.debug(\`[createRecord] ⚪ \${modelName} | payload keys: [\${Object.keys(data as object).join(', ')}]\`);

    try {
      const record = await model.create(data, options);
      const pk = (model as any).primaryKeyAttribute || 'id';
      this.logger.log(\`[createRecord] 🟢 \${modelName} created | \${pk}: \${(record as any)[pk]}\`);
      return record;
    } catch (err) {
      this.logger.error(\`[createRecord] 🔴 \${modelName} DB error\`, err instanceof Error ? err.stack : String(err));
      throw err;
    }
  }

  /**
   * Update a record by id.
   * Throws NotFoundException when 0 rows are affected.
   */
  async updateRecord<T extends Model>(
    model: ModelStatic<T>,
    id: number | string,
    data: Partial<T['_attributes']>,
  ): Promise<[number, T[]]> {
    const modelName = model.name;
    this.logger.debug(\`[updateRecord] ⚪ \${modelName} | id: \${id} | fields: [\${Object.keys(data as object).join(', ')}]\`);

    try {
      const pk = (model as any).primaryKeyAttribute || 'id';
      const result = await model.update(data, {
        where: { [pk]: id } as WhereOptions,
        returning: true,
      }) as [number, T[]];

      const [affectedCount] = result;
      if (affectedCount === 0) {
        this.logger.warn(\`[updateRecord] 🟡 \${modelName} id:\${id} not found — 0 rows affected\`);
        throw new NotFoundException(\`\${modelName} with id \${id} not found\`);
      }

      this.logger.log(\`[updateRecord] 🟢 \${modelName} id:\${id} updated | affected: \${affectedCount}\`);
      return result;
    } catch (err) {
      if (err instanceof NotFoundException) throw err;
      this.logger.error(\`[updateRecord] 🔴 \${modelName} DB error\`, err instanceof Error ? err.stack : String(err));
      throw err;
    }
  }

  /**
   * Soft-delete (or hard-delete) a record by id.
   * Throws NotFoundException when 0 rows are destroyed.
   */
  async deleteRecord<T extends Model>(
    model: ModelStatic<T>,
    id: number | string,
  ): Promise<number> {
    const modelName = model.name;
    this.logger.debug(\`[deleteRecord] ⚪ \${modelName} | id: \${id}\`);

    try {
      const pk = (model as any).primaryKeyAttribute || 'id';
      const count = await model.destroy({ where: { [pk]: id } as WhereOptions });

      if (count === 0) {
        this.logger.warn(\`[deleteRecord] 🟡 \${modelName} id:\${id} not found — nothing deleted\`);
        throw new NotFoundException(\`\${modelName} with id \${id} not found\`);
      }

      this.logger.log(\`[deleteRecord] 🟢 \${modelName} id:\${id} deleted\`);
      return count;
    } catch (err) {
      if (err instanceof NotFoundException) throw err;
      this.logger.error(\`[deleteRecord] 🔴 \${modelName} DB error\`, err instanceof Error ? err.stack : String(err));
      throw err;
    }
  }

  // ─── BULK ────────────────────────────────────────────────────────────────

  /** Bulk-create records. Logs the count of records created. */
  async bulkCreate<T extends Model>(
    model: ModelStatic<T>,
    data: T['_creationAttributes'][],
  ): Promise<T[]> {
    const modelName = model.name;
    this.logger.debug(\`[bulkCreate] ⚪ \${modelName} | count: \${data.length}\`);

    try {
      const records = await model.bulkCreate(data);
      this.logger.log(\`[bulkCreate] 🟢 \${modelName} → \${records.length} record(s) created\`);
      return records;
    } catch (err) {
      this.logger.error(\`[bulkCreate] 🔴 \${modelName} DB error\`, err instanceof Error ? err.stack : String(err));
      throw err;
    }
  }

  /**
   * Find or create a record by where clause.
   * Logs whether a new record was created or an existing one was found.
   */
  async findOrCreate<T extends Model>(
    model: ModelStatic<T>,
    where: WhereOptions,
    defaults: T['_creationAttributes'],
  ): Promise<[T, boolean]> {
    const modelName = model.name;
    this.logger.debug(\`[findOrCreate] ⚪ \${modelName} | where: \${JSON.stringify(where)}\`);

    try {
      const [record, created] = await model.findOrCreate({ where, defaults });
      this.logger.log(
        \`[findOrCreate] 🟢 \${modelName} | \${created ? 'CREATED new' : 'FOUND existing'} record | id: \${(record as unknown as { id: unknown }).id}\`,
      );
      return [record, created];
    } catch (err) {
      this.logger.error(\`[findOrCreate] 🔴 \${modelName} DB error\`, err instanceof Error ? err.stack : String(err));
      throw err;
    }
  }
}

/*
 * ─── USAGE EXAMPLE (in a repository) ────────────────────────────────────────
 *
 * // Throws NotFoundException automatically if user doesn't exist:
 * async findById(id: number): Promise<User> {
 *   return this.db.getRecord(this.userModel, {
 *     ...USER_QUERIES.findById(id),
 *     throwIfNotFound: true,
 *     entityLabel: 'User',
 *   }) as Promise<User>;
 * }
 *
 * // Returns null if not found (caller decides what to do):
 * async findByEmail(email: string): Promise<User | null> {
 *   return this.db.getRecord(this.userModel, USER_QUERIES.findByEmail(email));
 * }
 *
 * // update/delete automatically throw NotFoundException on 0 rows affected.
 * ─────────────────────────────────────────────────────────────────────────────
 */
`,
    'zod-validation-pipe': `
// src/common/pipes/zod-validation.pipe.ts
import { PipeTransform, Injectable, BadRequestException } from '@nestjs/common';
import { ZodSchema, ZodError } from 'zod';

@Injectable()
export class ZodValidationPipe implements PipeTransform {
  constructor(private readonly schema: ZodSchema) {}

  transform(value: unknown): unknown {
    const result = this.schema.safeParse(value);
    if (!result.success) {
      const errors = (result.error as ZodError).errors.map((e) => ({
        field: e.path.join('.'),
        message: e.message,
      }));
      throw new BadRequestException({ message: 'Validation failed', errors });
    }
    return result.data;
  }
}
`,
    'global-exception-filter': `
// src/common/filters/all-exceptions.filter.ts
import {
  ExceptionFilter, Catch, ArgumentsHost,
  HttpException, HttpStatus, Logger,
} from '@nestjs/common';
import { Request, Response } from 'express';

@Catch()
export class AllExceptionsFilter implements ExceptionFilter {
  private readonly logger = new Logger(AllExceptionsFilter.name);

  catch(exception: unknown, host: ArgumentsHost): void {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();

    const status =
      exception instanceof HttpException
        ? exception.getStatus()
        : HttpStatus.INTERNAL_SERVER_ERROR;

    const message =
      exception instanceof HttpException
        ? exception.getResponse()
        : 'Internal server error';

    const logMessage = \`[\${request.method}] \${request.url} → \${status}: \${typeof message === 'object' ? JSON.stringify(message) : message}\`;
    if (status >= 500) {
      this.logger.error(\`🔴 \${logMessage}\`);
    } else {
      this.logger.warn(\`🟡 \${logMessage}\`);
    }

    response.status(status).json({
      success: false,
      statusCode: status,
      message,
      timestamp: new Date().toISOString(),
      path: request.url,
    });
  }
}
`,
    'response-interceptor': `
// src/common/interceptors/response.interceptor.ts
import {
  Injectable, NestInterceptor, ExecutionContext, CallHandler,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

export interface ApiResponse<T> {
  success: boolean;
  data: T;
  message?: string;
  timestamp: string;
}

@Injectable()
export class ResponseInterceptor<T> implements NestInterceptor<T, ApiResponse<T>> {
  intercept(_ctx: ExecutionContext, next: CallHandler<T>): Observable<ApiResponse<T>> {
    return next.handle().pipe(
      map((data) => ({
        success: true,
        data,
        timestamp: new Date().toISOString(),
      }))
    );
  }
}
`,
    catchAsync: `
// src/common/utils/catch-async.util.ts
import { RequestHandler, Request, Response, NextFunction } from 'express';

export const catchAsync = (fn: RequestHandler): RequestHandler =>
  (req: Request, res: Response, next: NextFunction): void => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };

// NestJS controller usage — wrap async methods:
// @Get(':id')
// getUser = catchAsync(async (req, res) => {
//   const user = await this.userService.findById(req.params.id);
//   res.json(user);
// });
`,
    'jwt-guard': `
// src/common/guards/jwt.guard.ts
import { Injectable, ExecutionContext, UnauthorizedException } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { Reflector } from '@nestjs/core';
import { IS_PUBLIC_KEY } from '../decorators/public.decorator';

@Injectable()
export class JwtGuard extends AuthGuard('jwt') {
  constructor(private readonly reflector: Reflector) {
    super();
  }

  canActivate(context: ExecutionContext): boolean | Promise<boolean> {
    const isPublic = this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);
    if (isPublic) return true;
    return super.canActivate(context) as boolean | Promise<boolean>;
  }

  handleRequest<TUser>(err: Error | null, user: TUser): TUser {
    if (err || !user) throw new UnauthorizedException('Invalid or expired token');
    return user;
  }
}
`,
    'strategy-pattern': `
// Strategy Pattern Example — Payment Processing
// src/modules/payment/strategies/payment.strategy.interface.ts
export interface IPaymentStrategy {
  process(data: PaymentData): Promise<PaymentResult>;
  validate(data: PaymentData): boolean;
}

// src/modules/payment/strategies/stripe.strategy.ts
@Injectable()
export class StripeStrategy implements IPaymentStrategy {
  async process(data: PaymentData): Promise<PaymentResult> {
    // Stripe-specific processing
    return { transactionId: 'stripe_xxx', status: 'success' };
  }
  validate(data: PaymentData): boolean {
    return !!data.stripeToken;
  }
}

// src/modules/payment/payment.context.ts
@Injectable()
export class PaymentContext {
  private strategy!: IPaymentStrategy;

  setStrategy(strategy: IPaymentStrategy): void {
    this.strategy = strategy;
  }

  async execute(data: PaymentData): Promise<PaymentResult> {
    if (!this.strategy.validate(data)) {
      throw new BadRequestException('Invalid payment data');
    }
    return this.strategy.process(data);
  }
}
`,
    'repository-pattern': `
// src/modules/user/user.repository.ts
import { Injectable, Logger } from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { GenericDbFactory } from '../../common/factory/generic-db.factory';
import { User } from './user.model';
import { IUserRepository } from './user.interface';
import { USER_QUERIES } from './user.queries';
import type { UserCreationAttributes, UserAttributes } from './user.interface';

@Injectable()
export class UserRepository implements IUserRepository {
  private readonly logger = new Logger(UserRepository.name);

  constructor(
    @InjectModel(User) private readonly userModel: typeof User,
    private readonly db: GenericDbFactory,
  ) {}

  // Throws NotFoundException if user doesn't exist
  async findById(id: number): Promise<User> {
    this.logger.debug(\`[findById] delegating to db | id:\${id}\`);
    return this.db.getRecord(this.userModel, {
      ...USER_QUERIES.findById(id),
      throwIfNotFound: true,
      entityLabel: 'User',
    }) as Promise<User>;
  }

  // Returns null if not found — caller decides
  async findByEmail(email: string): Promise<User | null> {
    this.logger.debug(\`[findByEmail] delegating to db | email:\${email}\`);
    return this.db.getRecord(this.userModel, USER_QUERIES.findByEmail(email));
  }

  async findAllPaginated(page: number, limit: number): Promise<User[]> {
    this.logger.debug(\`[findAllPaginated] page:\${page} limit:\${limit}\`);
    return this.db.getRecords(this.userModel, USER_QUERIES.paginated(page, limit));
  }

  async create(data: UserCreationAttributes): Promise<User> {
    this.logger.debug(\`[create] delegating to db\`);
    return this.db.createRecord(this.userModel, data);
  }

  // Throws NotFoundException if id doesn't exist
  async update(id: number, data: Partial<UserAttributes>): Promise<[number, User[]]> {
    this.logger.debug(\`[update] delegating to db | id:\${id}\`);
    return this.db.updateRecord(this.userModel, id, data);
  }

  // Throws NotFoundException if id doesn't exist
  async delete(id: number): Promise<number> {
    this.logger.debug(\`[delete] delegating to db | id:\${id}\`);
    return this.db.deleteRecord(this.userModel, id);
  }
}
`,
    'logging-interceptor': `
// src/common/interceptors/logging.interceptor.ts
import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
  Logger,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';
import { Request, Response } from 'express';

/**
 * Globally logs every HTTP request:
 *   DEBUG → incoming: method + url + userId (if authed)
 *   LOG   → outgoing: method + url + statusCode + duration in ms
 *
 * Register globally in main.ts:
 *   app.useGlobalInterceptors(new LoggingInterceptor());
 * Or per-module:
 *   @UseInterceptors(LoggingInterceptor)
 */
@Injectable()
export class LoggingInterceptor implements NestInterceptor {
  private readonly logger = new Logger(LoggingInterceptor.name);

  intercept(context: ExecutionContext, next: CallHandler): Observable<unknown> {
    const req = context.switchToHttp().getRequest<Request & { user?: { id: unknown } }>();
    const res = context.switchToHttp().getResponse<Response>();
    const { method, url } = req;
    const userId = req.user?.id ?? 'unauthenticated';
    const startedAt = Date.now();

    this.logger.debug(\`⚪ → \${method} \${url} | userId:\${userId}\`);

    return next.handle().pipe(
      tap({
        next: () => {
          const ms = Date.now() - startedAt;
          this.logger.log(\`🟢 ← \${method} \${url} \${res.statusCode} [\${ms}ms] | userId:\${userId}\`);
        },
        error: (err: unknown) => {
          const ms = Date.now() - startedAt;
          const status = err instanceof Error && 'status' in err
            ? (err as { status: number }).status
            : 500;
          if (status >= 500) {
            this.logger.error(\`🔴 ← \${method} \${url} \${status} [\${ms}ms]\`, err instanceof Error ? err.stack : String(err));
          } else {
            this.logger.warn(\`🟡 ← \${method} \${url} \${status} [\${ms}ms] | \${err instanceof Error ? err.message : String(err)}\`);
          }
        },
      }),
    );
  }
}
`,
    'function-naming': `
// Naming Convention Example — Function/Method Naming
// src/modules/user/user.service.ts
import { Injectable, Logger, BadRequestException } from '@nestjs/common';
import { IUserService } from './user.interface';

  // ✅ GOOD: Read queries indicate exactly what is being fetched
  async findActiveUsersByRegion(regionCode: string): Promise<User[]> {
    this.logger.debug(\`[findActiveUsersByRegion] region:\${regionCode}\`);
    // ... implementation
    return [];
  }

  // ✅ GOOD: Boolean-returning methods should sound like a question
  async hasOverduePayments(userId: number): Promise<boolean> {
    this.logger.debug(\`[hasOverduePayments] userId:\${userId}\`);
    // ... implementation
    return false;
  }
}
`,
    'auth-oidc-redis': `
// src/api/auth/interfaces/auth.interface.ts
export interface IAuthService {
  login(user: User): Promise<AuthTokens>;
  refresh(refreshToken: string): Promise<AuthTokens>;
  logout(userId: number): Promise<void>;
  validateOidcUser(profile: OidcProfile): Promise<User>;
}

export const AUTH_SERVICE_TOKEN = Symbol('AUTH_SERVICE_TOKEN');

// src/api/auth/auth.service.ts
@Injectable()
export class AuthService implements IAuthService {
  private readonly logger = new Logger(AuthService.name);

  constructor(
    private readonly jwtService: JwtService,
    @Inject(CACHE_SERVICE_TOKEN) private readonly cache: ICacheService,
    @Inject(USER_SERVICE_TOKEN) private readonly userService: IUserService,
  ) {}

  async login(user: User): Promise<AuthTokens> {
    const tokens = await this.generateTokens(user);
    await this.cache.set(\`refresh_token:\${user.id}\`, tokens.refreshToken, env.JWT_REFRESH_TTL);
    return tokens;
  }

  async refresh(token: string): Promise<AuthTokens> {
    const payload = this.jwtService.verify(token, { secret: env.JWT_REFRESH_SECRET });
    const savedToken = await this.cache.get(\`refresh_token:\${payload.sub}\`);
    
    if (savedToken !== token) {
      throw new UnauthorizedException('Token revoked or invalid');
    }

    const user = await this.userService.findById(payload.sub);
    return this.login(user);
  }

  async logout(userId: number): Promise<void> {
    await this.cache.del(\`refresh_token:\${userId}\`);
  }

  async validateOidcUser(profile: OidcProfile): Promise<User> {
    return this.userService.upsertOidcUser(profile);
  }

  private async generateTokens(user: User): Promise<AuthTokens> {
    const [accessToken, refreshToken] = await Promise.all([
      this.jwtService.signAsync({ sub: user.id, email: user.email }, { 
        secret: env.JWT_ACCESS_SECRET, 
        expiresIn: env.JWT_ACCESS_EXPIRY 
      }),
      this.jwtService.signAsync({ sub: user.id }, { 
        secret: env.JWT_REFRESH_SECRET, 
        expiresIn: env.JWT_REFRESH_EXPIRY 
      }),
    ]);
    return { accessToken, refreshToken };
  }
}

// src/api/auth/strategies/google.strategy.ts
@Injectable()
export class GoogleStrategy extends PassportStrategy(Strategy, 'google') {
  constructor(@Inject(AUTH_SERVICE_TOKEN) private readonly authService: IAuthService) {
    super({
      clientID: env.GOOGLE_CLIENT_ID,
      clientSecret: env.GOOGLE_CLIENT_SECRET,
      callbackURL: env.GOOGLE_CALLBACK_URL,
      scope: ['email', 'profile'],
    });
  }

  async validate(_accessToken: string, _refreshToken: string, profile: any): Promise<any> {
    return this.authService.validateOidcUser(profile);
  }
}

// src/api/auth/auth.controller.ts
@ApiTags('auth')
@Controller('auth')
export class AuthController {
  constructor(@Inject(AUTH_SERVICE_TOKEN) private readonly authService: IAuthService) {}

  @Get('google')
  @UseGuards(AuthGuard('google'))
  async googleAuth() {}

  @Get('google/callback')
  @UseGuards(AuthGuard('google'))
  @ApiOperation({ summary: 'Google OIDC Callback' })
  async googleAuthRedirect(@Req() req: Request) {
    return this.authService.login(req.user as User);
  }

  @Post('refresh')
  @ApiOperation({ summary: 'Refresh Access Token' })
  async refresh(@Body() dto: RefreshTokenDto) {
    return this.authService.refresh(dto.refreshToken);
  }

  @Post('logout')
  @ApiBearerAuth()
  @UseGuards(JwtGuard)
  async logout(@Req() req: Request) {
    return this.authService.logout(req.user.id);
  }
}
`,
};
//# sourceMappingURL=boilerplates.js.map