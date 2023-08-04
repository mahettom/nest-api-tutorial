import { Body, Controller, Get, Patch, UseGuards } from '@nestjs/common';
import { UserService } from './user.service';
import { GetUser } from '../auth/decorator';
import { JwtGuard } from '../auth/guard';
import { User } from '@prisma/client';
import { EditUserDto } from './dto';

// ———————————————————————————————————————————————————— Only access under if token valid
@UseGuards(JwtGuard)
// —————————————————————————————————————————————————————— Controller -> prefix by /user/...
@Controller('users')
export class UserController {
  constructor(private userService: UserService) {}
  // ———————————————————————————————————————————————————— Get -> /user/me
  @Get('me')
  // —————————————————————————————————— request from jwt.strategy the user return from the validate function
  getMe(@GetUser() user: User) {
    return user;
  }

  @Patch()
  editUser(@GetUser('id') userId: number, @Body() dto: EditUserDto) {
    return this.userService.editUser(userId, dto);
  }
}
