import { Field, ObjectType } from '@nestjs/graphql'
import { IsNotEmpty, IsNumber, IsDate } from 'class-validator'

@ObjectType()
export class CoreDTO {
  @Field(() => Number)
  @IsNotEmpty()
  @IsNumber()
  id: number

  @Field(() => Date)
  @IsDate()
  createdAt: Date

  @Field(() => Date)
  @IsDate()
  updatedAt: Date
}

@ObjectType()
export class CoreOutput {
  @Field(() => String, { nullable: true })
  error?: string

  @Field(() => Boolean)
  ok: boolean
}
