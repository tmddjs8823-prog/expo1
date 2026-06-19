import { Body, Controller, Delete, Get, Param, ParseIntPipe, Patch, Post, Query } from '@nestjs/common';
import { CreateProgramDto, UpdateProgramDto } from './dto/program.dto';
import { ProgramService } from './program.service';
import { Auth } from '../auth/auth.decorator';

@Controller('program')
export class ProgramController {
    constructor(private readonly programService : ProgramService) {}

    @Post()
    @Auth('ADMIN')
    create(@Body() dto : CreateProgramDto) {
        return this.programService.create(dto);
    }

    @Get()
    findAll(@Query('all') all?: string) {
        return this.programService.findAll(all === 'true');
    }

    @Get(':id')
    findOne(@Param('id', ParseIntPipe) id : number) {
        return this.programService.findOne(id);
    }

    @Patch(':id')
    @Auth('ADMIN')
    update(@Param('id', ParseIntPipe) id : number, @Body() dto : UpdateProgramDto) {
        return this.programService.update(id, dto);
    }

    @Delete(':id')
    @Auth('ADMIN')
    remove(@Param('id', ParseIntPipe) id : number) {
        return this.programService.remove(id);
    }
}
