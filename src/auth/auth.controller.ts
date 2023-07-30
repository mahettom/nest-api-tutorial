import { Body, Controller, ParseIntPipe, Post } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthDto } from './dto';

// —————————————————————————————————————————————————————— Controller -> /auth/...
@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  // ———————————————————————————————————————————————————— Post -> /auth/signup
  @Post('signup')
  signup(@Body() dto: AuthDto) {
    return this.authService.signup(dto);
  }

  // ———————————————————————————————————————————————————— Post -> /auth/signin
  @Post('signin')
  signin(@Body() dto: AuthDto) {
    return this.authService.signin(dto);
  }
}
