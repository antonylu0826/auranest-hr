import { Module } from '@nestjs/common';
import { ApiKeysModule } from '../api-keys/api-keys.module';
import { ShiftTypesController } from './shift-types.controller';
import { ShiftTypesService } from './shift-types.service';

@Module({
  imports: [ApiKeysModule],
  controllers: [ShiftTypesController],
  providers: [ShiftTypesService],
})
export class ShiftTypesModule {}
