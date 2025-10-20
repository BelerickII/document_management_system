import { Body, Controller, Post, UsePipes, ValidationPipe } from '@nestjs/common';
import { DocumentRequirementService } from './document-requirement.service';
import { createCategoryDto, createDepartmentDto, createDocMapsCategoryDto, createDocsRequirementDto } from './Dto/create-Docs-Requirement-Module.dto';

@Controller('document-requirement')
export class DocumentRequirementController {
    constructor(private readonly documentService: DocumentRequirementService) {}

    @Post('add-document')
    @UsePipes(ValidationPipe)
    async addDocument(@Body() dto: createDocsRequirementDto) {
        return this.documentService.addDocument(dto);
    }

    @Post('add-department')
    @UsePipes(ValidationPipe)
    async addDepartment(@Body() dto: createDepartmentDto) {
        return this.documentService.addDepartment(dto);
    }

    @Post('add-category')
    @UsePipes(ValidationPipe)
    async addCategory(@Body() dto: createCategoryDto) {
        return this.documentService.addCategory(dto);
    }

    @Post('map-category')
    @UsePipes(ValidationPipe)
    async mapDocToCat(@Body() dto: createDocMapsCategoryDto) {
        return this.documentService.mapDocToCat(dto);
    }
}
