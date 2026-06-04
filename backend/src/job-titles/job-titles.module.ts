import { Module } from '@nestjs/common';
import { ApiKeysModule } from '../api-keys/api-keys.module';
import { JobTitlesController } from './job-titles.controller';
import { JobTitlesService } from './job-titles.service';

@Module({
  imports: [ApiKeysModule],
  controllers: [JobTitlesController],
  providers: [JobTitlesService],
})
export class JobTitlesModule {}
