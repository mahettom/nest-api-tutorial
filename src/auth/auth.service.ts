import { PrismaService } from 'src/prisma/prisma.service';
import { Injectable } from '@nestjs/common';
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
    const user = await this.prisma.user.create({
      data: {
        email: dto.email,
        hash,
      },
    });
    // ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~ return user saved without hash
    delete user.hash;
    return user;
  }

  // —————————————————————————————————————————————— CALLED WHEN USER MAKE A REQUEST BY THE CONTROLLER (auth.controller.ts l-18)
  signin() {
    return { msg: 'Im signin' };
  }
}
