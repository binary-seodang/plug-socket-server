import { DynamicModule, Global, Module } from '@nestjs/common'
// import { JwtModuleOptions } from './jwt.interface'
// import { JwtService } from './jwt.service'
import { Secret } from 'jsonwebtoken'
import { JWT_PROVIDER } from 'src/common/common.constants'
import { JwtModuleOptions } from './jwt.interface'
import { JwtService } from './jwt.service'
@Module({})
@Global()
export class JwtModule {
  static forRoot(options: JwtModuleOptions): DynamicModule {
    const { priveKey, isRSA, pubkey } = options || {}
    let key: Secret
    if (!isRSA) {
      key = priveKey
    } else {
      key = priveKey
    }
    return {
      module: JwtModule,
      providers: [
        {
          provide: JWT_PROVIDER,
          useValue: { ...options, priveKey: key, pubkey },
        },
        JwtService,
      ],
      exports: [JwtService],
    }
  }
}
