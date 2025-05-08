
import { IsEmail, IsNotEmpty, Length, Matches } from 'class-validator';
import { messages } from '../../../utils/helpers/api.responses';

export class LoginDto {

    @IsEmail(
        {},
        {
            message: ({ object }) =>
                messages[object['language'] ?? 'en'].General.invalid.replace('##', messages[object['language'] ?? 'en'].General.Property),
        },
    )
    email: string;

    @IsNotEmpty({
        message: ({ object }) =>
            messages[object['language'] ?? 'en'].General.invalid.replace('##', messages[object['language'] ?? 'en'].General.Property),
    })
    @Matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[\W_]).{12,}$/, {
        message: ({ object }) =>
            messages[object['language'] ?? 'en'].General.invalid.replace('##', messages[object['language'] ?? 'en'].General.Property),
    })
    password: string;

}

export class ForgotPasswordDto {

    @IsEmail(
        {},
        {
            message: ({ object }) =>
                messages[object['language'] ?? 'en'].General.invalid.replace('##', messages[object['language'] ?? 'en'].User.Property),
        },
    )
    email: string;


}

export class VerifyOtpDto {

    @IsNotEmpty({
        message: ({ object }) =>
            messages[object['language'] ?? 'en'].General.empty.replace('##', messages[object['language'] ?? 'en'].User.otp),
    })
    @Length(6, 6, {
        message: ({ object }) =>
            messages[object['language'] ?? 'en'].General.invalid.replace(
                '##',
                messages[object['language'] ?? 'en'].User.otp,
            ),
    })
    otp: string;


}

export class ResetPasswordDto {


    @IsNotEmpty({
        message: ({ object }) =>
            messages[object['language'] ?? 'en'].General.invalid.replace('##', messages[object['language'] ?? 'en'].User.Property),
    })
    @Matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[\W_]).{12,}$/, {
        message: ({ object }) =>
            messages[object['language'] ?? 'en'].General.invalid.replace('##', messages[object['language'] ?? 'en'].General.Property),
    })
    newPassword: string;


    @IsNotEmpty({
        message: ({ object }) =>
            messages[object['language'] ?? 'en'].General.invalid.replace('##', messages[object['language'] ?? 'en'].User.Property),
    })
    @Matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[\W_]).{12,}$/, {
        message: ({ object }) =>
            messages[object['language'] ?? 'en'].General.invalid.replace('##', messages[object['language'] ?? 'en'].General.Property),
    })
    confirmPassword: string;


}




