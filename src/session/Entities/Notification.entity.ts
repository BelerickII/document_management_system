import { FacultyStaff } from "src/user/Entities/faculty-staff.entity";
import { Student } from "src/user/Entities/student.entity";
import { Column, Entity, ManyToOne, PrimaryGeneratedColumn } from "typeorm";

@Entity()
export class Notification {
    @PrimaryGeneratedColumn()
    id: number;

    @Column({
        type: 'varchar',
        nullable: false,
        length: 30
    })
    title: string;

    @Column({
        type: 'varchar',
        nullable: false,
        length: 400
    })
    message: string;
    
    @Column({
        type: 'date',
        nullable: false,
        onUpdate: 'CURRENT_DATE'
    })
    createdAt: Date;
    
    @Column({
        type: 'boolean',
        nullable: false
    })
    isRead: boolean;
    
    @ManyToOne(() => Student, (student) => student.notifications, { nullable: true })
    student: Student;

    @ManyToOne(() => FacultyStaff, (staff) => staff.notifications, { nullable: true })
    staff: FacultyStaff;
}