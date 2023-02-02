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
  @SubscribeMessage('set_nickname')
  setNickname(
    @ConnectedSocket() client: Socket,
    @MessageBody() nickname: string,
  ) {
    const user = this.findCurrentClient(client)
    user['nickname'] = nickname
    return nickname
  }

  @SubscribeMessage('join_room')
  async joinRoom(
    @ConnectedSocket() client: Socket,
    @MessageBody() roomName: string,
  ) {
    const { nickname } = this.findCurrentClient(client)
    if (!nickname) {
      return { ok: false }
    }
    client.join(roomName)
    const userList = await this.findJointedUsers(roomName)
    client.to(roomName).emit('welcome', { nickname, userList })
    this.serverRoomChange()
    return { nickname, userList, ok: true }
  }

  @SubscribeMessage('leave_room')
  async leaveRoom(
    @ConnectedSocket() client: Socket,
    @MessageBody() roomName: string,
  ) {
    await client.leave(roomName)
    const userList = await this.findJointedUsers(roomName)
    client.to(roomName).emit('leave', { userList })
    this.serverRoomChange()
    return roomName
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
    console.log(ice, 'ice')
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

  private async findJointedUsers(roomName: string) {
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
