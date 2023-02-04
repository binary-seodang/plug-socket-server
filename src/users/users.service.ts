import { JwtService } from './../jwt/jwt.service'
import { LoginInput, LoginOutput } from './dtos/login.dto'
import { Injectable } from '@nestjs/common'
import { PrismaService } from 'src/prisma/prisma.service'
import { UserProfileOutput } from './dtos/user-profile.dto'

@Injectable()
export class UsersService {
  constructor(
    private readonly prismaService: PrismaService,
    private readonly jwtService: JwtService,
  ) {}

  async findById(id: number): Promise<UserProfileOutput> {
    try {
      const user = await this.prismaService.user.findUniqueOrThrow({
        where: {
          id,
        },
      })

      return {
        ok: true,
        user,
      }
    } catch {
      return { ok: false, error: 'User Not Found.' }
    }
  }

  async login({ nickname }: LoginInput): Promise<LoginOutput> {
    try {
      let loginUser = await this.prismaService.user.findUnique({
        where: {
          nickname,
        },
      })
      if (!loginUser) {
        loginUser = await this.prismaService.user.create({
          data: {
            nickname,
          },
        })
      }
      const token = this.jwtService.sign({ id: loginUser.id, nickname })
      return { ok: true, token, user: loginUser }
    } catch (error) {
      return { ok: false, error }
    }
  }
}
