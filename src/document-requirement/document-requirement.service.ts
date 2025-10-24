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

    private readonly logger = new Logger('DocumentRequirementService');

    //Logic to add document to the document requirement table
    async addDocument(dto: createDocsRequirementDto): Promise<DocsRequirement> {
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

        return await this.documentRequirementRepo.save(document);

        } catch (error) {
            throw new BadRequestException(error.message || 'Failed to add document')            
        }
    }

    //Logic to add Department and it's maximum level to the DB
    async addDepartment(dto: createDepartmentDto): Promise<StudentDepartment> {
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

        return await this.studentDepartmentRepo.save(department);
        
        } catch (error) {
            throw new BadRequestException(error.message || 'Failed to add department')
        }
    }

    //Logic to add student categories to the Category table in the DB
    async addCategory(dto: createCategoryDto): Promise<Category> {
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

            const category = await this.categoryRepo.create({
                name: dto.name,
            })
    
        return await this.categoryRepo.save(category);

        } catch (error) {
           throw new BadRequestException(error.message || 'Failed to add category') 
        }
    }

    //Logic to map the Document Requirement ID to the Category ID
    async mapDocToCat(dto: createDocMapsCategoryDto) {
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

            const map = await this.docMapsCategoryRepo.create({
                docsId: dto.docsId,
                categoryId: dto.categoryId,
            })
        
        return await this.docMapsCategoryRepo.save(map);

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
