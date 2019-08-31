import { HttpModule, Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ClientService } from './client/client.service';

@Module({
  imports: [HttpModule],
  controllers: [AppController],
  providers: [AppService, ClientService],
})
export class AppModule {}
