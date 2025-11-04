import { IsEmail, IsNotEmpty, IsString, Matches, MaxLength, MinLength } from "class-validator";

export class ResetPwdDto {
    @IsString()
    @MinLength(6)
    @MaxLength(15)
    @Matches(
        /((?=.*\d)|(?=.*\W+))(?![.\n])(?=.*[A-Z])(?=.*[a-z]).*$/,
        {message: 'Password too weak'}
    )
    newPassword: string;
}