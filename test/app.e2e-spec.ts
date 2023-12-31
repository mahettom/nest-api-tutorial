import { CreateBookmarkDto, EditBookmarkDto } from 'src/bookmark/dto';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import { PrismaService } from '../src/prisma/prisma.service';
import { EditUserDto } from '../src/user/dto';
import { AppModule } from '../src/app.module';
import { AuthDto } from '../src/auth/dto';
import { Test } from '@nestjs/testing';
import * as pactum from 'pactum';

describe('App e2e', () => {
  let app: INestApplication;
  let prisma: PrismaService;

  beforeAll(async () => {
    // ———————————————————————————————————————— Create a test module & import AppModule
    // ———————————————————————————————————————— This will give access to all files available by AppModule
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
    await app.listen(3333);

    prisma = app.get(PrismaService);

    await prisma.cleanDb();
    pactum.request.setBaseUrl('http://localhost:3333');
  });

  afterAll(() => {
    app.close();
  });
  // /////////////////////////////////////////////////////////////////////////////
  // ////////////////////////////////     AUTH      //////////////////////////////
  describe('Auth', () => {
    const dto: AuthDto = {
      password: '123',
      email: 'testguy@getMaxListeners.com',
    };
    // ////////////////////////////////////////////////////////// SIGNUP /////////
    describe('Signup', () => {
      // ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~  400  ~~~~~~~~~~~~~~~~~~~~~~~~
      it('should throw if email empty', () => {
        return pactum
          .spec()
          .post('/auth/signup')
          .withBody({
            password: dto.password,
          })
          .expectStatus(400);
      }); // ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~  400  ~~~~~~~~~~~~~~~~~~~~~~~~
      it('should throw if pasword empty', () => {
        return pactum
          .spec()
          .post('/auth/signup')
          .withBody({
            email: dto.email,
          })
          .expectStatus(400);
      }); // ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~  400  ~~~~~~~~~~~~~~~~~~~~~~~~
      it('should throw if any info provided', () => {
        return pactum.spec().post('/auth/signup').expectStatus(400);
      });
      // ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~  201  ~~~~~~~~~~~~~~~~~~~~~~~~
      it('should signup', () => {
        return pactum
          .spec()
          .post('/auth/signup')
          .withBody(dto)
          .expectStatus(201);
      });
    });
    // ////////////////////////////////////////////////////////// SIGNIN /////////
    describe('Signin', () => {
      // ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~  400  ~~~~~~~~~~~~~~~~~~~~~~~~
      it('should throw if email empty', () => {
        return pactum
          .spec()
          .post('/auth/signin')
          .withBody({
            password: dto.password,
          })
          .expectStatus(400);
      }); // ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~  400  ~~~~~~~~~~~~~~~~~~~~~~~~
      it('should throw if pasword empty', () => {
        return pactum
          .spec()
          .post('/auth/signin')
          .withBody({
            email: dto.email,
          })
          .expectStatus(400);
      }); // ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~  400  ~~~~~~~~~~~~~~~~~~~~~~~~
      it('should throw if any info provided', () => {
        return pactum.spec().post('/auth/signin').expectStatus(400);
      });
      // ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~  200  ~~~~~~~~~~~~~~~~~~~~~~~~
      it('should signin', () => {
        return pactum
          .spec()
          .post('/auth/signin')
          .withBody(dto)
          .expectStatus(200)
          .stores('userAt', 'access_token');
      });
    });
  });
  // /////////////////////////////////////////////////////////////////////////////
  // ////////////////////////////////     USER      //////////////////////////////
  describe('User', () => {
    // ////////////////////////////////////////////////////////// GET ////////////
    describe('Get me', () => {
      // ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~  200  ~~~~~~~~~~~~~~~~~~~~~~~~
      it('should get current user', () => {
        return pactum
          .spec()
          .get('/users/me')
          .withHeaders({
            Authorization: 'Bearer $S{userAt}',
          })
          .expectStatus(200);
      });
    });
    // ////////////////////////////////////////////////////////// EDIT ///////////
    describe('Edit user', () => {
      // ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~  200  ~~~~~~~~~~~~~~~~~~~~~~~~
      it('should edit user', () => {
        const dto: EditUserDto = {
          firstName: 'UpdateName',
          lastName: 'Works',
        };
        return pactum
          .spec()
          .patch('/users')
          .withHeaders({
            Authorization: 'Bearer $S{userAt}',
          })
          .withBody(dto)
          .expectStatus(200);
        //.expectBodyContain(dto.email)
      });
    });
  });
  // /////////////////////////////////////////////////////////////////////////////
  // //////////////////////////////     BOOKMARK      ////////////////////////////
  describe('Bookmarks', () => {
    // ////////////////////////////////////////////////////////// GET EMPTY ////////
    describe('Get empty bookmarks', () => {
      it('should get bookmarks', () => {
        return pactum
          .spec()
          .get('/bookmarks')
          .withHeaders({
            Authorization: 'Bearer $S{userAt}',
          })
          .expectStatus(200)
          .expectBody([]);
      });
    });
    // ////////////////////////////////////////////////////////// CREATE /////////
    describe('Create bookmark', () => {
      const dto: CreateBookmarkDto = {
        title: 'First Bookmark',
        link: 'example.com',
      };
      it('should create bookmark', () => {
        return pactum
          .spec()
          .post('/bookmarks')
          .withHeaders({
            Authorization: 'Bearer $S{userAt}',
          })
          .withBody(dto)
          .expectStatus(201)
          .stores('bookmarkId', 'id');
      });
    });
    // ////////////////////////////////////////////////////////// GET ALL /////////
    describe('Get bookmarks', () => {
      it('should get bookmarks', () => {
        return pactum
          .spec()
          .get('/bookmarks')
          .withHeaders({
            Authorization: 'Bearer $S{userAt}',
          })
          .expectStatus(200);
      });
    });
    // ////////////////////////////////////////////////////////// GET ID /////////
    describe('Get bookmark by id', () => {
      it('should get bookmark by id', () => {
        return pactum
          .spec()
          .get('/bookmarks/{id}')
          .withPathParams('id', '$S{bookmarkId}')
          .withHeaders({
            Authorization: 'Bearer $S{userAt}',
          })
          .expectStatus(200)
          .expectBodyContains('$S{bookmarkId}');
      });
    });

    // ////////////////////////////////////////////////////////// EDIT ///////////
    describe('Edit bookmark by id', () => {
      const dto: EditBookmarkDto = {
        description: 'Test description for update by a specific id',
      };
      it('should edit bookmark with id', () => {
        return pactum
          .spec()
          .patch('/bookmarks/{id}')
          .withPathParams('id', '$S{bookmarkId}')
          .withHeaders({
            Authorization: 'Bearer $S{userAt}',
          })
          .withBody(dto)
          .expectStatus(200)
          .expectBodyContains('$S{bookmarkId}');
      });
    });
    // ////////////////////////////////////////////////////////// DELETE /////////
    describe('Delete bookmark by id', () => {
      it('should delete bookmark with id', () => {
        return pactum
          .spec()
          .delete('/bookmarks/{id}')
          .withPathParams('id', '$S{bookmarkId}')
          .withHeaders({
            Authorization: 'Bearer $S{userAt}',
          })
          .expectStatus(204);
      });

      it('should get empty bookmarks', () => {
        return pactum
          .spec()
          .get('/bookmarks')
          .withHeaders({
            Authorization: 'Bearer $S{userAt}',
          })
          .expectStatus(200)
          .expectJsonLength(0);
      });
    });
  });
});
