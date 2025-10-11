import { DataSource, Repository } from "typeorm";
import { FacultyStaff } from "../Entities/faculty-staff.entity";
import { Injectable } from "@nestjs/common";

@Injectable()
export class staffRepository extends Repository<FacultyStaff> {
    constructor(private dataSource: DataSource) {
            super(FacultyStaff, dataSource.createEntityManager());
        }

}