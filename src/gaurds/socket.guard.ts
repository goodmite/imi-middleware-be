import { Injectable, CanActivate, ExecutionContext, Request, HttpException, HttpStatus, BadRequestException } from '@nestjs/common';
import { Observable } from 'rxjs';
import { JwtService } from '@nestjs/jwt';
import { ChatGateway } from '../chat/chat.gateway';
import * as Joi from '@hapi/joi';
import { allowedNameSpace, namespaceEventMap } from '../socket-event-map';

const querySchema = Joi.object().keys({
  namespace: Joi.string().valid(...allowedNameSpace).alphanum().required(),
}).unknown(true);

const bodySchema = Joi.object().keys({
  consumer: querySchema,
  event: Joi.string().valid(...namespaceEventMap.BOT.events).required(), /* todo: use a dynamic approach*/
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
    let message = error && error.details[0].message;
    if (error) {
      if ((req.body as any).query) {
        message = 'Usage of query is not allowed anymore. Pls use consumer instead.';
        throw new BadRequestException({ error: true, message });
      }
      throw new BadRequestException({ name: error.name, error_details: error.details, error: true, message });
    }
    return true;
  }

}
