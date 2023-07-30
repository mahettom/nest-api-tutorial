import { ForbiddenException, Injectable } from '@nestjs/common';
import { PrismaClientKnownRequestError } from '@prisma/client/runtime/library';
import { PrismaService } from 'src/prisma/prisma.service';
import { AuthDto } from './dto';
import * as argon from 'argon2';

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
  async signin(dto: AuthDto) {
    // ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~ find user by id
    const user = await this.prisma.user.findUnique({
      where: {
        email: dto.email,
      },
    });
    // ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~ not found -> alert user
    if (!user)
      throw new ForbiddenException(
        'No account iss register with this email, try to signin',
      );
    // ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~ found -> compare password
    const pwMatches = await argon.verify(user.hash, dto.password);
    // ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~ password incorrect -> throw exception
    if (!pwMatches)
      throw new ForbiddenException('password seems to be incorect');
    // ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~ password correct -> send back user
    delete user.hash;
    return { msg: 'Im signin' };
  }
}
