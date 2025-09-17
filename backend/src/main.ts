import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { SqsService } from './sqs/sqs.service';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const frontendOrigin = process.env.FRONTEND_ORIGIN;
  app.enableCors({
    origin: [frontendOrigin, 'http://localhost:5173'],
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS',
    credentials: true,
  });

  const sqsService = app.get(SqsService);
  sqsService.startPolling();

  await app.listen(process.env.PORT ?? 3000);
}
bootstrap();
