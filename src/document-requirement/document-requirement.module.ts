import { Module } from '@nestjs/common';
import { DocumentRequirementController } from './document-requirement.controller';
import { DocumentRequirementService } from './document-requirement.service';
import { TypeOrmModule } from '@nestjs/typeorm';

import { DocsRequirement } from './Entities/docsRequiement.entity';
import { Category } from './Entities/Category.entity';
import { DocumentMapsCategory } from './Entities/DocMapsCat.entity';
import { StudentDepartment } from './Entities/Department.entity';

@Module({
  imports: [
      TypeOrmModule.forFeature([DocsRequirement, Category, DocumentMapsCategory, StudentDepartment]),  
    ],
  controllers: [DocumentRequirementController],
  providers: [DocumentRequirementService],
  exports: [DocumentRequirementService],
})
export class DocumentRequirementModule {}
