import { Injectable, CanActivate, ExecutionContext, Request, HttpException, HttpStatus, BadRequestException } from '@nestjs/common';
import { Observable } from 'rxjs';
import { JwtService } from '@nestjs/jwt';
import * as Joi from '@hapi/joi';

const proxySchema = Joi.object().keys({
  proxy_url: Joi.string().required().uri(),
  wait_for_response: Joi.bool().optional(),
}).unknown(true);

@Injectable()
export class ProxyGuard implements CanActivate {
  constructor(private readonly jwtService: JwtService) {
  }

  canActivate(
    context: ExecutionContext,
  ): boolean | Promise<boolean> | Observable<boolean> {
    const request = context.switchToHttp().getRequest();
    return this.validateRequest(request);
  }

  validateRequest(req: Request) {
    const headers: any = req.headers;
    const { error } = Joi.validate(headers, proxySchema);
    if (error) {
      throw new BadRequestException({ name: error.name, error_details: error.details, error: true, message: error.details[0].message });
    }
    return true;
  }
}
