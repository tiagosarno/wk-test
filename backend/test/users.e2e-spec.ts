import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import * as request from 'supertest';
import { ConfigModule } from '@nestjs/config';
import { PrismaModule } from 'src/prisma/prisma.module';
import { TasksModule } from 'src/tasks/tasks.module';
import { UsersModule } from 'src/users/users.module';
import { AuthModule } from 'src/auth/auth.module';
import { ServeStaticModule } from '@nestjs/serve-static';
import { join } from 'node:path';
import { PrismaService } from 'src/prisma/prisma.service';
import * as dotenv from 'dotenv';
import { execSync } from 'node:child_process';

dotenv.config({ path: '.env.test' });

describe('Users (e2e)', () => {
  let app: INestApplication;
  let prismaService: PrismaService;

  beforeAll(() => {
    execSync('npx prisma migrate deploy');
  });

  beforeEach(async () => {
    execSync(
      'cross-env DATABASE_URL=mysql://root:123456@localhost:3305/wk-tests-e2e npx prisma migrate deploy',
    );

    const module: TestingModule = await Test.createTestingModule({
      imports: [
        ConfigModule.forRoot({
          isGlobal: true,
          envFilePath: '.env.test',
        }),
        PrismaModule,
        TasksModule,
        UsersModule,
        AuthModule,
        ServeStaticModule.forRoot({
          rootPath: join(process.cwd(), 'files'),
          serveRoot: '/files',
        }),
      ],
    }).compile();

    app = module.createNestApplication();
    app.useGlobalPipes(
      new ValidationPipe({
        whitelist: true,
      }),
    );
    prismaService = module.get<PrismaService>(PrismaService);
    await app.init();
  });

  afterEach(async () => {
    await prismaService.user.deleteMany();
  });

  afterEach(async () => {
    await app.close();
  });

  describe('e2e /users', () => {
    it('/users (POST) - create', async () => {
      const createUserDto = {
        name: 'Tiago Rocha Sarno',
        email: 'tiago@gmail.com',
        passwordHash: '@8cd6gW3',
      };
      const response = await request(app.getHttpServer())
        .post('/users')
        .send(createUserDto)
        .expect(201);

      expect(response.body).toEqual({
        id: response.body.id,
        name: 'Tiago Rocha Sarno',
        email: 'tiago@gmail.com',
      });
    });
    it('/users (POST) - with a weak password', async () => {
      const createUserDto = {
        name: 'Teste',
        email: 'teste@gmail.com',
        passwordHash: '123',
      };
      await request(app.getHttpServer())
        .post('/users')
        .send(createUserDto)
        .expect(400);
    });
    it('/users (PATCH) - update user without token', async () => {
      const createUserDto = {
        name: 'Ana Teste',
        email: 'ana-teste@gmail.com',
        passwordHash: '@8cd6gW3',
      };
      const updateUserDto = {
        name: 'Ana Caroline',
        email: 'ana-carol@gmail.com',
      };
      const user = await request(app.getHttpServer())
        .post('/users')
        .send(createUserDto)
        .expect(201);

      const auth = await request(app.getHttpServer()).post('/auth').send({
        email: createUserDto.email,
        password: createUserDto.passwordHash,
      });

      expect(auth.body.token).not.toBeNull();

      await request(app.getHttpServer())
        .patch(`/users/${auth.body.id}`)
        .send(updateUserDto)
        .expect(401);
    });
    it('/users (PATCH) - update user with token', async () => {
      const createUserDto = {
        name: 'Ana Teste',
        email: 'ana-teste@gmail.com',
        passwordHash: '@8cd6gW3',
      };
      const updateUserDto = {
        name: 'Ana Caroline',
      };
      await request(app.getHttpServer())
        .post('/users')
        .send(createUserDto)
        .expect(201);

      const auth = await request(app.getHttpServer()).post('/auth').send({
        email: createUserDto.email,
        password: createUserDto.passwordHash,
      });

      expect(auth.body.token).toEqual(auth.body.token);

      const response = await request(app.getHttpServer())
        .patch(`/users/${auth.body.id}`)
        .set('Authorization', `Bearer ${auth.body.token}`)
        .send(updateUserDto)
        .expect(200);

      expect(response.body).toEqual({
        id: auth.body.id,
        name: updateUserDto.name,
        email: createUserDto.email,
      });
    });
    it('/user (DELETE) - delete user', async () => {
      const createUserDto = {
        name: 'Ana Teste',
        email: 'ana-teste@gmail.com',
        passwordHash: '@8cd6gW3',
      };

      await request(app.getHttpServer())
        .post('/users')
        .send(createUserDto)
        .expect(201);

      const auth = await request(app.getHttpServer()).post('/auth').send({
        email: createUserDto.email,
        password: createUserDto.passwordHash,
      });

      expect(auth.body.token).toEqual(auth.body.token);

      const response = await request(app.getHttpServer())
        .delete(`/users/${auth.body.id}`)
        .set('Authorization', `Bearer ${auth.body.token}`)
        .expect(200);

      expect(response.body).toEqual({
        message: true,
      });
    });
  });
});
