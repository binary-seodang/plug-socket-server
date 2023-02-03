import { Logger } from '@nestjs/common'
import { NestFactory } from '@nestjs/core'
import { SwaggerModule } from '@nestjs/swagger'
import { DocumentBuilder } from '@nestjs/swagger/dist'
import { AppModule } from './app.module'
import { RedisIoAdapter } from './redis/redis.adapter'

async function bootstrap() {
  const PORT = process.env.PORT || 3000
  const app = await NestFactory.create(AppModule)
  app.setGlobalPrefix('api/v1')
  const config = new DocumentBuilder()
    .setTitle('Plug Api')
    .setVersion('0.0.1')
    .setDescription('Plug Webrtc socket server')
    .build()
  const documnet = SwaggerModule.createDocument(app, config)
  SwaggerModule.setup('api', app, documnet)
  const redisIoAdapter = new RedisIoAdapter(app)
  await redisIoAdapter.connectToRedis()
  app.useWebSocketAdapter(redisIoAdapter)

  await app.listen(PORT)
  new Logger().localInstance.log(`app listen on port : ${PORT}`)
}
bootstrap()
