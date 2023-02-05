import { JwtService } from 'src/jwt/jwt.service'
import { UsersService } from 'src/users/users.service'
import { WSAuthMiddleware } from 'src/sockets/sockets.middleware'
import { UseFilters, Logger } from '@nestjs/common'
import { WebSocketGateway } from '@nestjs/websockets'
import {
  ConnectedSocket,
  SubscribeMessage,
  WebSocketServer,
} from '@nestjs/websockets/decorators'
import {
  OnGatewayConnection,
  OnGatewayDisconnect,
  OnGatewayInit,
} from '@nestjs/websockets/interfaces'
import { Namespace, Socket } from 'socket.io'
import { getServerRoomDto } from 'src/events/dtos/gateway.dto'

import { WsExceptionFilter } from 'src/sockets/sockets-exception.filter'

@UseFilters(new WsExceptionFilter())
@WebSocketGateway({
  cors: {
    origin: '*',
  },
  namespace: '/workspace',
  transports: ['websocket'],
})
export class WorkspacesGateway
  implements OnGatewayConnection, OnGatewayDisconnect, OnGatewayInit
{
  private readonly logger = new Logger(WorkspacesGateway.name)
  constructor(
    private readonly usersService: UsersService,
    private readonly jwtService: JwtService,
  ) {}
  @WebSocketServer() public io: Namespace

  handleConnection(@ConnectedSocket() client: Socket) {
    this.logger.debug(`workspace connected : ${client.id}`)
    this.logger.debug(`workspace namespace : ${client.nsp.name}`)
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
