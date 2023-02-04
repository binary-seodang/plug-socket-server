import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common'
import { Reflector } from '@nestjs/core'
import { Observable } from 'rxjs'
import { GqlExecutionContext } from '@nestjs/graphql'
import { User } from 'src/users/entities/user.entity'
@Injectable()
export class AuthGuard implements CanActivate {
  constructor(private readonly relector: Reflector) {}
  canActivate(
    context: ExecutionContext,
  ): boolean | Promise<boolean> | Observable<boolean> {
    const roles = this.relector.get('roles', context.getHandler())
    if (!roles) {
      return true
    }
    const gqlContext = GqlExecutionContext.create(context).getContext()
    const user: User = gqlContext['user']
    return roles.includes('Any') || !!user
  }
}
