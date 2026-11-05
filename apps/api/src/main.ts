import { NestFactory } from '@nestjs/core';
import { ConfigService } from '@nestjs/config';
import { AppModule } from './app.module';

async function bootstrap(): Promise<void> {
  const app = await NestFactory.create(AppModule);
  const config = app.get(ConfigService);

  // Every route sits under /api, so the health check is GET /api/health.
  app.setGlobalPrefix('api');

  const webOrigin = config.get<string>('WEB_ORIGIN') ?? 'http://localhost:3000';
  app.enableCors({ origin: webOrigin });

  const portValue = config.get<string>('PORT') ?? '4000';
  const port = Number(portValue);
  await app.listen(port);
}

void bootstrap();
