import { Column, Entity, OneToMany, PrimaryGeneratedColumn } from "typeorm";
import { registeredStudent } from "./Registration.entity";

@Entity()
export class academicSession {
    @PrimaryGeneratedColumn()
    id: number;
    
    @Column({
        type: 'varchar',
        unique: true,
        nullable: false,
    })
    sessionId: string;

    @Column({
        nullable: false,
        type: 'boolean'
    })
    isActive: boolean;

    @Column({
        type: 'date',
        nullable: false,
        default: () => 'CURRENT_DATE'
    })
    startDate: Date;

    @Column({
        type: 'date',
        nullable: false,
        default: () => 'CURRENT_DATE',
        onUpdate: 'CURRENT_DATE'
    })
    endDate: Date;

    @OneToMany(() => registeredStudent, (registration) => registration.acadSession, {cascade: true, onDelete: 'CASCADE'})
    registration: registeredStudent[];
}