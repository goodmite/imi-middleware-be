import { HttpModule, Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ClientService } from './client/client.service';
import { SocketModule } from './socket/socket.module';
import { EventService } from './client/event.service';
import { ChatGateway } from './chat/chat.gateway';
import { SocketController } from './socket.controller';

@Module({
  imports: [HttpModule, SocketModule],
  controllers: [AppController, SocketController],
  providers: [AppService, ClientService, EventService, ChatGateway],
})
export class AppModule {}
