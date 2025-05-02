import { HttpException } from '../exceptions/httpException';
import { DataStoredInToken, IUser, TokenData } from '@Auth/interfaces/auth.interface';
import { Types } from 'mongoose';
import { RoleDocumnet } from '../../Modules/Role/interfaces/role.interface';
import { sign, verify } from 'jsonwebtoken';
import { hash, compare } from 'bcryptjs';
import { SECRET_KEY } from '@config/index';
import {
    registerDecorator,
    ValidationOptions,
    ValidationArguments,
} from 'class-validator';
import dayjs from 'dayjs';
import { messages, status } from './api.responses';



export const removenull = (obj: Record<string, any>) => {
    for (const propName in obj) {
        if (obj[propName] === null || obj[propName] === undefined || obj[propName] === '') {
            delete obj[propName];
        }
    }
    return obj;
};



export const pick = (object: Record<string, any>, keys: string[]) => {
    return keys.reduce((obj, key) => {
        if (object && Object.prototype.hasOwnProperty.call(object, key)) {
            obj[key] = object[key];
        }
        return obj;
    }, {} as Record<string, any>);
};

export const generateOTP = (length: number): string => {
    const digits = '0123456789';
    let OTP = '';
    for (let i = 0; i < length; i++) {
        OTP += digits[Math.floor(Math.random() * 10)];
    }
    return OTP;
};




export const createJWT = (user: IUser, expiresIn): TokenData => {
    const roleId = user.roleId;

    const dataStoredInToken: DataStoredInToken = {
        _id: user._id.toString(),
        role: roleId instanceof Types.ObjectId
            ? roleId.toString()
            : (roleId as RoleDocumnet)._id.toString(),
        email: user.email,
        passwordHash: user.accountSetting.passwordHash,
    };


    return {
        expiresIn,
        token: sign(dataStoredInToken, SECRET_KEY, { expiresIn }),
    };
};
export const verifyJWT = (token: string): object => {
    try {
        const decoded = verify(token, SECRET_KEY) as DataStoredInToken;
        return decoded;
    } catch (error) {
        if (error instanceof HttpException) throw error;
        throw new HttpException(status.Unauthorized, messages['English'].General.expired.replace("##", messages['English'].User.token));
    }
};

export const hashPassword = async (password: string): Promise<string> => {
    return hash(password, 10);
};

export const comparePassword = async (password: string, hash: string): Promise<boolean> => {
    return compare(password, hash);
};


export function isPasswordSecure(password: string): boolean {
    const minLength = 6;
    const uppercaseRegex = /[A-Z]/;
    const lowercaseRegex = /[a-z]/;
    const numberRegex = /\d/;
    const specialCharRegex = /[@#$%^&*!]/;

    if (password.length < minLength) {
        return false
    }
    if (!uppercaseRegex.test(password)) {
        return false
    }
    if (!lowercaseRegex.test(password)) {
        return false
    }
    if (!numberRegex.test(password)) {
        return false
    }
    if (!specialCharRegex.test(password)) {
        return false
    }
    return true

}


export function parseDurationToMs(duration: string): number {
    const regex = /^(\d+)([smhd])$/;
    const match = duration.match(regex);

    if (!match) throw new Error('Invalid duration format');

    const value = parseInt(match[1]);
    const unit = match[2];

    const multipliers: Record<string, number> = {
        s: 1000,
        m: 60 * 1000,
        h: 60 * 60 * 1000,
        d: 24 * 60 * 60 * 1000,
    };

    return value * multipliers[unit];
}



export function IsNotPastDate(validationOptions?: ValidationOptions) {
    return function (object: Object, propertyName: string) {
        registerDecorator({
            name: 'isNotPastDate',
            target: object.constructor,
            propertyName: propertyName,
            options: validationOptions,
            validator: {
                validate(value: Date) {
                    if (!value) return true;
                    return dayjs(value).isSame(dayjs(), 'day') ?? dayjs(value).isAfter(dayjs());
                },
                defaultMessage(args: ValidationArguments) {
                    return `${args.property} should not be in the past`;
                },
            },
        });
    };
}

/**
 * Ensure endDate is after startDate
 */
export function IsAfterDate(property: string, validationOptions?: ValidationOptions) {
    return function (object: Object, propertyName: string) {
        registerDecorator({
            name: 'isAfterDate',
            target: object.constructor,
            propertyName,
            options: validationOptions,
            validator: {
                validate(value: Date, args: ValidationArguments) {
                    const relatedValue = (args.object as any)[property];
                    if (!value || !relatedValue) return true;
                    return dayjs(value).isAfter(dayjs(relatedValue));
                },
                defaultMessage(args: ValidationArguments) {
                    return `${args.property} must be after ${property}`;
                },
            },
        });
    };
}

/**
 * @param input 
 * @returns validated string
 */

export function sanitiseString(input?: string): string {
    return input?.replace(/[^a-zA-Z0-9 ]/g, '');
}


