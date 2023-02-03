import { Module, NestModule, MiddlewareConsumer } from '@nestjs/common'
import { ConfigModule } from '@nestjs/config'
import { LoggerMiddleware } from './logger/logger.middleware'
import { EventsModule } from './events/events.module'
import { LoggerModule } from './logger/logger.module'
import joi from 'joi'
import { WorkspacesModule } from './workspaces/workspaces.module'

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath:
        process.env.NODE_ENV === 'development'
          ? '.env.development'
          : '.env.test',
      ignoreEnvFile: process.env.NODE_ENV === 'production',
      validationSchema: joi.object({
        PORT: joi.string().required(),
        REDIS_HOST: joi.string().required(),
        REDIS_PORT: joi.string().required(),
        REDIS_PASSWORD: joi.string().required(),
      }),
    }),
    LoggerModule,
    WorkspacesModule,
    EventsModule,
  ],
  controllers: [],
  providers: [],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(LoggerMiddleware).forRoutes('*')
  }
}
