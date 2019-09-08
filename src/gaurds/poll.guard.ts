import { Injectable, CanActivate, ExecutionContext, Request, HttpException, HttpStatus } from '@nestjs/common';
import { Observable } from 'rxjs';
import { JwtService } from '@nestjs/jwt';
import * as Joi from '@hapi/joi';

const proxySchema = Joi.object().keys({
  proxy_url: Joi.string().required().uri(),
  wait_for_response: Joi.bool().optional(),
}).unknown(true);

@Injectable()
export class PollGuard implements CanActivate {
  constructor(private readonly jwtService: JwtService) {
  }

  canActivate(
    context: ExecutionContext,
  ): boolean | Promise<boolean> | Observable<boolean> {
    const request = context.switchToHttp().getRequest();
    return this.validateRequest(request);
  }

  validateRequest(req: Request) {
    const token = req.headers['imi_bot_middleware_token'];
    try {
      return this.jwtService.verify(token);
    } catch (e) {
      if (e.name === 'TokenExpiredError') {
        throw new HttpException(`Token has been expired at ${e.expiredAt}. Token: ${token}`, HttpStatus.UNAUTHORIZED);
      }
      if (e.name === 'JsonWebTokenError') {
        throw new HttpException(`Bad token. Token: ${token}`, HttpStatus.UNAUTHORIZED);
      }
      throw new HttpException(`Some problem with token. Token: ${token}`, HttpStatus.UNAUTHORIZED);
    }
  }

}
