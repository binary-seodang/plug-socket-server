import { ConfigService } from '@nestjs/config'
import { IoAdapter } from '@nestjs/platform-socket.io'
import { ServerOptions } from 'socket.io'
import { createAdapter } from '@socket.io/redis-adapter'
import { createClient } from 'redis'
import { INestApplication } from '@nestjs/common/interfaces'
import { Server } from 'socket.io'
import { LoggerService } from 'src/logger/logger.service'
import { jwtSocketMiddleware } from 'src/jwt/jwt.middleware'

export class RedisIoAdapter extends IoAdapter {
  private readonly configService: ConfigService
  private readonly loggerService: LoggerService

  constructor(private readonly app: INestApplication) {
    super(app)
    this.configService = app.get(ConfigService)
    this.loggerService = app.get(LoggerService)
  }
  private adapterConstructor: ReturnType<typeof createAdapter>

  async connectToRedis(): Promise<void> {
    const pubClient = createClient({
      url: this.configService.get('REDIS_HOST'),
      password: this.configService.get('REDIS_PASSWORD'),
    })
    const subClient = pubClient.duplicate()

    await Promise.all([pubClient.connect(), subClient.connect()])

    this.adapterConstructor = createAdapter(pubClient, subClient)
  }

  createIOServer(port: number, options?: ServerOptions): any {
    const server: Server = super.createIOServer(port, { ...options })
    server.use(jwtSocketMiddleware)
    server.adapter(this.adapterConstructor)
    return server
  }

  // bindClientConnect(server: TServer, callback: Function): void;
  // bindClientDisconnect(client: TClient, callback: Function): void;
  // close(server: TServer): Promise<void>;
  // dispose(): Promise<void>;
  // abstract create(port: number, options?: TOptions): TServer;
  // abstract bindMessageHandlers(client: TClient, handlers: WsMessageHandler[], transform: (data: any) => Observable<any>): any;
}
