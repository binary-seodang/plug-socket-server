import { Module } from '@nestjs/common'
import { WorkspacesGateway } from './workspaces.gateway'

@Module({
  providers: [WorkspacesGateway],
})
export class WorkspacesModule {}
