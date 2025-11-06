import { IsEnum, IsInt, IsNotEmpty, IsString } from "class-validator";
import { Status } from "../Entities/Student-Uploads.entity";
import { Type } from "class-transformer";

export class academicSessionDto {
    @IsNotEmpty()
    @IsString()
    sessionId: string;
}

export class uploadDocDto {
    @IsString()
    @IsNotEmpty()
    documentType: string;    

    @IsInt()
    @Type(() => Number)
    @IsNotEmpty()
    stuId: number;

    @IsInt()
    @Type(() => Number)
    @IsNotEmpty()
    docReqId: number;
}