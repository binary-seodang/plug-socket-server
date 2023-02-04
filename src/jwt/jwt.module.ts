import { DynamicModule, Global, Module } from '@nestjs/common'
import fs from 'fs'
import path from 'path'
import { Secret } from 'jsonwebtoken'
import { JWT_PROVIDER } from 'src/common/common.constants'
import { JwtModuleOptions } from './jwt.interface'
import { JwtService } from './jwt.service'
@Module({})
@Global()
export class JwtModule {
  static forRoot(options: JwtModuleOptions): DynamicModule {
    const { priveKey, isRSA, pubkey } = options || {}
    let key: Secret = priveKey
    let pub: Secret = pubkey
    if (!isRSA) {
      key = priveKey
    } else {
      key = fs.readFileSync(
        path.resolve(__dirname, '../../src/key/private.key.key'),
      )
      pub = fs.readFileSync(
        path.resolve(__dirname, '../../src/key/public.key.pub'),
      )
    }
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
