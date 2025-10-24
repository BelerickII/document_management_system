import { Department, Student } from "src/user/Entities/student.entity";
import { Column, Entity, OneToMany, PrimaryGeneratedColumn } from "typeorm";

@Entity()
export class StudentDepartment {
    @PrimaryGeneratedColumn()
    id: number;

    @Column({
        type: 'enum',
        enum: Department,
        nullable: false,
    })
    department: Department;

    @Column({
        type: 'int',        
        nullable: false,
    })
    max_level: number;

    @OneToMany(() => Student, student => student.dept)
    student: Student[];
}