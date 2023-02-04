import { CoreDTO } from '../../common/dtos/core.entites'
import { User as PrismaUser, UserRole } from '@prisma/client'
import { InputType, ObjectType, Field, registerEnumType } from '@nestjs/graphql'
import { IsString, IsEnum, IsOptional } from 'class-validator'

registerEnumType(UserRole, { name: 'UserRole' })

@InputType('UserInputType', { isAbstract: true })
@ObjectType()
export class User extends CoreDTO implements PrismaUser {
  @Field(() => String)
  @IsString()
  nickname: string

  @Field(() => UserRole, { nullable: true })
  @IsEnum(UserRole)
  @IsOptional()
  role: UserRole | null
}
