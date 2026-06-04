import { Module } from '@nestjs/common';
import { ApiKeysModule } from '../api-keys/api-keys.module';
import { OrgUnitsController } from './org-units.controller';
import { OrgUnitsService } from './org-units.service';

@Module({
  imports: [ApiKeysModule],
  controllers: [OrgUnitsController],
  providers: [OrgUnitsService],
})
export class OrgUnitsModule {}
