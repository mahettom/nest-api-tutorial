import { PrismaClientKnownRequestError } from '@prisma/client/runtime/library';
import { ForbiddenException, Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { AuthDto } from './dto';
import * as argon from 'argon2';

@Injectable()
export class AuthService {
  constructor(
    private prisma: PrismaService,
    private jwt: JwtService,
    private config: ConfigService,
  ) {}
  // —————————————————————————————————— SIGNUP ————— CALLED WHEN USER MAKE A REQUEST BY THE CONTROLLER (auth.controller.ts l-10)
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
      // ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~ give token to the user
      return this.signToken(user.id, user.email);
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

  // —————————————————————————————————— SIGNIN ——————— CALLED WHEN USER MAKE A REQUEST BY THE CONTROLLER (auth.controller.ts l-18)
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
        'No account is register with this email, try to signup',
      );
    // ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~ found -> compare password
    const pwMatches = await argon.verify(user.hash, dto.password);
    // ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~ password incorrect -> throw exception
    if (!pwMatches)
      throw new ForbiddenException('password seems to be incorect');
    // ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~ password correct -> send the sign token to the user
    // delete user.hash;
    return this.signToken(user.id, user.email);
  }
  // ———————————————————————————————————————————————————————————————————————— PROVIDE THE TOKEN TO THE USER
  async signToken(userId: number, email): Promise<{ access_token: string }> {
    const payload = {
      sub: userId,
      email,
    };

    const secret = this.config.get('JWT_SECRET');

    const token = await this.jwt.signAsync(payload, {
      expiresIn: '15m',
      secret: secret,
    });

    return {
      access_token: token,
    };
  }
}
