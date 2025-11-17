import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseIntPipe,
  Patch,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import { TasksService } from './tasks.service';
import { CreateTaskDto } from './dto/create-task.dto';
import { UpdateTaskDto } from './dto/update-task.dto';
import { PaginationDto } from 'src/common/dto/pagination.dto';
import { AuthTokenGuard } from 'src/auth/guard/auth-token.guard';
import { TokenPayloadParam } from 'src/auth/param/token-payload.param';
import { PayloadTokenDto } from 'src/auth/dto/payload-token.dto';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiParam,
  ApiQuery,
} from '@nestjs/swagger';

@Controller('tasks')
export class TasksController {
  constructor(private readonly taskService: TasksService) {}

  @Get()
  @UseGuards(AuthTokenGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Listar todas as tarefas' })
  @ApiQuery({
    name: 'limit',
    required: false,
    example: 10,
    description: 'Limite de tarefas a serem buscadas',
  })
  @ApiQuery({
    name: 'offset',
    required: false,
    example: 0,
    description: 'Qtde. de itens que deseja pular',
  })
  findAll(
    @Query() paginationDto: PaginationDto,
    @TokenPayloadParam() tokenPayload: PayloadTokenDto,
  ) {
    // console.log(paginationDto);
    return this.taskService.findAll(tokenPayload, paginationDto);
  }

  @Get(':id')
  @UseGuards(AuthTokenGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Listar detalhes de uma tarefa' })
  @ApiParam({
    name: 'id',
    description: 'ID da tarefa',
    example: 1,
  })
  findOneById(@Param('id', ParseIntPipe) id: number) {
    return this.taskService.findOneById(id);
  }

  @Get('/filter/:completed')
  @UseGuards(AuthTokenGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Filtrar tarefas' })
  @ApiParam({
    name: 'completed',
    description: 'Status da tarefa',
    example: 1,
  })
  filterByCompleted(
    @TokenPayloadParam() tokenPayload: PayloadTokenDto,
    @Param('completed', ParseIntPipe) completed: number,
  ) {
    return this.taskService.filterByCompleted(tokenPayload, completed);
  }

  @Post()
  @UseGuards(AuthTokenGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Criar uma tarefa' })
  create(
    @Body() body: CreateTaskDto,
    @TokenPayloadParam() tokenPayload: PayloadTokenDto,
  ) {
    return this.taskService.store(body, tokenPayload);
  }

  @Patch(':id')
  @UseGuards(AuthTokenGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Atualizar os dados de uma tarefa' })
  @ApiParam({
    name: 'id',
    description: 'ID da tarefa',
    example: 1,
  })
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() body: UpdateTaskDto,
    @TokenPayloadParam() tokenPayload: PayloadTokenDto,
  ) {
    return this.taskService.update(id, body, tokenPayload);
  }

  @Delete(':id')
  @UseGuards(AuthTokenGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Deletar uma tarefa' })
  delete(
    @Param('id', ParseIntPipe) id: number,
    @TokenPayloadParam() tokenPayload: PayloadTokenDto,
  ) {
    return this.taskService.delete(id, tokenPayload);
  }
}
