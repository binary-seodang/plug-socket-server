import { ExceptionFilter } from '@nestjs/common'

export class RoleException implements ExceptionFilter {
  async catch() {
    return { ok: false, error: '권한이 없습니다' }
  }
}
