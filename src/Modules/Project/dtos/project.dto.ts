import { IsString, IsNotEmpty, MaxLength, IsOptional, IsEnum, IsDateString, IsMongoId, IsArray } from 'class-validator';
import { Type } from 'class-transformer';

export class CreateProjectDto {
    @IsString()
    @IsNotEmpty()
    @MaxLength(100)
    name: string;

    @IsOptional()
    @IsString()
    @MaxLength(1000)
    description?: string;

    @IsOptional()
    @IsEnum(['Not Started', 'In Progress', 'Completed', 'On Hold', 'Cancelled'])
    status?: string;

    @IsOptional()
    @IsDateString()
    startDate?: string;

    @IsOptional()
    @IsDateString()
    endDate?: string;

    @IsMongoId()
    @IsNotEmpty()
    assignedProjectManager: string;

    @IsOptional()
    @IsArray()
    @IsMongoId({ each: true })
    @Type(() => String)
    assignedTeamMembers?: string[];
}

export class UpdateProjectDto {
    @IsOptional()
    @IsString()
    @IsNotEmpty()
    @MaxLength(100)
    name?: string;

    @IsOptional()
    @IsString()
    @MaxLength(1000)
    description?: string;

    @IsOptional()
    @IsEnum(['Not Started', 'In Progress', 'Completed', 'On Hold', 'Cancelled'])
    status?: string;

    @IsOptional()
    @IsDateString()
    startDate?: string;

    @IsOptional()
    @IsDateString()
    endDate?: string;

    @IsOptional()
    @IsMongoId()
    assignedProjectManager?: string;

    @IsOptional()
    @IsArray()
    @IsMongoId({ each: true })
    @Type(() => String)
    assignedTeamMembers?: string[];
}

export class QueryProjectsDto {
    @IsOptional()
    @IsString()
    search?: string;

    @IsOptional()
    @IsString()
    status?: string;

    @IsOptional()
    @Type(() => Number)
    page: number = 1;

    @IsOptional()
    @Type(() => Number)
    limit: number = 50;

    @IsOptional()
    @IsString()
    sortBy: string = 'name';

    @IsOptional()
    @IsEnum(['asc', 'desc'])
    sortOrder: string = 'asc';
}