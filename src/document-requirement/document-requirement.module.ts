import { Module } from '@nestjs/common';
import { DocumentRequirementController } from './document-requirement.controller';
import { DocumentRequirementService } from './document-requirement.service';

@Module({
  controllers: [DocumentRequirementController],
  providers: [DocumentRequirementService]
})
export class DocumentRequirementModule {}
