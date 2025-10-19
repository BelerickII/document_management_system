import { IsEnum, IsInt, IsNotEmpty, IsString } from "class-validator";
import { UserCategory } from "../Entities/Category.entity";
import { Department } from "src/user/Entities/student.entity";
import { Type } from "class-transformer";

export class createDocsRequirementDto {
    @IsNotEmpty()
    @IsString()
    name: string;
}

export class createCategoryDto {
    @IsNotEmpty()
    @IsEnum(UserCategory)
    name: UserCategory;
}

export class createDepartmentDto {
    @IsNotEmpty()
    @IsEnum(Department)
    department: Department;

    @IsNotEmpty()
    @Type(() => Number)
    @IsInt()
    max_level: number;
}

export class createDocMapsCategoryDto {
    @IsNotEmpty()
    @Type(() => Number)
    @IsInt()
    categoryId: number;

    @IsNotEmpty()
    @Type(() => Number)
    @IsInt()
    docsId: number;
}