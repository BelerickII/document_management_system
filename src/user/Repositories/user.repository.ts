import { DataSource, Repository } from "typeorm";
import { User } from "../Entities/user.entity";
import { BadRequestException, Injectable } from "@nestjs/common";
import { CreateUserDto } from "../Dto/create-user.dto";
import * as bcrypt from 'bcrypt';

@Injectable()
export class userRepository extends Repository<User> {
    //Latest way of creating a repository in TypeORM version 0.3 upwards
    constructor(private dataSource: DataSource) {
        super(User, dataSource.createEntityManager());
    }

    //Section that populate the database with the rows from the CSV
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
}