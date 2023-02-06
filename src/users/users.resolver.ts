import { UsersService } from 'src/users/users.service'
import { Query, Mutation, Resolver, Args } from '@nestjs/graphql'
import { LoginInput, LoginOutput } from './dtos/login.dto'
import { AuthUser } from 'src/auth/auth-user.decorator'
import { User } from './entities/user.entity'
import { Role } from 'src/auth/role.decorator'
import { UserProfileOutput } from './dtos/user-profile.dto'

@Resolver(() => User)
export class UsersResolver {
  constructor(private readonly usersService: UsersService) {}

  @Query(() => UserProfileOutput)
  @Role(['Any'])
  getMe(@AuthUser() user: User): UserProfileOutput {
    return { ok: true, user }
  }

  @Mutation(() => LoginOutput)
  async login(@Args('input') loginInput: LoginInput) {
    return this.usersService.login(loginInput)
  }
}
