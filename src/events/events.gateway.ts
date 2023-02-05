import { WsExceptionFilter } from './../sockets/sockets-exception.filter'
import { Inject, UseFilters, Logger } from '@nestjs/common'
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
import { Namespace, Socket } from 'socket.io'
import { PrismaService } from 'src/prisma/prisma.service'
import { getServerRoomDto } from './dtos/gateway.dto'
import { AuthSocket, WSAuthMiddleware } from 'src/sockets/sockets.middleware'
import { UsersService } from 'src/users/users.service'
import { JwtService } from 'src/jwt/jwt.service'

@UseFilters(new WsExceptionFilter())
@WebSocketGateway({
  cors: {
    origin: '*',
  },
  namespace: '/',
  transports: ['websocket'],
})
export class EventsGateway
  implements OnGatewayConnection, OnGatewayDisconnect, OnGatewayInit
{
  private readonly logger = new Logger(EventsGateway.name)
  constructor(
    @Inject(PrismaService) private readonly prismaService: PrismaService,
    private readonly usersService: UsersService,
    private readonly jwtService: JwtService,
  ) {}

  @WebSocketServer() public io: Namespace

  @SubscribeMessage('set_nickname')
  async setNickname(
    @ConnectedSocket() client: Socket,
    @MessageBody() nickname: string,
  ) {
    const user = this.findCurrentClient(client)
    user['nickname'] = nickname
    const upsertedUser = await this.prismaService.user.upsert({
      where: {
        nickname,
      },
      update: {
        nickname,
      },
      create: {
        nickname,
      },
    })
    this.logger.debug(`${nickname} change`)
    return nickname
  }
  @SubscribeMessage('join_room')
  async joinRoom(
    @ConnectedSocket() client: Socket,
    @MessageBody() roomName: string,
  ) {
    const { nickname } = this.findCurrentClient(client) || {}
    if (!nickname) {
      return { ok: false }
    }
    client.join(roomName)
    const userList = await this.findJoinedUsers(roomName)
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
    const userList = await this.findJoinedUsers(roomName)
    client.nsp.to(roomName).emit('leave', { userList })
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
    client.to(roomName).emit('ice', ice)
  }

  handleConnection(@ConnectedSocket() client: AuthSocket) {
    this.logger.debug(`connected : ${client.id}`)
    this.logger.debug(`namespace : ${client.nsp.name}`)
    this.serverRoomChange()
  }

  handleDisconnect(@ConnectedSocket() client: Socket) {
    this.logger.log(`disconnected : ${client.id}`)
    this.serverRoomChange()
  }

  async afterInit(io: Namespace) {
    io.use(WSAuthMiddleware(this.jwtService, this.usersService))
    const serverCount = await io.server.sockets.adapter.serverCount()
    this.logger.log(`serverCount : ${serverCount}`)
  }

  private async findJoinedUsers(roomName: string) {
    const socketsInCurrentRoom = await this.io.server.sockets
      .in(roomName)
      .fetchSockets()
    return socketsInCurrentRoom.map((socket) => socket['nickname'])
  }

  private findCurrentClient(client: Socket) {
    return this.io.server.sockets.sockets.get(client.id) as Socket & {
      nickname: string
    }
  }

  private serverRoomChange(roomChangeArgs?: Partial<getServerRoomDto>) {
    const { isEmit } = roomChangeArgs || { isEmit: true }
    const {
      sockets: {
        adapter: { rooms, sids },
      },
    } = this.io.server
    const AllRooms = Array.from(rooms.keys()).filter(
      (key) => sids.get(key) === undefined,
    )
    if (isEmit) {
      this.io.server.emit('room_change', AllRooms)
    }
    return AllRooms
  }
}
