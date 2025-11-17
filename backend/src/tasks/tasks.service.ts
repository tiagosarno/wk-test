import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { CreateTaskDto } from './dto/create-task.dto';
import { UpdateTaskDto } from './dto/update-task.dto';
import { PrismaService } from '../prisma/prisma.service';
import { PaginationDto } from 'src/common/dto/pagination.dto';
import { PayloadTokenDto } from 'src/auth/dto/payload-token.dto';
import { ResponseTaskDto } from './dto/response-task.dto';

@Injectable()
export class TasksService {
  constructor(private prisma: PrismaService) {}

  async findAll(
    tokenPayload: PayloadTokenDto,
    paginationDto?: PaginationDto,
  ): Promise<ResponseTaskDto[]> {
    const { limit = 10, offset = 0 } = paginationDto;

    const allTasks = await this.prisma.task.findMany({
      where: {
        userId: tokenPayload.sub,
      },
      take: limit,
      skip: offset,
      orderBy: {
        createdAt: 'asc',
      },
    });
    return allTasks;
  }

  async findOneById(id: number): Promise<ResponseTaskDto> {
    const task = await this.prisma.task.findFirst({
      where: {
        id: id,
      },
    });

    if (task?.name) return task;

    throw new HttpException('Registro não encontrado', HttpStatus.NOT_FOUND);
  }

  async filterByCompleted(
    tokenPayload: PayloadTokenDto,
    completed: number,
  ): Promise<ResponseTaskDto[]> {
    const tasks = await this.prisma.task.findMany({
      where: {
        userId: tokenPayload.sub,
        completed: completed === 1,
      },
    });
    return tasks;
  }

  async store(
    body: CreateTaskDto,
    tokenPayload: PayloadTokenDto,
  ): Promise<ResponseTaskDto> {
    try {
      const newTask = await this.prisma.task.create({
        data: {
          name: body.name,
          description: body.description,
          completed: false,
          userId: tokenPayload.sub,
        },
      });
      return newTask;
    } catch (err) {
      // console.log(err);
      throw new HttpException('Store fail', HttpStatus.BAD_REQUEST);
    }
  }

  async update(
    id: number,
    body: UpdateTaskDto,
    tokenPayload: PayloadTokenDto,
  ): Promise<ResponseTaskDto> {
    try {
      const findTask = await this.prisma.task.findFirst({
        where: {
          id: id,
        },
      });

      if (!findTask) {
        throw new HttpException(
          'Registro não encontrado',
          HttpStatus.NOT_FOUND,
        );
      }

      if (findTask.userId !== tokenPayload.sub) {
        throw new HttpException('Ação não permitida', HttpStatus.UNAUTHORIZED);
      }

      const task = await this.prisma.task.update({
        where: {
          id: findTask.id,
        },
        data: {
          name: body.name ? body.name : findTask.name,
          description: body.description
            ? body.description
            : findTask.description,
          completed:
            body.completed !== undefined ? body.completed : findTask.completed,
        },
      });

      return task;
    } catch (err) {
      // console.log(err);
      throw new HttpException('Update fail', HttpStatus.BAD_REQUEST);
    }
  }

  async delete(id: number, tokenPayload: PayloadTokenDto) {
    try {
      const findTask = await this.prisma.task.findFirst({
        where: {
          id: id,
        },
      });

      if (!findTask) {
        throw new HttpException(
          'Registro não encontrado',
          HttpStatus.NOT_FOUND,
        );
      }

      if (findTask.userId !== tokenPayload.sub) {
        throw new HttpException('Ação não permitida', HttpStatus.UNAUTHORIZED);
      }

      await this.prisma.task.delete({
        where: {
          id: findTask.id,
        },
      });
      return {
        message: true,
      };
    } catch (err) {
      // console.log(err);
      throw new HttpException('Delete fail', HttpStatus.BAD_REQUEST);
    }
  }
}
