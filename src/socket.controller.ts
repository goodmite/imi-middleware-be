import { All, Body, Controller, Get, Query, Req, Request, Headers, HttpException, HttpStatus, Post } from '@nestjs/common';
import { AppService } from './app.service';
import { ClientService } from './client/client.service';
import { tap } from 'rxjs/operators';
import { operators } from 'rxjs/internal/Rx';
import { EventService } from './client/event.service';
import { ChatGateway } from './chat/chat.gateway';

@Controller('api/v1/socket')
export class SocketController {
  constructor(private readonly appService: AppService,
              private eventService: EventService,
              private chatGateway: ChatGateway) {
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
}
