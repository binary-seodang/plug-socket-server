import { Module, Global } from '@nestjs/common'
import { LoggerService } from './logger.service'

@Module({
  providers: [LoggerService],
  exports: [LoggerService],
})
@Global()
export class LoggerModule {}
