import { NestFactory } from '@nestjs/core';
import { ConfigService } from '@nestjs/config';
import { HttpStatus, ValidationError, ValidationPipe } from '@nestjs/common';
import { ErrorCode } from '@smallweb/shared';
import { AppModule } from './app.module';
import { AppError, ErrorDetail } from './common/errors/app-error';
import { AllExceptionsFilter } from './common/errors/all-exceptions.filter';

async function bootstrap(): Promise<void> {
  const app = await NestFactory.create(AppModule);
  const config = app.get(ConfigService);

  // Every route sits under /api, so the health check is GET /api/health.
  app.setGlobalPrefix('api');

  const webOrigin = config.get<string>('WEB_ORIGIN') ?? 'http://localhost:3000';
  app.enableCors({ origin: webOrigin });

  // Checks every request body and query against its DTO class before the controller runs.
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true, // strip fields the DTO doesn't declare...
      forbidNonWhitelisted: true, // ...and reject the request if it sent any
      transform: true, // turn query strings into numbers etc.
      exceptionFactory: (errors) =>
        new AppError(
          ErrorCode.VALIDATION_FAILED,
          HttpStatus.BAD_REQUEST,
          'Request validation failed',
          toDetails(errors),
        ),
    }),
  );

  // Turns every thrown error into the one error response shape.
  app.useGlobalFilters(new AllExceptionsFilter());

  const portValue = config.get<string>('PORT') ?? '4000';
  const port = Number(portValue);
  await app.listen(port);
}

// One { field, message } per failed rule, e.g. { field: 'address', message: 'address must look like name.zz' }.
function toDetails(errors: ValidationError[]): ErrorDetail[] {
  return errors.flatMap((error) =>
    Object.values(error.constraints ?? {}).map((message) => ({ field: error.property, message })),
  );
}

void bootstrap();
