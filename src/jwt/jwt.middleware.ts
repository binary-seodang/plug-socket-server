import { JwtService } from 'src/jwt/jwt.service'
import { Injectable, NestMiddleware } from '@nestjs/common'
import { NextFunction, Request, Response } from 'express'
import { SocketMiddleware } from 'src/common/common.type'
import { UsersService } from 'src/users/users.service'

@Injectable()
export class JwtMiddleware implements NestMiddleware {
  constructor(
    private readonly jwtService: JwtService,
    private readonly usersService: UsersService,
  ) {}
  async use(req: Request, res: Response, next: NextFunction) {
    if ('_PLUG_AUTH_' in req.headers) {
      const token = req.headers['_PLUG_AUTH_']
      const decode = this.jwtService.verify(token.toString())
      if (typeof decode === 'object' && decode.hasOwnProperty('id')) {
        try {
          const { id } = decode
          const { user, ok } = await this.usersService.findById(id)
          if (ok) {
            req['user'] = user
          }
        } catch (e) {}
      }
    }
    next()
  }
}

export const jwtSocketMiddleware: SocketMiddleware = (socket, next) => {
  console.log(socket.handshake.auth)
  next()
}
