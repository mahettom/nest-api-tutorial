import { Controller, Get, Req, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { Request } from 'express';

// —————————————————————————————————————————————————————— Controller -> prefix by /user/...
@Controller('user')
export class UserController {
  // ———————————————————————————————————————————————————— Only access the route under if token valid
  @UseGuards(AuthGuard('jwt'))
  // ———————————————————————————————————————————————————— Get -> /user/me
  @Get('me')
  // —————————————————————————————————— request from jwt.strategy the user return from the validate function
  getMe(@Req() req: Request) {
    return req.user;
  }
}