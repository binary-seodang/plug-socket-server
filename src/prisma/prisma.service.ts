import {
  Injectable,
  OnModuleInit,
  INestApplication,
  Logger,
} from '@nestjs/common'
import { Prisma, PrismaClient } from '@prisma/client'

@Injectable()
export class PrismaService
  extends PrismaClient<Prisma.PrismaClientOptions, 'query' | 'info' | 'error'>
  implements OnModuleInit
{
  private readonly logger
  constructor() {
    super({
      log: [
        {
          emit: 'event',
          level: 'query',
        },
        {
          emit: 'event',
          level: 'error',
        },
        {
          emit: 'stdout',
          level: 'info',
        },
        {
          emit: 'stdout',
          level: 'warn',
        },
      ],
    })
    this.logger = new Logger('PRISMA')
  }

  async onModuleInit() {
    if (process.env.NODE_ENV === 'development') {
      this.$on('query', (event) => {
        this.logger.verbose(event.query, event.duration)
      })
      this.$on('info', (event) => {
        this.logger.verbose(event.timestamp, event.message, event.target)
      })
      this.$on('error', (event) => {
        this.logger.error(event.target)
      })
    }

    await this.$connect()
  }

  async enableShutdownHooks(app: INestApplication) {
    this.$on('beforeExit', async () => {
      await app.close()
    })
  }
}
