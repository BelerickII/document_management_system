import { DataSource, Repository } from 'typeorm';
import { Student } from '../Entities/student.entity';
import { BadRequestException, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';

import { DocumentRequirementService } from '../../document-requirement/document-requirement.service';
import { Category, UserCategory } from 'src/document-requirement/Entities/Category.entity';
import { StudentDepartment } from 'src/document-requirement/Entities/Department.entity';

@Injectable()
export class studentRepository extends Repository<Student> {
    constructor(
        @InjectRepository(StudentDepartment) private readonly studentDepartmentRepo: Repository<StudentDepartment>,
        @InjectRepository(Category) private readonly categoryRepo: Repository<Category>,
        private readonly docReqService: DocumentRequirementService,
        private readonly dataSource: DataSource, 
    ) {
        super(Student, dataSource.createEntityManager());
    }

    // Logic to get student Id and Session upon login
    async studentLogin(userId: number, currentSession: string) {
        const student = await this.createQueryBuilder('student')            
            .leftJoin('student.user', 'user')
            .leftJoinAndSelect('student.dept', 'dept')
            .where('user.id = :userId', { userId })
            .getOne();

        if(!student) {
            throw new BadRequestException('Student not found');
        }

        //If the student category has been determined for the current session -> reuse the stored data
        if(student.categoryId && student.academicSession === currentSession) {
            const requiredDocs = await this.docReqService.getRequiredDocsByCategory(student.categoryId);
            return { student, requiredDocs, categoryCached: true };
        }

        const category = await this.determineCategory(student.level, student.mode_of_entry, student.dept.id);

        if(!category) {
            throw new BadRequestException('Unable to determine student category');
        }

        //update the student record once the category is fetched
        await this.update(student.id, {
            categoryId: category.id,
            academicSession: currentSession,
        });

        const requiredDocs = await this.docReqService.getRequiredDocsByCategory(category.id);
        return {
            student: { ...student, categoryId: category.id, academicSession: currentSession},
            requiredDocs,
            categoryCached: false,
        };
    }

    //Logic to get the category of the student
    private async determineCategory(level: number, modeofentry: string, deptId: number) {
        const department = await this.studentDepartmentRepo.findOne({
            where: {id: deptId},
        });

        if(!department) {
            throw new BadRequestException('Student department not found');
        }

        const maxLevel = department.max_level;
        let categoryName: string;

        if((level === 100 && modeofentry === 'Utme') || (level === 200 && ['Direct Entry', 'Transfer'].includes(modeofentry))){
            categoryName = 'fresher';
        } else if (level === maxLevel){
            categoryName = 'finalist';
        } else {
            categoryName = 'returning';
        }

        //the logic gets the category name from the Category entity in the Document Module
        return this.categoryRepo.findOne({where: {name: categoryName as UserCategory}})
    }
}