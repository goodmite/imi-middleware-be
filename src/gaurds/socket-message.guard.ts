import { CanActivate, ExecutionContext, HttpException, HttpStatus, Injectable } from '@nestjs/common';
import * as jwt from 'jsonwebtoken';
import { JwtService } from '@nestjs/jwt';

@Injectable()
export class WsJwtGuard implements CanActivate {
  constructor(private jwtService: JwtService) {
  }

  async canActivate(context: ExecutionContext) {
    const client = context.switchToWs().getClient();
    const cookies: string[] = client.handshake.headers.cookie.split('; ');
    const token_cookie = cookies.find(cookie => cookie.startsWith('imi_bot_middleware_token'));
    let token;
    if (token_cookie) {
      token = token_cookie.split('=')[1];
    }
    try {
      return this.jwtService.verify(token);
    } catch (e) {
      if (e.name === 'TokenExpiredError') {
        throw new HttpException(`Token has been expired at ${e.expiredAt}. Token: ${token}`, HttpStatus.UNAUTHORIZED);
      }
      if (e.name === 'JsonWebTokenError') {
        if (!token) {
            throw new HttpException(`Please provide token in headers with name imi_bot_middleware_token`, HttpStatus.UNAUTHORIZED);
        } else {
          throw new HttpException(`Bad token. Token: ${token}`, HttpStatus.UNAUTHORIZED);
        }
      }
      throw new HttpException(`Some problem with token. Token: ${token}`, HttpStatus.UNAUTHORIZED);
    }
  }
}
