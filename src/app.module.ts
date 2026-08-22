import { Module } from '@nestjs/common';
import { PrismaService } from './prisma.service';
import { LeadsController } from './leads.controller';
import { DmTemplatesController } from './dm-templates.controller';

@Module({
  controllers: [LeadsController, DmTemplatesController],
  providers: [PrismaService],
})
export class AppModule {}
