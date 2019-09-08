import { Body, Controller, Headers, HttpException, HttpStatus, Post, Query, Req, Request, UseFilters } from '@nestjs/common';
import { catchError, tap } from 'rxjs/operators';
import { of } from 'rxjs';
import { ClientService } from '../client/client.service';
import { JwtService } from '@nestjs/jwt';
import { AuthService } from './auth.service';
import { url } from 'inspector';
import { HttpExceptionFilter } from '../http-exception.filter';

@Controller('api/v1/auth')
@UseFilters(new HttpExceptionFilter())
export class AuthController {

  constructor(private clientService: ClientService, private jwtService: JwtService) {
  }

  @Post('login')
  async login(@Req() request: Request, @Body() body, @Headers() headers, @Query() query): Promise<any> {
    return new Promise((resolve, reject) => {
      const proxy_url = headers.proxy_url;
      const authProviderUrls = AuthService.AuthProviderUrls;
      if (!proxy_url || !proxy_url.trim || !AuthService.AuthProviderUrls.find(authProviderUrl => authProviderUrl === proxy_url.trim())) {
        throw new HttpException({
          name: 'AuthProviderError',
          message: `Supported auth providers: ${authProviderUrls.join(', ')}`,
        }, HttpStatus.UNPROCESSABLE_ENTITY);
      }
      this.clientService.makeReq(request, headers, body, query)
        .pipe(tap((data) => {
            if (data.auth_token) {
              try {
                const token = this.jwtService.sign({
                  payload: 'This is IMI BOT middleware', namespace: 'BOT',
                }, { expiresIn: AuthService.tokenExpiry });

                resolve({ imi_bot_middleware_token: token });
              } catch (e) {
                console.log(e);
                reject(new HttpException(e, HttpStatus.EXPECTATION_FAILED));
              }
            } else {
              throw new HttpException({ error: true, name: 'AuthProviderResponseError', ...data }, HttpStatus.UNPROCESSABLE_ENTITY);
            }
          }),
          catchError((err) => {
            reject(new HttpException(err, HttpStatus.EXPECTATION_FAILED));
            return of();
          }),
        )
        .subscribe();
    });
  }
}
