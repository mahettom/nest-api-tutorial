import { Controller, Get, UseGuards } from '@nestjs/common';
import { JwtGuard } from '../auth/guard';
import { GetUser } from '../auth/decorator';
import { User } from '@prisma/client';

// ———————————————————————————————————————————————————— Only access under if token valid
@UseGuards(JwtGuard)
// —————————————————————————————————————————————————————— Controller -> prefix by /user/...
@Controller('user')
export class UserController {
  // ———————————————————————————————————————————————————— Get -> /user/me
  @Get('me')
  // —————————————————————————————————— request from jwt.strategy the user return from the validate function
  getMe(@GetUser() user: User) {
    return user;
  }

  // @Patch()
  // editUser() {}
}
