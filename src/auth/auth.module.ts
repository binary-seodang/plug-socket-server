import { UsersModule } from './../users/users.module'
import { Module } from '@nestjs/common'
import { APP_GUARD, APP_FILTER } from '@nestjs/core'
import { AuthGuard } from './auth.guard'
import { RoleException } from './auth-exception.filter'

@Module({
  imports: [UsersModule],
  providers: [
    {
      provide: APP_GUARD,
      useClass: AuthGuard,
    },
    {
      provide: APP_FILTER,
      useClass: RoleException,
    },
  ],
})
export class AuthModule {}
