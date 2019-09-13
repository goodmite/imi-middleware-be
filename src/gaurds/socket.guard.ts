import { Injectable, CanActivate, ExecutionContext, Request, HttpException, HttpStatus, BadRequestException } from '@nestjs/common';
import { Observable } from 'rxjs';
import { JwtService } from '@nestjs/jwt';
import { ChatGateway } from '../chat/chat.gateway';
import * as Joi from '@hapi/joi';

const querySchema = Joi.object().keys({
  namespace: Joi.string().required(),
}).unknown(true);

const bodySchema = Joi.object().keys({
  consumer: querySchema,
  event: Joi.string().required(),
  payload: Joi.any().optional(),
});

@Injectable()
export class SocketGuard implements CanActivate {
  constructor(private readonly jwtService: JwtService) {
  }

  canActivate(
    context: ExecutionContext,
  ): boolean | Promise<boolean> | Observable<boolean> {
    const request = context.switchToHttp().getRequest();
    return this.validateRequest(request);
  }

  validateRequest(req: Request) {
    const { error } = Joi.validate(req.body, bodySchema);
    if (error) {
      throw new BadRequestException({ name: error.name, error_details: error.details, error: true, message: error.details[0].message });
    }
    return true;
  }

}
