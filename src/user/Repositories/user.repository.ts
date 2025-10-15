import { DataSource, Repository } from "typeorm";
import { User, UserRole } from '../Entities/user.entity';
import { BadRequestException, Injectable, NotFoundException } from "@nestjs/common";
import * as bcrypt from 'bcrypt';

import { CreateUserDto } from "../Dto/create-user.dto";

@Injectable()
export class userRepository extends Repository<User> {
    //Latest way of creating a repository in TypeORM version 0.3 upwards
    constructor(private dataSource: DataSource) {
        super(User, dataSource.createEntityManager());
    }

    //Logic handling the creation of a user; then used to populate related table according to user roles
    async createUser(dto: CreateUserDto): Promise<User> {
        const email = dto.email.toLowerCase();        

        //Check for existing user by email
        const existing = await this.findOne({
            where: [{ email }],
        });

        if (existing) {
            throw new BadRequestException(`User with email "${email}" already exists`);
        }

        //Determine initial password
        const plainPassword = dto.password
        const hashedPassword = await bcrypt.hash(plainPassword, 10);

        //Create User Record in DB
        const user = this.create({
            email,
            firstName: dto.firstName,
            lastName: dto.lastName,
            role: dto.role,            
            password: hashedPassword,
            mustResetPassword: true,
            isActive: true,            
        } as Partial<User>);

        const savedUser = await this.save(user);

        return savedUser;
    }

    //Logic to fetch all users in the system
    async findAllUsers(page = 1, limit =50): Promise<{ data: Partial<User>[]; total: number }> {
        /* Basically I turned 'isNaN' => 'is not a number?' to 'is a number?' with '!isNaN'. So, this line
        is asking, is 'page' a number? if yes, is it > 0 if true then assign 'parsedPage/..Limit' the number
        page/limit holds. If false, assign the default i specify after the "?" */
        const parsedPage = !isNaN(page) && page > 0 ? page: 1;
        const parsedLimit = !isNaN(limit) && limit > 0 ? limit: 50;

        const [users, total] = await this.createQueryBuilder('user')
            .select([                
                'user.id',
                'user.firstName',
                'user.lastName',
                'user.email',
                'user.isActive',
                'user.role',
                // 'user.createdAt'
            ]).skip((parsedPage - 1) * parsedLimit)
            .take(parsedLimit)
            .getManyAndCount();

        return { data: users, total };
    }

    //Logic to get the full details of a user (student|staff)
    async userWithDetails(id: number): Promise<User> {
        const user = await this.createQueryBuilder('user')
            .leftJoinAndSelect('user.student', 'student')
            .leftJoinAndSelect('user.staff', 'staff')
            .where('user.id = :id', {id})
            .getOne();

        if (!user) {
            throw new NotFoundException(`User with ID ${id} not found.`);
        }

        return user;
    }

    //The search logic that handles search queries with email, matric no and staffId
    async findUsers (searchTerm: string): Promise<User[]> {
        if(!searchTerm) {
            return [];
        }

        /*Storing the parameter 'searchTerm' along side a '%' wildcard tell the
        DB to perform partial matches search of the supplied argument*/
        const likeSearchTerm = `%${searchTerm}%`;        

        /*ILIKE is an operator in PostgreSQL that performs a case-insensitive search.
        Good for better user experience than the case sensitive search*/
        return this.createQueryBuilder('user')
            .leftJoinAndSelect('user.student', 'student')
            .leftJoinAndSelect('user.staff', 'staff')
            .where('user.email ILIKE :likeSearchTerm', {likeSearchTerm})
            .orWhere('student.matric_no ILIKE :likeSearchTerm', {likeSearchTerm})
            .orWhere('staff.staffID ILIKE :likeSearchTerm', {likeSearchTerm})
            .getMany();
    }

    async findByRole(role: UserRole) {
        return this.find({
            where: {role},
            relations: ['student', 'staff'],
        });
    }
}