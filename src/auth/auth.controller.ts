import { Controller, Post } from '@nestjs/common';
import { AuthService } from './auth.service';

// —————————————————————————————————————————————————————— Controller -> /auth/...
@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}
  // ———————————————————————————————————————————————————— Post -> /auth/signup
  @Post('signup')
  signup() {
    return "I'm signup";
  }
  // ———————————————————————————————————————————————————— Post -> /auth/signin
  @Post('signin')
  signin() {
    return "I'm signin";
  }
}
