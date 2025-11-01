import { IsNotEmpty, IsString } from "class-validator";

export class logInDto {
    @IsNotEmpty()
    @IsString()
    username: string;
    
    @IsNotEmpty()
    @IsString()
    password: string;
}