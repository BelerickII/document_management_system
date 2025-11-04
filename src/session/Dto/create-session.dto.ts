import { IsNotEmpty, IsString } from "class-validator";

export class academicSessionDto {
    @IsNotEmpty()
    @IsString()
    sessionId: string;
}