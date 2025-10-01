// import { Body, Controller, Get, Param, Post } from '@nestjs/common';
// import { UserService } from './user.service';
// import { CreateStudentDto } from './DTO/create-student.dto';
// import { CreateFacultyDto } from './DTO/create-faculty-staff.dto';
// import { CreateUserDto } from './DTO/create-admin.dto';

// @Controller('user')
// export class UserController {
//     constructor(private readonly userService: UserService) {}

//   @Post('student')
//   async createStudent(@Body() dto: CreateStudentDto) {
//     return this.userService.CreateStudentDto(dto);
//   }

//   @Post('faculty')
//   async createFaculty(@Body() dto: CreateFacultyDto) {
//     return this.userService.create(dto);
//   }

//   @Post('admin')
//   async createAdmin(@Body() dto: CreateUserDto) {
//     return this.userService.create(dto);
//   }

//   @Get()
//   async findAll() {
//     return this.userService.findAll();
//   }

//   @Get(':id')
//   async findOne(@Param('id') id: string) {
//     return this.userService.findById(id);
//   }
// }
