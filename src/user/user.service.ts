import { BadRequestException, Injectable, InternalServerErrorException, Logger } from '@nestjs/common';

import { User } from './Entities/user.entity';
import { Student } from './Entities/student.entity';
import { FacultyStaff } from './Entities/faculty-staff.entity';

import { CreateUserDto } from './Dto/create-user.dto';
import { CreateStudentDto } from './Dto/create-student.dto';
import { CreateFacultyDto } from './Dto/create-faculty-staff.dto';

import { Readable } from 'stream';
import csvParser from 'csv-parser';
import { validate } from 'class-validator';
import { plainToInstance } from 'class-transformer';

import { userRepository } from './Repositories/user.repository';
import { studentRepository } from './Repositories/student.repository';
import { staffRepository } from './Repositories/faculty-staff.repository';


@Injectable()
export class UserService {
    constructor (
        private readonly userRepo: userRepository,
        private readonly studentRepo: studentRepository,
        private readonly staffRepo: staffRepository
    ) {}
    
    private readonly logger = new Logger('UserService');

    //**************Admin Business Logic**************//
    async uploadstudentsCsv(file: Express.Multer.File) {
        if (!file) throw new BadRequestException("No CSV file uploaded");

        //telling the server the csv should be read from the memory address file.buffer and store in stream variable
        const stream = Readable.from(file.buffer);

        //initializing the parser to convert the CSV file into a JS object 
        const parser = (csvParser as any)();

        //creating an array to log successful & failed uploads
        const successfulImports: Array<{row: number; email?: string; matric_no?: string}> = [];
        const failedImports: Array<{row: number; error: string}> = [];

        let rowNumber = 1;

        return new Promise((resolve, reject) => {
            stream
                .pipe(parser)
                .on('data', async (rawRow: Record<string, any>) => {
                    //pause the parser to safely handle async database operations
                    parser.pause();
                    rowNumber++;                    

                    try {
                        /*ensures the rows read from the CSV matches the headers with their expected
                        values in the dto file and assign it to the variable dto*/
                        const dto = rawRow as CreateStudentDto;

                        //just trimming the extra white spaces and commas around a CSV string
                        for (const key in dto) {
                            if (typeof dto[key] === 'string') dto[key] = dto[key].trim();
                        }

                        //validate DTO fields with class-validator decorators by calling the function here
                        await this.validateDtoStudent(dto, rowNumber);

                        //if no errors validating, Create User + Student in database
                        await this.createStudentWithUser(dto);

                        //Record successful uploads/imports to the DB
                        successfulImports.push({
                           row: rowNumber,
                           email: dto.email,
                           matric_no: dto.matric_no 
                        });
                        
                    } catch (error: any) {
                        const message = error?.message || 'Unknown error during import';
                        this.logger.warn(`CSV import error at row ${rowNumber}: ${message}`);
                        failedImports.push({
                            row: rowNumber, 
                            error: message 
                        })
                    } finally {                        
                        //Resume stream processing for next row
                        parser.resume();
                    }
                })
                .on('end', () => {                  
                    //when the stream finishes and all rows have been read
                    resolve({
                        total: rowNumber,                        
                        errorCount: failedImports.length + 1,
                        successfulImports,
                        failedImports,
                    });

                    // return {
                    //     message: `${successfulImports.length} students successfully created`,
                    // }

                })
                .on('error', (error: Error) => {
                    this.logger.error('CSV parsing stream error', error);
                    reject(new InternalServerErrorException('Failed to parse CSV file'));
                });
        });

    }

    //*************Validation Section using the DTOs for each of the entities instance*************//
    
    /*Validates a DTO instance i.e a row from the CSV now a JS object; using class-validator
    Throws a BadRequestException if validation fails*/
    private async validateDtoStudent(dto: CreateStudentDto, rowNumber: number): Promise<void> {
        const dtoInstance = plainToInstance(CreateStudentDto, dto);
        const validationErrors = await validate(dtoInstance);

        if (validationErrors.length > 0) {
            const messages = validationErrors
                .flatMap((ve) => Object.values(ve.constraints ?? {}).map((m) => `${ve.property}: ${m}`),).join('; ');
                throw new BadRequestException(`Row ${rowNumber} validation failed: ${messages}`)
        }
    }

