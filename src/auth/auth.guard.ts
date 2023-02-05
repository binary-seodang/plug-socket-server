import { UsersService } from 'src/users/users.service'
import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common'
import { Reflector } from '@nestjs/core'
import { GqlExecutionContext } from '@nestjs/graphql'
import { JwtService } from 'src/jwt/jwt.service'
import { RoleException } from './auth-exception.filter'
@Injectable()
export class AuthGuard implements CanActivate {
  constructor(
    private readonly relector: Reflector,
    private readonly jwtService: JwtService,
    private readonly usersService: UsersService,
  ) {}
  async canActivate(context: ExecutionContext): Promise<boolean> {
    const roles = this.relector.get('roles', context.getHandler())
    if (!roles) {
      return true
    }
    const gqlContext = GqlExecutionContext.create(context).getContext()
    const token = gqlContext.token
    if (token) {
      const decode = this.jwtService.verify(token)
      if (typeof decode === 'object' && decode.hasOwnProperty('id')) {
        const { user } = await this.usersService.findById(decode.id)
        if (user) {
          gqlContext['user'] = user
          return roles.includes('Any') || roles.includes(user.role)
        }
      }
    }

    throw new RoleException()
  }
}
