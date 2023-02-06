import { DynamicModule, Global, Module } from '@nestjs/common'
import { Secret } from 'jsonwebtoken'
import { JWT_PROVIDER } from 'src/common/common.constants'
import { JwtModuleOptions } from './jwt.interface'
import { JwtService } from './jwt.service'
@Module({})
@Global()
export class JwtModule {
  static forRoot(options: JwtModuleOptions): DynamicModule {
    const { priveKey, pubkey } = options || {}
    const key: Secret = priveKey
    const pub: Secret = pubkey
    return {
      module: JwtModule,
      providers: [
        {
          provide: JWT_PROVIDER,
          useValue: { ...options, priveKey: key, pubkey: pub },
        },
        JwtService,
      ],
      exports: [JwtService],
    }
  }
}
