
import { IsEmail, IsNotEmpty } from 'class-validator';
import { messages } from '../../../utils/helpers/api.responses';

export class LoginDto {

    @IsEmail(
        {},
        {
            message: ({ object }) =>
                messages[object['language'] ?? 'en'].General.noFieldsProvided,
        },
    )
    email: string;

    @IsNotEmpty({
        message: ({ object }) =>
            messages[object['language'] ?? 'en'].General.noFieldsProvided,
    })

    password: string;

}

export class ForgotPasswordDto {

    @IsEmail(
        {},
        {
            message: ({ object }) =>
                messages[object['language'] ?? 'en'].General.invalid.replace('##', messages[object['language'] ?? 'en'].User.field),
        },
    )
    email: string;


}

export class VerifyOtpDto {

    @IsNotEmpty({
        message: ({ object }) =>
            messages[object['language'] ?? 'en'].General.empty.replace('##', messages[object['language'] ?? 'en'].User.otp),
    })
    otp: string;


}

export class ResetPasswordDto {


    @IsNotEmpty({
        message: ({ object }) =>
            messages[object['language'] ?? 'en'].General.invalid.replace('##', messages[object['language'] ?? 'en'].User.passwordProperty),
    })

    newPassword: string;

    @IsNotEmpty({
        message: ({ object }) =>
            messages[object['language'] ?? 'en'].General.invalid.replace('##', messages[object['language'] ?? 'en'].User.passwordProperty),
    })

    confirmPassword: string;


}




