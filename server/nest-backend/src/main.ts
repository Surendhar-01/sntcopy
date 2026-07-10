import * as path from 'path';
import * as fs from 'fs';
import * as dotenv from 'dotenv';

const envCandidates = [
  path.resolve(process.cwd(), 'server', '.env.development'),
  path.resolve(process.cwd(), '.env.development'),
  path.resolve(__dirname, '..', '..', '.env.development'),
];
const envPath =
  envCandidates.find((candidate) => fs.existsSync(candidate)) ||
  envCandidates[0];
dotenv.config({ path: envPath });

import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.enableCors();
  app.setGlobalPrefix('api');

  // Swagger setup
  const config = new DocumentBuilder()
    .setTitle('API Documentation')
    .setDescription('The API description')
    .setVersion('1.0')
    .build();
  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('docs', app, document);

  const port = process.env.PORT || 5001;
  await app.listen(port);
  console.log(`NestJS server running on port ${port}`);
}
bootstrap().catch(console.error);
