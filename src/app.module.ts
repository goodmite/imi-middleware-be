import { HttpModule, Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ClientService } from './client/client.service';
import { SocketModule } from './socket/socket.module';
import { EventService } from './client/event.service';
import { ChatGateway } from './chat/chat.gateway';
import { SocketController } from './socket.controller';
import { JwtModule } from '@nestjs/jwt';
import { AuthService } from './auth/auth.service';
import { AuthController } from './auth/auth.controller';
import { HttpExceptionFilter } from './http-exception.filter';
import { ImiServiceController } from './imi-service/imi-service.controller';

@Module({
  imports: [HttpModule, JwtModule.register({ secret: 'hard!to-guess_secret' }), SocketModule],
  controllers: [AppController, SocketController, AuthController, ImiServiceController],
  providers: [AppService, ClientService, EventService, ChatGateway, AuthService],
})
export class AppModule {
}
