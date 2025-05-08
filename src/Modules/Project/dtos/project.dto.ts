
import { IsString, IsNotEmpty, MaxLength, IsOptional, IsEnum, IsDateString, IsMongoId, IsArray, IsPhoneNumber, IsEmail, ArrayMinSize, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';
import { IsAfterDate, IsNotPastDate } from '@helpers/utilities.services';
import { messages } from '@helpers/api.responses';
import { projectStatus } from '@Project/interfaces/project.interface';




export class ClientDto {
    @IsString({
        message: ({ object }) => messages[object['language'] ?? 'en'].General.invalid.replace('##', messages[object['language'] ?? 'en'].General.Property),
    })
    @IsNotEmpty({
        message: ({ object }) => messages[object['language'] ?? 'en'].General.invalid.replace('##', messages[object['language'] ?? 'en'].General.Property),
    })
    @MaxLength(100, {
        message: ({ object }) => messages[object['language'] ?? 'en'].General.invalid.replace('##', messages[object['language'] ?? 'en'].General.Property),
    })
    name: string;

    @IsOptional()
    @IsString({
        message: ({ object }) => messages[object['language'] ?? 'en'].General.invalid.replace('##', messages[object['language'] ?? 'en'].General.Property),
    })
    @MaxLength(20, {
        message: ({ object }) => messages[object['language'] ?? 'en'].General.invalid.replace('##', messages[object['language'] ?? 'en'].General.Property),
    })
    @IsPhoneNumber(undefined, {
        message: ({ object }) => messages[object['language'] ?? 'en'].General.invalid.replace('##', messages[object['language'] ?? 'en'].General.Property),
    })
    phoneNumber?: string;

    @IsOptional()
    @IsString({
        message: ({ object }) => messages[object['language'] ?? 'en'].General.invalid.replace('##', messages[object['language'] ?? 'en'].General.Property),
    })
    @IsEmail({}, {
        message: ({ object }) => messages[object['language'] ?? 'en'].General.invalid.replace('##', messages[object['language'] ?? 'en'].General.Property),
    })
    @MaxLength(100, {
        message: ({ object }) => messages[object['language'] ?? 'en'].General.invalid.replace('##', messages[object['language'] ?? 'en'].General.Property),
    })
    email?: string;

    @IsOptional()
    @IsString({
        message: ({ object }) => messages[object['language'] ?? 'en'].General.invalid.replace('##', messages[object['language'] ?? 'en'].General.Property),
    })
    @MaxLength(50, {
        message: ({ object }) => messages[object['language'] ?? 'en'].General.invalid.replace('##', messages[object['language'] ?? 'en'].General.Property),
    })
    skypeId?: string;

    @IsOptional()
    @IsString({
        message: ({ object }) => messages[object['language'] ?? 'en'].General.invalid.replace('##', messages[object['language'] ?? 'en'].General.Property),
    })
    @MaxLength(200, {
        message: ({ object }) => messages[object['language'] ?? 'en'].General.invalid.replace('##', messages[object['language'] ?? 'en'].General.Property),
    })
    location?: string;
}
export class CreateProjectDto {
    @IsString({
        message: ({ object }) => messages[object['language'] ?? 'en'].General.invalid.replace('##', messages[object['language'] ?? 'en'].General.Property),
    })
    @IsNotEmpty({
        message: ({ object }) => messages[object['language'] ?? 'en'].General.invalid.replace('##', messages[object['language'] ?? 'en'].General.Property),
    })
    @MaxLength(100, {
        message: ({ object }) => messages[object['language'] ?? 'en'].General.invalid.replace('##', messages[object['language'] ?? 'en'].General.Property),
    })
    name: string;

    @IsOptional()
    @IsString({
        message: ({ object }) => messages[object['language'] ?? 'en'].General.invalid.replace('##', messages[object['language'] ?? 'en'].General.Property),
    })
    @MaxLength(1000, {
        message: ({ object }) => messages[object['language'] ?? 'en'].General.invalid.replace('##', messages[object['language'] ?? 'en'].General.Property),
    })
    description?: string;

    @IsOptional()
    @IsEnum(Object.values(projectStatus), {
        message: ({ object }) => messages[object['language'] ?? 'en'].General.invalid.replace('##', messages[object['language'] ?? 'en'].General.Property),
    })
    status?: string;

    @IsOptional()
    @IsNotPastDate({
        message: ({ object }) => messages[object['language'] ?? 'en'].General.invalid.replace('##', messages[object['language'] ?? 'en'].General.Property),
    })

    startDate?: string;

    @IsOptional()
    @IsDateString({}, {
        message: ({ object }) => messages[object['language'] ?? 'en'].General.invalid.replace('##', messages[object['language'] ?? 'en'].General.Property),
    })
    @IsAfterDate('startDate', {
        message: ({ object }) => messages[object['language'] ?? 'en'].General.invalid.replace('##', messages[object['language'] ?? 'en'].General.Property),
    })
    endDate?: string;


    @IsArray({
        message: ({ object }) => messages[object['language'] ?? 'en'].General.invalid.replace('##', messages[object['language'] ?? 'en'].General.Property),
    })
    @ArrayMinSize(1, {
        message: ({ object }) => messages[object['language'] ?? 'en'].General.invalid.replace('##', messages[object['language'] ?? 'en'].General.Property),
    })
    @ValidateNested({ each: true })
    @Type(() => ClientDto)
    clients: ClientDto[];


    @IsMongoId({
        message: ({ object }) => messages[object['language'] ?? 'en'].General.invalid.replace('##', messages[object['language'] ?? 'en'].General.Property),
    })
    @IsNotEmpty({
        message: ({ object }) => messages[object['language'] ?? 'en'].General.invalid.replace('##', messages[object['language'] ?? 'en'].General.Property),
    })
    assignedProjectManager: string;

    @IsOptional()
    @IsArray({
        message: ({ object }) => messages[object['language'] ?? 'en'].General.invalid.replace('##', messages[object['language'] ?? 'en'].General.Property),
    })
    @IsMongoId({
        each: true,
        message: ({ object }) => messages[object['language'] ?? 'en'].General.invalid.replace('##', messages[object['language'] ?? 'en'].General.Property),
    })
    @Type(() => String)
    assignedTeamMembers?: string[];
}

export class UpdateProjectDto {
    @IsOptional()
    @IsString({
        message: ({ object }) => messages[object['language'] ?? 'en'].General.invalid.replace('##', messages[object['language'] ?? 'en'].General.Property),
    })
    @IsNotEmpty({
        message: ({ object }) => messages[object['language'] ?? 'en'].General.invalid.replace('##', messages[object['language'] ?? 'en'].General.Property),
    })
    @MaxLength(100, {
        message: ({ object }) => messages[object['language'] ?? 'en'].General.invalid.replace('##', messages[object['language'] ?? 'en'].General.Property),
    })
    name: string;

    @IsOptional()
    @IsString({
        message: ({ object }) => messages[object['language'] ?? 'en'].General.invalid.replace('##', messages[object['language'] ?? 'en'].General.Property),
    })
    @MaxLength(1000, {
        message: ({ object }) => messages[object['language'] ?? 'en'].General.invalid.replace('##', messages[object['language'] ?? 'en'].General.Property),
    })
    description?: string;

    @IsOptional()
    @IsEnum(Object.values(projectStatus), {
        message: ({ object }) => messages[object['language'] ?? 'en'].General.invalid.replace('##', messages[object['language'] ?? 'en'].General.Property),
    })
    status?: string;

    @IsOptional()
    @IsNotPastDate({
        message: ({ object }) => messages[object['language'] ?? 'en'].General.invalid.replace('##', messages[object['language'] ?? 'en'].General.Property),
    })
    startDate?: string;

    @IsOptional()
    @IsDateString()
    @IsAfterDate('startDate', {
        message: ({ object }) => messages[object['language'] ?? 'en'].General.invalid.replace('##', messages[object['language'] ?? 'en'].General.Property),
    })
    endDate?: string;

    @IsOptional()
    @IsArray({
        message: ({ object }) => messages[object['language'] ?? 'en'].General.invalid.replace('##', messages[object['language'] ?? 'en'].General.Property),
    })
    @ArrayMinSize(1, {
        message: ({ object }) => messages[object['language'] ?? 'en'].General.invalid.replace('##', messages[object['language'] ?? 'en'].General.Property),
    })
    @ValidateNested({ each: true })
    @Type(() => ClientDto)
    clients: ClientDto[];

    @IsOptional()
    @IsMongoId({
        message: ({ object }) => messages[object['language'] ?? 'en'].General.invalid.replace('##', messages[object['language'] ?? 'en'].General.Property),
    })
    @IsNotEmpty({
        message: ({ object }) => messages[object['language'] ?? 'en'].General.invalid.replace('##', messages[object['language'] ?? 'en'].General.Property),
    })
    assignedProjectManager: string;

    @IsOptional()
    @IsArray({
        message: ({ object }) => messages[object['language'] ?? 'en'].General.invalid.replace('##', messages[object['language'] ?? 'en'].General.Property),
    })
    @IsMongoId({
        each: true,
        message: ({ object }) => messages[object['language'] ?? 'en'].General.invalid.replace('##', messages[object['language'] ?? 'en'].General.Property),
    })
    @Type(() => String)
    assignedTeamMembers?: string[];
}

export class QueryProjectsDto {
    @IsOptional()
    @IsString({
        message: ({ object }) => messages[object['language'] ?? 'en'].General.invalid.replace('##', messages[object['language'] ?? 'en'].General.Property),
    })
    search?: string;

    @IsOptional()
    @IsString({
        message: ({ object }) => messages[object['language'] ?? 'en'].General.invalid.replace('##', messages[object['language'] ?? 'en'].General.Property),
    })
    status?: string;

    @IsOptional()
    @Type(() => Number)
    page: number = 1;

    @IsOptional()
    @Type(() => Number)
    limit: number = 50;

    @IsOptional()
    @IsString({
        message: ({ object }) => messages[object['language'] ?? 'en'].General.invalid.replace('##', messages[object['language'] ?? 'en'].General.Property),
    })
    sortBy: string = 'name';

    @IsOptional()
    @IsEnum(['asc', 'desc'], {
        message: ({ object }) => messages[object['language'] ?? 'en'].General.invalid.replace('##', messages[object['language'] ?? 'en'].General.Property),
    })
    sortOrder: string = 'asc';
}
