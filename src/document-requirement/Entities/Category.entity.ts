import { Column, Entity, OneToMany, PrimaryGeneratedColumn } from "typeorm";
import { DocumentMapsCategory } from "./DocMapsCat.entity";

export enum UserCategory{
    FRESHER = 'Fresher',
    RETURNING = 'Returning',
    FINALIST = 'Finalist',
}

@Entity()
export class Category {
    @PrimaryGeneratedColumn()
    id: number;

    @Column({
        nullable: false,
        type: 'enum',
        enum: UserCategory,
        default:UserCategory.FRESHER,
    })
    name: UserCategory;

    @OneToMany(() => DocumentMapsCategory, (docsMapCategory) => docsMapCategory.category, {cascade: true, onDelete: 'CASCADE'})
    docsMapCategory: DocumentMapsCategory[];
}