    private async validateDtoStaff(dto: CreateFacultyDto, rowNumber: number): Promise<void> {
        const dtoInstance = plainToInstance(CreateFacultyDto, dto);
        const validationErrors = await validate(dtoInstance);

        if (validationErrors.length > 0) {
            const messages = validationErrors
                .flatMap((ve) => Object.values(ve.constraints ?? {}).map((m) => `${ve.property}: ${m}`),).join('; ');
                throw new BadRequestException(`Row ${rowNumber} validation failed: ${messages}`)
        }
    }

    private async validateDtoAdmin(dto: CreateUserDto, rowNumber: number): Promise<void> {
        const dtoInstance = plainToInstance(CreateUserDto, dto);
        const validationErrors = await validate(dtoInstance);

        if (validationErrors.length > 0) {
            const messages = validationErrors
                .flatMap((ve) => Object.values(ve.constraints ?? {}).map((m) => `${ve.property}: ${m}`),).join('; ');
                throw new BadRequestException(`Row ${rowNumber} validation failed: ${messages}`)
        }
    }

    //Injecting the custom repo for user inside this service module
    async createUser(dto: CreateUserDto): Promise<User> {
        return this.userRepo.createUser(dto);
    }

    //------------POST REQUESTS--------------//

    //Section that populate the database with the rows from the CSV
    async createStudentWithUser(dto: CreateStudentDto): Promise<Student> {
       const user = await this.createUser(dto);

        //Create linked student record in DB
        const student = this.studentRepo.create({
            user,
            matric_no: dto.matric_no,
            department: dto.department,
            mode_of_entry: dto.mode_of_entry,
            level: dto.level,
            graduated: false            
        } as Partial<Student>);

        return await this.studentRepo.save(student);
    }

    //Logic handling the creation of a single student by the admin
    async createSingleStudent(dto: CreateStudentDto) {
        try {
            //Trim spaces in strings
            for (const key in dto) {
                if (typeof dto[key] === 'string') dto[key] = dto[key].trim();
            }

            //Check for existing student by matric number
            const existing = await this.studentRepo.findOne({
                where: {matric_no: dto.matric_no},
            });

            if (existing){
                throw new BadRequestException(`Student with matric number "${dto.matric_no}" already exists`)
            }

            //validate incoming DTO manually
            await this.validateDtoStudent(dto, 1);

            //create user + student record using the existing method above
            const student = await this.createStudentWithUser(dto);

            return{
                message:'Student created successfully',
                student,
            };
                       
        } catch (error) {
            this.logger.error('Error creating student record', error);
            throw new BadRequestException(error.message || 'Failed to create student record')            
        }
    }

    //Logic handling the creation of a Faculty Staff
    async createStaff (dto: CreateFacultyDto): Promise<FacultyStaff> {
        try {            
            //Trim spaces in strings
            for (const key in dto) {
                if (typeof dto[key] === 'string') dto[key] = dto[key].trim();
            }

            //Check for existing student by matric number
            const existing = await this.staffRepo.findOne({
                where: {staffID: dto.staffID},
            });

            if (existing){
                throw new BadRequestException(`Staff with this ID number "${dto.staffID}" already exists`)
            }

            //validate incoming DTO manually
            await this.validateDtoStaff(dto, 1);

            const user = await this.createUser(dto);

            //Create linked staff record in DB
            const staff = this.staffRepo.create({
                user,
                staffID: dto.staffID                           
            } as Partial<FacultyStaff>);

        return await this.staffRepo.save(staff);        

        } catch (error) {
            this.logger.error('Error creating staff record', error);
            throw new BadRequestException(error.message || 'Failed to create staff record')            
        }
    }

    //Logic handling the creation of another admin
    async createAdmin (dto: CreateUserDto): Promise<User> {
        try {
           //Trim spaces in strings
            for (const key in dto) {
                if (typeof dto[key] === 'string') dto[key] = dto[key].trim();
            }

            //validate incoming DTO manually
            await this.validateDtoAdmin(dto, 1);

            const admin = await this.createUser(dto);

            return admin;

        } catch (error) {
            this.logger.error('Error creating admin record', error);
            throw new BadRequestException(error.message || 'Failed to create admin record')
        }
    }

    //------------GET REQUESTS----------//
    async getAllUsers() {
       return await this.userRepo.findAllUsers()
    }

    async getUserById(id: number) {
        return await this.userRepo.userWithDetails(id)
    }

    async searchUsers(searchTerm: string) {
        return await this.userRepo.findUsers(searchTerm)
    }

}