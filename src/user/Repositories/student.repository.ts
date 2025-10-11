import { DataSource, Repository } from 'typeorm';
import { Student } from '../Entities/student.entity';
import { Injectable } from '@nestjs/common';

@Injectable()
export class studentRepository extends Repository<Student> {
    constructor(private dataSource: DataSource) {
            super(Student, dataSource.createEntityManager());
        }

}