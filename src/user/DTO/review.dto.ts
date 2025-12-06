import { IsEnum, IsOptional, IsString } from "class-validator";
import { uploadStatus } from "src/session/Entities/Student-Uploads.entity";

export class reviewDto {
    @IsEnum(uploadStatus)
    action: uploadStatus;

    @IsOptional()
    @IsString()
    comment?: string;
}