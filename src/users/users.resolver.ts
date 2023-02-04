import { UsersService } from 'src/users/users.service'

import { Query, Mutation, Resolver, Args } from '@nestjs/graphql'
import { LoginInput, LoginOutput } from './dtos/login.dto'

@Resolver()
export class UsersResolver {
  constructor(private readonly usersService: UsersService) {}

  @Query(() => Boolean)
  test() {
    return true
  }
  @Mutation(() => LoginOutput)
  async login(@Args('input') loginInput: LoginInput) {
    return this.usersService.login(loginInput)
  }
}
