import { SubscribeMessage, WebSocketGateway } from '@nestjs/websockets'
import {
  ConnectedSocket,
  MessageBody,
  WebSocketServer,
} from '@nestjs/websockets/decorators'
import {
  OnGatewayConnection,
  OnGatewayDisconnect,
  OnGatewayInit,
} from '@nestjs/websockets/interfaces'
import { Server, Socket } from 'socket.io'
import { LoggerService } from 'src/logger/logger.service'
import { getServerRoomDto } from './dtos/gateway.dto'

@WebSocketGateway(3050, {
  cors: {
    origin: '*',
  },
  path: '/',
})
export class EventsGateway
  implements OnGatewayConnection, OnGatewayDisconnect, OnGatewayInit
{
  @WebSocketServer() public server: Server
  constructor(private readonly logger: LoggerService) {
    this.logger.setContext('EventsGateway')
  }

  /**
   * TODO: Socket Handler return value를 통해 클라이언트 내에서 이벤트 핸들링 가능
   * ex) client-side -> socket.emit('join_room' , 'myRoomName' , data => console.log(data))
   * 일단 ws방식으로 구현 후 socket io 방식으로 변경하는게 좋을듯
   */
  @SubscribeMessage('join_room')
  joinRoom(@ConnectedSocket() client: Socket, @MessageBody() roomName: string) {
    client.join(roomName)
    client.to(roomName).emit('welcome')
    this.serverRoomChange()
    return roomName
  }

  @SubscribeMessage('get_all_rooms')
  async getAllRoomList() {
    return this.serverRoomChange()
  }

  @SubscribeMessage('offer')
  requestRTCOffer(
    @ConnectedSocket() client: Socket,
    // TODO : Offer Type assertion
    @MessageBody('offer') offer: any,
    @MessageBody('roomName') roomName: string,
  ) {
    client.to(roomName).emit('offer', offer)
  }

  @SubscribeMessage('answer')
  sendRTCanswer(
    @ConnectedSocket() client: Socket,
    @MessageBody('answer') answer: string,
    @MessageBody('roomName') roomName: string,
  ) {
    client.to(roomName).emit('answer', answer)
  }

  @SubscribeMessage('ice')
  requestRTCICECandidate(
    @ConnectedSocket() client: Socket,
    @MessageBody('ice') ice: any,
    @MessageBody('roomName') roomName: string,
  ) {
    client.to(roomName).emit('ice', ice)
  }
  handleConnection(@ConnectedSocket() client: Socket) {
    this.logger.log(`connected : ${client.id}`)
    this.serverRoomChange()
  }

  handleDisconnect(@ConnectedSocket() client: Socket) {
    this.logger.log(`disconnected : ${client.id}`)
    this.serverRoomChange()
  }

  async afterInit(server: Server) {
    // socket middleare
    // this.server.use((socket, next) => {
    //   console.log(socket)
    //   next()
    // })
    const serverCount = await server.sockets.adapter.serverCount()
    this.logger.log(`serverCount : ${serverCount}`)
  }

  private async findJoinedUsers(roomName: string) {
    const socketsInCurrentRoom = await this.server.sockets
      .in(roomName)
      .fetchSockets()
    return socketsInCurrentRoom.map((socket) => socket['nickname'])
  }

  private findCurrentClient(client: Socket) {
    return this.server.sockets.sockets.get(client.id) as Socket & {
      nickname: string
    }
  }

  private serverRoomChange(roomChangeArgs?: Partial<getServerRoomDto>) {
    const { isEmit } = roomChangeArgs || { isEmit: true }
    const {
      sockets: {
        adapter: { rooms, sids },
      },
    } = this.server
    const AllRooms = Array.from(rooms.keys()).filter(
      (key) => sids.get(key) === undefined,
    )
    if (isEmit) {
      this.server.sockets.emit('room_change', AllRooms)
    }
    return AllRooms
  }
}
