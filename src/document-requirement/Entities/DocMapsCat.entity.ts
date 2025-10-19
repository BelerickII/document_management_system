import { Entity, JoinColumn, ManyToOne, PrimaryColumn } from "typeorm";
import { DocsRequirement } from "./docsRequiement.entity";
import { Category } from "./Category.entity";

@Entity('docs_map_category')
export class DocumentMapsCategory {    
    @PrimaryColumn({name: 'docsId'})
    docsId: number;

    @PrimaryColumn({name: 'categoryId'})
    categoryId: number;

    @ManyToOne(() => DocsRequirement, (docs) => docs.docsMapCategory)
    @JoinColumn({name: 'docsId'})
    docs: DocsRequirement;

    @ManyToOne(() => Category, (category) => category.docsMapCategory)
    @JoinColumn({name: 'categoryId'})
    category: Category;
}