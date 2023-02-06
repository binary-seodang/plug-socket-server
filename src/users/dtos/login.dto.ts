import { PickType, Field, InputType, ObjectType } from '@nestjs/graphql'
import { CoreOutput } from 'src/common/dtos/core.entites'
import { User } from '../entities/user.entity'

@InputType()
export class LoginInput extends PickType(User, ['nickname']) {}
@ObjectType()
export class LoginOutput extends CoreOutput {
  @Field(() => String, { nullable: true })
  token?: string
  @Field(() => User, { nullable: true })
  user?: User
}
