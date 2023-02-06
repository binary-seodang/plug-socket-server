import { Logger, ValidationPipe } from '@nestjs/common'
import { NestFactory } from '@nestjs/core'
import { SwaggerModule } from '@nestjs/swagger'
import { DocumentBuilder } from '@nestjs/swagger/dist'
import { AppModule } from './app.module'
import { RedisIoAdapter } from './redis/redis.adapter'

declare const module: any

async function bootstrap() {
  const PORT = process.env.PORT || 3000
  const app = await NestFactory.create(AppModule)
  const redisIoAdapter = new RedisIoAdapter(app)
  await redisIoAdapter.connectToRedis()
  app.useWebSocketAdapter(redisIoAdapter)
  app.useGlobalPipes(new ValidationPipe())

  app.setGlobalPrefix('api/v1')
  const config = new DocumentBuilder()
    .setTitle('Plug Api')
    .setVersion('0.0.1')
    .setDescription('Plug Webrtc socket server')
    .build()
  const documnet = SwaggerModule.createDocument(app, config)
  SwaggerModule.setup('api', app, documnet)

  await app.listen(PORT, () => {
    new Logger().localInstance.log(`app listen on port : ${PORT}`)
  })

  if (module.hot) {
    module.hot.accept()
    module.hot.dispose(() => app.close())
  }
}
bootstrap()
