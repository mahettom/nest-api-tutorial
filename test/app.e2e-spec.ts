import { INestApplication, ValidationPipe } from '@nestjs/common';
import { AppModule } from '../src/app.module';
import { Test } from '@nestjs/testing';

describe('App e2e', () => {
  // ———————————————————————————————————————— Precise app gonna have the type of a nest app
  let app: INestApplication;
  // ———————————————————————————————————————— Create a test module & import AppModule
  // ———————————————————————————————————————— This will give access to all files available by AppModule
  beforeAll(async () => {
    const moduleRef = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();
    // —————————————————————————————————————— Create App from the Test module previously created
    app = moduleRef.createNestApplication();
    // —————————————————————————————————————— Give same tools that our real server
    app.useGlobalPipes(
      new ValidationPipe({
        whitelist: true,
      }),
    );
    await app.init();
  });

  afterAll(() => {
    app.close();
  });
  it.todo('should pass');
});
