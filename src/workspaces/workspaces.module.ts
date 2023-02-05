import { UsersModule } from './../users/users.module'
import { Module } from '@nestjs/common'
import { WorkspacesGateway } from './workspaces.gateway'

@Module({
  imports: [UsersModule],
  providers: [WorkspacesGateway],
})
export class WorkspacesModule {}
