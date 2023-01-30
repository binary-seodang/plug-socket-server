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
    return
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

  private serverRoomChange() {
    const {
      sockets: {
        adapter: { rooms, sids },
      },
    } = this.server
    this.server.sockets.emit(
      'room_change',
      Array.from(rooms.keys()).filter((key) => sids.get(key) === undefined),
    )
  }
}
