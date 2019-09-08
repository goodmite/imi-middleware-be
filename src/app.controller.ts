import { All, Body, Controller, Get, Query, Req, Request, Headers, HttpException, HttpStatus, Post, UseGuards, UsePipes } from '@nestjs/common';
import { AppService } from './app.service';
import { ClientService } from './client/client.service';
import { catchError, tap } from 'rxjs/operators';
import { EventService } from './client/event.service';
import { ChatGateway } from './chat/chat.gateway';
import { AuthGuard } from './auth.guard';
import { of } from 'rxjs';
import { JwtService } from '@nestjs/jwt';
import { JoiValidationPipe } from './proxy.pipe';
import { CreateCatDto } from './create-cat.dto';
import * as Joi from '@hapi/joi';
import { ProxyGuard } from './gaurds/proxy.guard';

const personDataSchema = Joi.object().keys({
  pollSuccessCondition: Joi.string(),
  maxPollCount: Joi.number(),
  pollDuration: Joi.number().optional(),
});

@Controller('api/v1/')
@UseGuards(AuthGuard)
export class AppController {
  constructor(private readonly appService: AppService,
              private eventService: EventService,
              private chatGateway: ChatGateway,
              private jwtService: JwtService,
              private clientService: ClientService) {
  }

  @Get('healthy')
  getHello(): string {
    return this.appService.getHello();
  }

  @Post('healthy')
  getHelloPost(@Req() request: Request, @Body() body, @Query() query, @Headers() headers): string {
    return this.appService.getHello();
  }

  // @Post('sendMessage')
  // sendMessage(@Req() request: Request, @Body() body, @Query() query, @Headers() headers): { rooms: object[] } {
  //   if (!body.namespace) {
  //     throw new HttpException('Namespace not provided. If you dont have any, use TEMP', HttpStatus.UNPROCESSABLE_ENTITY);
  //   }
  //   const selectedRoomsData = this.chatGateway.queryRooms(body);
  //   this.chatGateway.sendMessageToRooms(selectedRoomsData.selectedRoomNames);
  //   return {
  //     rooms: selectedRoomsData.selectedRooms,
  //   };
  // }
  //
  // @Post('queryRooms')
  // queryRooms(@Req() request: Request, @Body() body, @Query() query, @Headers() headers): { rooms: object[] } {
  //   if (!body.namespace) {
  //     throw new HttpException('Namespace not provided. If you dont have any, use TEMP', HttpStatus.UNPROCESSABLE_ENTITY);
  //   }
  //   const selectedRoomsData = this.chatGateway.queryRooms(body);
  //   return {
  //     rooms: selectedRoomsData.selectedRooms,
  //   };
  // }

  @All('proxy')
  @UseGuards(ProxyGuard)
  async proxy(@Req() request: Request, @Body() body, @Query() query, @Headers() headers): Promise<any> {
    return new Promise((resolve, reject) => {
      if (headers.wait_for_response === 'false') {
        this.clientService.makeReq(request, headers, body, query)
          .subscribe();
        resolve({ ack: true });
        return;
      }
      this.clientService.makeReq(request, headers, body, query)
        .pipe(tap((data) => {
            resolve(data);
          }),
          catchError((err) => {
            reject(new HttpException(err, HttpStatus.UNPROCESSABLE_ENTITY));
            return of();
          }))
        .subscribe();
    });
  }

  @All('poll')
  @UsePipes(new JoiValidationPipe(personDataSchema))
  async poll(@Req() request: Request, @Body() body, @Query() query, @Headers() headers): Promise<any> {
    const maxPollCount = headers.maxPollCount || 5;
    const proxy_url = headers.proxy_url;
    const pollSuccessCondition = headers.pollSuccessCondition;
    if (!pollSuccessCondition) {
      throw new HttpException('Please provide pollSuccessCondition in headers', HttpStatus.UNPROCESSABLE_ENTITY);
    }
    if (proxy_url) {
      throw new HttpException('Please provide proxy_url in headers', HttpStatus.UNPROCESSABLE_ENTITY);
    }
    return new Promise((resolve, reject) => {
      this.clientService.poll(request, headers, body, query, { pollSuccessCondition, maxPollCount, pollDelay: 5000 })
        .subscribe((data) => {
            console.log(data);
            resolve({ ...data, __status: 'success', error: false });
          }, (error) => {
            const errorMessage = error.errorMessage || JSON.stringify(error);
            const errObj = { __status: 'failed', error: true, errorMessage };
            reject(new HttpException(errObj, HttpStatus.UNPROCESSABLE_ENTITY));
          },
          () => {
            resolve({
              __status: 'failed',
              error: false,
              message: `Tried ${maxPollCount} time but could not fulfill the condition`,
              pollSuccessCondition,
            });
          });
    });
  }

}
