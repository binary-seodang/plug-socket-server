import { Injectable, Inject } from '@nestjs/common'
import { JWT_PROVIDER } from 'src/common/common.constants'
import { JwtModuleOptions } from './jwt.interface'
import jwt, { Algorithm } from 'jsonwebtoken'

@Injectable()
export class JwtService {
  private readonly algorithm: Algorithm
  constructor(
    @Inject(JWT_PROVIDER) private readonly options: JwtModuleOptions,
  ) {
    this.algorithm = this.options.isRSA ? 'RS256' : 'HS256'
  }
  sign<T>(payload: object | T | any) {
    const token = jwt.sign(payload, this.options.priveKey, {
      algorithm: this.algorithm,
    })
    console.log(token)
    return token
  }

  verify(token: string) {
    return jwt.verify(
      token,
      this.options.isRSA ? this.options.pubkey : this.options.priveKey,
      {
        algorithms: [this.algorithm],
      },
    )
  }
}
