import { All, Body, Controller, Get, Query, Req, Request, Headers, HttpException, HttpStatus, Post, UseGuards } from '@nestjs/common';
import { AppService } from './app.service';
import { ClientService } from './client/client.service';
import { tap } from 'rxjs/operators';
import { operators } from 'rxjs/internal/Rx';
import { EventService } from './client/event.service';
import { ChatGateway } from './chat/chat.gateway';
import { AuthGuard } from './auth.guard';

@Controller('api/v1/')
@UseGuards(AuthGuard)
export class AppController {
  constructor(private readonly appService: AppService,
              private eventService: EventService,
              private chatGateway: ChatGateway,
              private clientService: ClientService) {
  }

  @Get('healthy')
  getHello(): string {
    return this.appService.getHello();
  }

  @Post('sendMessage')
  sendMessage(@Req() request: Request, @Body() body, @Query() query, @Headers() headers): { rooms: object[] } {
    if (!body.namespace) {
      throw new HttpException('Namespace not provided. If you dont have any, use TEMP', HttpStatus.UNPROCESSABLE_ENTITY);
    }
    const selectedRoomsData = this.chatGateway.queryRooms(body);
    this.chatGateway.sendMessageToRooms(selectedRoomsData.selectedRoomNames);
    return {
      rooms: selectedRoomsData.selectedRooms,
    };
  }

  @Post('queryRooms')
  queryRooms(@Req() request: Request, @Body() body, @Query() query, @Headers() headers): { rooms: object[] } {
    if (!body.namespace) {
      throw new HttpException('Namespace not provided. If you dont have any, use TEMP', HttpStatus.UNPROCESSABLE_ENTITY);
    }
    const selectedRoomsData = this.chatGateway.queryRooms(body);
    return {
      rooms: selectedRoomsData.selectedRooms,
    };
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
    const maxPollCount = body.maxPollCount || query.maxPollCount || 5;
    const pollSuccessCondition = body.pollSuccessCondition || query.pollSuccessCondition;
    if (!pollSuccessCondition) {
      throw new HttpException('Please provide pollSuccessCondition in body or url query', HttpStatus.UNPROCESSABLE_ENTITY);
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
