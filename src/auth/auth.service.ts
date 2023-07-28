import { Injectable } from '@nestjs/common';

@Injectable({})
export class AuthService {
  // —————————————————————————————————————————————— Called when user make a request by the controller (auth.controller.ts l-10)
  signup() {
    return { msg: 'Hello, I just signup' };
  }

  // —————————————————————————————————————————————— Called when user make a request by the controller (auth.controller.ts l-18)
  signin() {
    return { msg: 'Im signin' };
  }
}
