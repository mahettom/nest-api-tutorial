import { PrismaService } from 'src/prisma/prisma.service';
import { ForbiddenException, Injectable } from '@nestjs/common';
import { AuthDto } from './dto';
import * as argon from 'argon2';
import { PrismaClientKnownRequestError } from '@prisma/client/runtime/library';

@Injectable()
export class AuthService {
  constructor(private prisma: PrismaService) {}
  // —————————————————————————————————————————————— CALLED WHEN USER MAKE A REQUEST BY THE CONTROLLER (auth.controller.ts l-10)
  async signup(dto: AuthDto) {
    // ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~ generate password
    const hash = await argon.hash(dto.password);
    // ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~ save user in db
    try {
      const user = await this.prisma.user.create({
        data: {
          email: dto.email,
          hash,
        },
      });
      // ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~ return user saved without hash
      delete user.hash;
      return user;
      // ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~ prisma doc for list of error code
      // ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~ this one -> try to assign an email twice but email was plan to be unique
    } catch (error) {
      if (error instanceof PrismaClientKnownRequestError) {
        if (error.code === 'P2002') {
          throw new ForbiddenException(
            'This email adress seem to already exist',
          );
        }
      }
    }
  }

  // —————————————————————————————————————————————— CALLED WHEN USER MAKE A REQUEST BY THE CONTROLLER (auth.controller.ts l-18)
  signin() {
    return { msg: 'Im signin' };
  }
}
