import { OnGatewayConnection, OnGatewayDisconnect, SubscribeMessage, WebSocketGateway, WebSocketServer } from '@nestjs/websockets';
import { EventService } from '../client/event.service';
import { Server, Socket } from 'socket.io';
import { HelperService } from './helper.service';

@WebSocketGateway()
export class ChatGateway implements OnGatewayConnection, OnGatewayDisconnect {

  constructor(private eventService: EventService) {
    try {
      EventService.data.subscribe();
    } catch (e) {
      console.log(e);
    }
  }

  queryRooms(roomQueryObj: object) {
    if (this.server) {

      const roomsMap = this.server.sockets.adapter.rooms;
      // const roomName = HelperService.querify(data);
      const selectedRoomNames: string[] = [];
      const selectedRooms: object[] = [];
      Object.keys(roomsMap).forEach((roomName) => {
        try {
          const roomData = HelperService.Objectify(roomName);
          const isRoomMatch: boolean = Object.keys(roomQueryObj).every((keyTemp) => {
            console.log(keyTemp);
            return roomQueryObj[keyTemp] === roomData[keyTemp];
          });
          if (isRoomMatch) {
            selectedRoomNames.push(roomName);
            selectedRooms.push(roomData);
            // this.server.to(key).emit('chat', 'this is test');
          }
        } catch (e) {
          console.log(e);
        }
      });
      return { selectedRooms, selectedRoomNames };
    }
  }

  sendMessageToRooms(roomNames: string[]) {
    roomNames.forEach((roomName) => {
      this.server.to(roomName).emit('chat', 'this is test');
    });
  }

  @WebSocketServer() server: Server;
  users: number = 0;

  async handleConnection(socket: Socket) {

    const connectionConfig = JSON.parse(socket.handshake.query.connectionConfig);
    const roomName = HelperService.querify(connectionConfig);
    socket.join(roomName);
    // A client has connected
    this.users++;

    // Notify connected clients of current users
    this.server.emit('users', this.users);

  }

  async handleDisconnect(test) {
    console.log(test);
    // A client has disconnected
    this.users--;

    // Notify connected clients of current users
    this.server.emit('users', this.users);

  }

  @SubscribeMessage('chat')
  async onChat(client: Socket, message) {
    console.log(message);
    // client.join('test');
    this.server.to('test').emit('chat', 'this is test');
    // client.broadcast.emit('chat', message);
  }

}
