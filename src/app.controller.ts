import { All, Body, Controller, Get, Query, Req, Request, Headers } from '@nestjs/common';
import { AppService } from './app.service';
import { ClientService } from './client/client.service';
import { tap } from 'rxjs/operators';
import { operators } from 'rxjs/internal/Rx';

@Controller('api/v1/')
export class AppController {
  constructor(private readonly appService: AppService, private clientService: ClientService) {
  }

  @Get('healthy')
  getHello(): string {
    return this.appService.getHello();
  }

  @All('proxy')
  async proxy(@Req() request: Request, @Body() body, @Query() query, @Headers() headers): Promise<any> {
    return new Promise((resolve, reject) => {
      this.clientService.makeReq(request, headers, body, query)
        .pipe(tap((data) => {
          resolve(data);
        }))
        .subscribe();
    });
  }

  @All('poll')
  async poll(@Req() request: Request, @Body() body, @Query() query, @Headers() headers): Promise<any> {
    const pollCondition = 'body[0].random % 10 === 0';
    const pollCount = body.pollCount || query.pollCount || 5;

    const pollSuccessCb = (body2: any): boolean => {
      const body = body2;
      // tslint:disable-next-line:no-eval
      return !eval(pollCondition) as boolean;
      // return false;//!eval(pollCondition) as boolean;
    };
    //
    return new Promise((resolve, reject) => {
      this.clientService.poll(request, headers, body, query, { pollSuccessCb, pollCount, pollDelay: 5000 })
        .subscribe((data) => {
            console.log(data);
            resolve(data);
          }, (x) => {
            console.log(x);
          },
          () => {
            console.log();
          });
    });
  }
}
