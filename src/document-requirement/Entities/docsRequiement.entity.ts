import { Column, Entity, OneToMany, PrimaryGeneratedColumn } from "typeorm";
import { DocumentMapsCategory } from "./DocMapsCat.entity";

@Entity()
export class DocsRequirement {
    @PrimaryGeneratedColumn()
    id: number;

    @Column({
        type: 'varchar',
        nullable: false,
        unique: true,
    })
    name: string;

    @Column({
        nullable: false,
        type: 'boolean',
    })
    isActive: boolean;

    @OneToMany(() => DocumentMapsCategory, (docsMapCategory) => docsMapCategory.docs)
    docsMapCategory: DocumentMapsCategory[];
}