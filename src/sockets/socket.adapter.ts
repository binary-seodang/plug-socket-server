import { INestApplicationContext } from '@nestjs/common'
import { IoAdapter } from '@nestjs/platform-socket.io'
import { Server, ServerOptions } from 'socket.io'

export class SocketIOAdapter extends IoAdapter {
  constructor(private app: INestApplicationContext) {
    super(app)
  }

  createIOServer(port: number, options?: ServerOptions) {
    const server: Server = super.createIOServer(port, options)
    server.use((socket, next) => {
      console.log('connected socket id : ', socket.id)
      next()
    })
    return server
  }
}

// const createTokenMiddleware =
//   (jwtService: JwtService, logger: Logger) =>
//   (socket: SocketWithAuth, next) => {
//     // for Postman testing support, fallback to token header
//     const token =
//       socket.handshake.auth.token || socket.handshake.headers['token']

//     logger.debug(`Validating auth token before connection: ${token}`)

//     try {
//       const payload = jwtService.verify(token)
//       socket.userID = payload.sub
//       socket.pollID = payload.pollID
//       socket.name = payload.name
//       next()
//     } catch {
//       next(new Error('FORBIDDEN'))
//     }
//   }
