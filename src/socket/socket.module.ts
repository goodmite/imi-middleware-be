import { Module } from '@nestjs/common';
import { ChatGateway } from '../chat/chat.gateway';
import { EventService } from '../client/event.service';

@Module({
  providers: [],
})
export class SocketModule {
}
