import { JwtMiddleware } from './jwt/jwt.middleware'
import { Module, NestModule, MiddlewareConsumer } from '@nestjs/common'
import { ConfigModule } from '@nestjs/config'
import { LoggerMiddleware } from './logger/logger.middleware'
import { EventsModule } from './events/events.module'
import { LoggerModule } from './logger/logger.module'
import joi from 'joi'
import { WorkspacesModule } from './workspaces/workspaces.module'
import { JwtModule } from './jwt/jwt.module'
import { GraphQLModule } from '@nestjs/graphql'
import { ApolloDriverConfig, ApolloDriver } from '@nestjs/apollo'
import { PrismaModule } from './prisma/prisma.module'
import { UsersModule } from './users/users.module'
import { AuthModule } from './auth/auth.module'

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
        REDIS_PASSWORD: joi.string().required(),
        JWT_PRIVATE_KEY: joi.string().required(),
        JWT_PUBLIC_KEY: joi.string().required(),
      }),
    }),
    PrismaModule,
    GraphQLModule.forRoot<ApolloDriverConfig>({
      driver: ApolloDriver,
      autoSchemaFile: true,
      context: ({ req }) => ({ user: req['user'] }),
    }),
    LoggerModule,
    WorkspacesModule,
    EventsModule,
    JwtModule.forRoot({
      isRSA: true,
      priveKey: process.env.JWT_PRIVATE_KEY,
      pubkey: process.env.JWT_PUBLIC_KEY,
    }),
    UsersModule,
    AuthModule,
  ],
  controllers: [],
  providers: [],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(LoggerMiddleware).forRoutes('*')
    consumer.apply(JwtMiddleware).exclude('/login').exclude('/').forRoutes('*')
  }
}
