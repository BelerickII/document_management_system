import { BadRequestException, Injectable, Logger } from '@nestjs/common';
import { Repository } from 'typeorm';

import { DocsRequirement } from './Entities/docsRequiement.entity';
import { Category } from './Entities/Category.entity';
import { DocumentMapsCategory } from './Entities/DocMapsCat.entity';

import { createCategoryDto, createDepartmentDto, createDocMapsCategoryDto, createDocsRequirementDto } from './Dto/create-Docs-Requirement-Module.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { StudentDepartment } from './Entities/Department.entity';

@Injectable()
export class DocumentRequirementService {
    constructor (
        @InjectRepository(DocsRequirement) private readonly documentRequirementRepo: Repository<DocsRequirement>,
        @InjectRepository(Category) private readonly categoryRepo: Repository<Category>,
        @InjectRepository(DocumentMapsCategory) private readonly docMapsCategoryRepo: Repository<DocumentMapsCategory>,
        @InjectRepository(StudentDepartment) private readonly studentDepartmentRepo: Repository<StudentDepartment>
    ) {}

    //Logic to add document to the document requirement table
    async addDocument(dto: createDocsRequirementDto): Promise<{ message: string }> {
        try {
            for (const key in dto) {
                if(typeof dto[key] === 'string') dto[key] = dto[key].trim();
            }

            const existing = await this.documentRequirementRepo.findOne({
                where: {name: dto.name},
            });

            if (existing) {
                throw new BadRequestException(`${dto.name} already exists`)
            }
            
            const document = this.documentRequirementRepo.create({
                name: dto.name,
                isActive: true,
            });

            await this.documentRequirementRepo.save(document);
            return { message: 'Document requirement added successfully' };

        } catch (error) {
            throw new BadRequestException(error.message || 'Failed to add document requirement')            
        }
    }

    //Logic to add Department and it's maximum level to the DB
    async addDepartment(dto: createDepartmentDto): Promise<{ message: string }> {
        try {
            for (const key in dto) {
                if(typeof dto[key] === 'string') {
                    dto[key] = dto[key].trim();
                } 
            }

            const existing = await this.studentDepartmentRepo.findOne({
                where: {department: dto.department},
            });

            if (existing) {
                throw new BadRequestException(`${dto.department} already exists`)
            }

            const department = this.studentDepartmentRepo.create({
                department: dto.department,
                max_level: dto.max_level,
            });

            await this.studentDepartmentRepo.save(department);
            return { message: 'Department added successfully' };
        
        } catch (error) {
            throw new BadRequestException(error.message || 'Failed to add department')
        }
    }

    //Logic to add student categories to the Category table in the DB
    async addCategory(dto: createCategoryDto): Promise<{ message: string }> {
        try {
            for (const key in dto) {
               if(typeof dto[key] === 'string') dto[key] = dto[key].trim(); 
            }

            const existing = await this.categoryRepo.findOne({
                where: {name: dto.name},
            });

            if (existing) {
                throw new BadRequestException(`${dto.name} already exists`);
            }

            const category = this.categoryRepo.create({
                name: dto.name,
            })
    
            await this.categoryRepo.save(category);
            return { message: 'Student category added successfully' };

        } catch (error) {
           throw new BadRequestException(error.message || 'Failed to add category') 
        }
    }

    //Logic to map the Document Requirement ID to the Category ID
    async mapDocToCat(dto: createDocMapsCategoryDto): Promise<{ message: string }> {
        try {
            for (const key in dto) {
               if(typeof dto[key] === 'string') {
                    dto[key] = dto[key].trim();
                }                
            }

            const existing = await this.docMapsCategoryRepo.findOne({
                where: {docsId: dto.docsId, categoryId: dto.categoryId},
            });

            if (existing) {
                throw new BadRequestException(`${dto.docsId} & ${dto.categoryId} already exists, check the Document Maps Category table`);
            }

            const map = this.docMapsCategoryRepo.create({
                docsId: dto.docsId,
                categoryId: dto.categoryId,
            })
        
            await this.docMapsCategoryRepo.save(map);
            return { message: 'Mapping successful' };

        } catch (error) {
            throw new BadRequestException(error.message || 'Duplicate IDs; Check Carefully')
        }
    }

    /*Logic to supply a student documents for faculty registration based on determined category*/
    async getRequiredDocsByCategory (categoryId: number) {
        return this.docMapsCategoryRepo.find({
            where: { categoryId },
            relations: ['docs'],
        });
    }
}
