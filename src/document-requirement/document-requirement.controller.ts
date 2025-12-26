import { Body, Controller, Post, UseGuards, UsePipes, ValidationPipe } from '@nestjs/common';
import { DocumentRequirementService } from './document-requirement.service';
import { createCategoryDto, createDepartmentDto, createDocMapsCategoryDto, createDocsRequirementDto } from './Dto/create-Docs-Requirement-Module.dto';
import { Roles } from 'src/auth/gaurds/roles.decorator';
import { UserRole } from 'src/user/Entities/user.entity';
import { JwtAuthGaurd } from 'src/auth/gaurds/jwt-auth.guard';
import { RolesGuard } from 'src/auth/gaurds/roles.gaurd';

@Controller('document-requirement')
export class DocumentRequirementController {
    constructor(private readonly documentService: DocumentRequirementService) {}

    @Post('add-document')
    @Roles(UserRole.ADMIN)
    @UseGuards(JwtAuthGaurd, RolesGuard)
    @UsePipes(ValidationPipe)
    async addDocument(@Body() dto: createDocsRequirementDto) {
        return this.documentService.addDocument(dto);
    }

    @Post('add-department')
    @Roles(UserRole.ADMIN)
    @UseGuards(JwtAuthGaurd, RolesGuard)
    @UsePipes(ValidationPipe)
    async addDepartment(@Body() dto: createDepartmentDto) {
        return this.documentService.addDepartment(dto);
    }

    @Post('add-category')
    @Roles(UserRole.ADMIN)
    @UseGuards(JwtAuthGaurd, RolesGuard)
    @UsePipes(ValidationPipe)
    async addCategory(@Body() dto: createCategoryDto) {
        return this.documentService.addCategory(dto);
    }

    @Post('map-category')
    @Roles(UserRole.ADMIN)
    @UseGuards(JwtAuthGaurd, RolesGuard)
    @UsePipes(ValidationPipe)
    async mapDocToCat(@Body() dto: createDocMapsCategoryDto) {
        return this.documentService.mapDocToCat(dto);
    }
}
