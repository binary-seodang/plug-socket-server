import { ConfigService } from '@nestjs/config'
import { IoAdapter } from '@nestjs/platform-socket.io'
import { ServerOptions } from 'socket.io'
import { createAdapter } from '@socket.io/redis-adapter'
import { createClient } from 'redis'
import { INestApplication } from '@nestjs/common/interfaces'
import { Server } from 'socket.io'

export class RedisIoAdapter extends IoAdapter {
  private readonly configService: ConfigService

  constructor(private readonly app: INestApplication) {
    super(app)
    this.configService = app.get(ConfigService)
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
    server.adapter(this.adapterConstructor)
    return server
  }

  // bindClientConnect(server: any, callback) {
  //   // console.log(server)
  //   console.log(callback())
  //   // if (callback) {
  //   //   callback()
  //   // }
  // }
  // bindClientDisconnect(client: TClient, callback: Function): void;
  // close(server: TServer): Promise<void>;
  // dispose(): Promise<void>;
  // abstract create(port: number, options?: TOptions): TServer;
  // abstract bindMessageHandlers(client: TClient, handlers: WsMessageHandler[], transform: (data: any) => Observable<any>): any;
}
