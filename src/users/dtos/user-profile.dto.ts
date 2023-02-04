import { Field, ObjectType } from '@nestjs/graphql'

import { CoreOutput } from 'src/common/dtos/core.entites'
import { User } from '../entities/user.entity'

@ObjectType()
export class UserProfileOutput extends CoreOutput {
  @Field(() => User, { nullable: true })
  user?: User
}
