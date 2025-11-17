import { PrismaService } from 'src/prisma/prisma.service';
import { UsersService } from './users.service';
import { HashingServiceProtocol } from 'src/auth/hash/hashing.service';
import { Test, TestingModule } from '@nestjs/testing';
import { CreateUserDto } from './dto/create-user.dto';
import { HttpException, HttpStatus } from '@nestjs/common';
import { UpdateUserDto } from './dto/update-user.dto';
import { PayloadTokenDto } from 'src/auth/dto/payload-token.dto';

jest.mock('node:fs/promises');

describe('UsersService', () => {
  let userService: UsersService;
  let prismaService: PrismaService;
  let hashingService: HashingServiceProtocol;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UsersService,
        {
          provide: PrismaService,
          useValue: {
            user: {
              create: jest.fn().mockResolvedValue({
                id: 1,
                name: 'Tiago Rocha Sarno',
                email: 'tiago@gmail.com',
              }),
              findFirst: jest.fn(),
              update: jest.fn(),
              delete: jest.fn(),
            },
          },
        },
        {
          provide: HashingServiceProtocol,
          useValue: {
            hash: jest.fn(),
          },
        },
      ],
    }).compile();

    userService = module.get<UsersService>(UsersService);
    prismaService = module.get<PrismaService>(PrismaService);
    hashingService = module.get<HashingServiceProtocol>(HashingServiceProtocol);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be define users service', () => {
    expect(userService).toBeDefined();
  });

  describe('User, Create', () => {
    it('should create a new user', async () => {
      // Arrange
      const createUserDto: CreateUserDto = {
        email: 'tiago@gmail.com',
        name: 'Tiago Rocha Sarno',
        passwordHash: '123456',
      };

      jest.spyOn(hashingService, 'hash').mockResolvedValue('HASH_MOCK_EXEMPLO');

      // Act e Asserts
      const result = await userService.store(createUserDto);

      expect(hashingService.hash).toHaveBeenCalled();
      expect(hashingService.hash).toHaveBeenCalledTimes(1);
      expect(prismaService.user.create).toHaveBeenCalledWith({
        data: {
          name: createUserDto.name,
          email: createUserDto.email,
          passwordHash: 'HASH_MOCK_EXEMPLO',
        },
        select: {
          id: true,
          name: true,
          email: true,
        },
      });
      expect(result).toEqual({
        id: 1,
        name: createUserDto.name,
        email: createUserDto.email,
      });
    });

    it('should throw error if prisma create fails', async () => {
      // Arrange
      const createUserDto: CreateUserDto = {
        email: 'tiago@gmail.com',
        name: 'Tiago Rocha Sarno',
        passwordHash: '123456',
      };

      jest.spyOn(hashingService, 'hash').mockResolvedValue('HASH_MOCK_EXEMPLO');
      jest
        .spyOn(prismaService.user, 'create')
        .mockRejectedValue(new Error('Database Error'));

      // Act
      await expect(userService.store(createUserDto)).rejects.toThrow(
        new HttpException('Store fail', HttpStatus.BAD_REQUEST),
      );

      // Asserts
      expect(hashingService.hash).toHaveBeenCalledWith(
        createUserDto.passwordHash,
      );
      expect(prismaService.user.create).toHaveBeenCalledWith({
        data: {
          name: createUserDto.name,
          email: createUserDto.email,
          passwordHash: 'HASH_MOCK_EXEMPLO',
        },
        select: {
          id: true,
          name: true,
          email: true,
        },
      });
    });
  });

  describe('User, FindOneByID', () => {
    it('should return a user when he`s find by ID', async () => {
      // Arrange
      const mockUser = {
        id: 1,
        name: 'Tiago Rocha Sarno',
        email: 'tiago@gmail.com',
        Task: [],
        passwordHash: 'mock_hash',
        active: true,
        createdAt: new Date(),
      };

      jest.spyOn(prismaService.user, 'findFirst').mockResolvedValue(mockUser);

      // Act
      const result = await userService.findOneById(1);

      //Asserts
      expect(prismaService.user.findFirst).toHaveBeenCalledWith({
        where: {
          id: 1,
        },
        select: {
          id: true,
          name: true,
          email: true,
          Task: true,
        },
      });
      expect(result).toEqual(mockUser);
    });

    it('should throw exception when user is not found by ID', async () => {
      // Arrange
      jest.spyOn(prismaService.user, 'findFirst').mockResolvedValue(null);

      // Act
      await expect(userService.findOneById(1)).rejects.toThrow(
        new HttpException('Registro não encontrado', HttpStatus.NOT_FOUND),
      );

      // Asserts
      expect(prismaService.user.findFirst).toHaveBeenCalledWith({
        where: {
          id: 1,
        },
        select: {
          id: true,
          name: true,
          email: true,
          Task: true,
        },
      });
    });
  });

  describe('User, Update', () => {
    it('should throw exception when user is not found', async () => {
      // Arrange
      const updateUserDto: UpdateUserDto = { name: 'Novo nome' };
      const tokenPayload: PayloadTokenDto = {
        sub: 1,
        aud: '',
        exp: 123,
        email: 'tiago@gmail.com',
        iat: 123,
        iss: '',
      };

      // User not found
      jest.spyOn(prismaService.user, 'findFirst').mockResolvedValue(null);

      // Act, Asserts
      await expect(
        userService.update(1, updateUserDto, tokenPayload),
      ).rejects.toThrow(
        new HttpException('Update fail', HttpStatus.BAD_REQUEST),
      );
    });
    it('should throw UNAUTHORIZED exception when user is not authorized to update', async () => {
      // Arrange
      const updateUserDto: UpdateUserDto = { name: 'Novo nome' };
      const tokenPayload: PayloadTokenDto = {
        sub: 5,
        aud: '',
        exp: 123,
        email: 'tiago@gmail.com',
        iat: 123,
        iss: '',
      };

      const mockUser = {
        id: 1,
        name: 'Tiago Rocha Sarno',
        email: 'tiago@gmail.com',
        Task: [],
        passwordHash: 'mock_hash',
        active: true,
        createdAt: new Date(),
      };

      // Find a user
      jest.spyOn(prismaService.user, 'findFirst').mockResolvedValue(mockUser);

      // Act, Asserts
      await expect(
        userService.update(1, updateUserDto, tokenPayload),
      ).rejects.toThrow(
        new HttpException('Update fail', HttpStatus.BAD_REQUEST),
      );
    });
    it('should user updated', async () => {
      // Arrange
      const updateUserDto: UpdateUserDto = {
        name: 'Novo nome',
        passwordHash: 'nova senha',
      };
      const tokenPayload: PayloadTokenDto = {
        sub: 1,
        aud: '',
        exp: 123,
        email: 'tiago@gmail.com',
        iat: 123,
        iss: '',
      };

      const mockUser = {
        id: 1,
        name: 'Tiago Rocha Sarno',
        email: 'tiago@gmail.com',
        passwordHash: 'mock_hash',
        active: true,
        createdAt: new Date(),
      };

      const updatedUser = {
        id: 1,
        name: 'Novo nome',
        email: 'tiago@gmail.com',
        passwordHash: 'novo_hash_exemplo',
        active: true,
        createdAt: new Date(),
      };

      // Act, Asserts
      jest.spyOn(prismaService.user, 'findFirst').mockResolvedValue(mockUser);
      jest.spyOn(hashingService, 'hash').mockResolvedValue('novo_hash_exemplo');
      jest.spyOn(prismaService.user, 'update').mockResolvedValue(updatedUser);

      const result = await userService.update(1, updateUserDto, tokenPayload);

      expect(hashingService.hash).toHaveBeenCalledWith(
        updateUserDto.passwordHash,
      );
      expect(prismaService.user.update).toHaveBeenCalledWith({
        where: {
          id: 1,
        },
        data: {
          name: updateUserDto.name,
          passwordHash: 'novo_hash_exemplo',
        },
        select: {
          id: true,
          name: true,
          email: true,
        },
      });
      expect(result).toEqual(updatedUser);
    });
  });

  describe('User, Delete', () => {
    it('should throw exception when user id not found', async () => {
      // Arrange
      const tokenPayload: PayloadTokenDto = {
        sub: 1,
        aud: '',
        exp: 123,
        email: 'tiago@gmail.com',
        iat: 123,
        iss: '',
      };

      jest.spyOn(prismaService.user, 'findFirst').mockResolvedValue(null);

      // Act, Asserts
      await expect(userService.delete(1, tokenPayload)).rejects.toThrow(
        new HttpException('Delete fail', HttpStatus.BAD_REQUEST),
      );
    });
    it('should throw UNAUTHORIZED when user is not authorized', async () => {
      // Arrange
      const tokenPayload: PayloadTokenDto = {
        sub: 5,
        aud: '',
        exp: 123,
        email: 'tiago@gmail.com',
        iat: 123,
        iss: '',
      };

      const mockUser = {
        id: 1,
        name: 'Tiago Rocha Sarno',
        email: 'tiago@gmail.com',
        passwordHash: 'mock_hash',
        active: true,
        createdAt: new Date(),
      };

      jest.spyOn(prismaService.user, 'findFirst').mockResolvedValue(mockUser);

      // Act, Asserts
      await expect(userService.delete(1, tokenPayload)).rejects.toThrow(
        new HttpException('Delete fail', HttpStatus.BAD_REQUEST),
      );
      expect(prismaService.user.delete).not.toHaveBeenCalled();
    });
    it('should delete user', async () => {
      // Arrange
      const tokenPayload: PayloadTokenDto = {
        sub: 1,
        aud: '',
        exp: 123,
        email: 'tiago@gmail.com',
        iat: 123,
        iss: '',
      };

      const mockUser = {
        id: 1,
        name: 'Tiago Rocha Sarno',
        email: 'tiago@gmail.com',
        passwordHash: 'mock_hash',
        active: true,
        createdAt: new Date(),
      };

      jest.spyOn(prismaService.user, 'findFirst').mockResolvedValue(mockUser);
      jest.spyOn(prismaService.user, 'delete').mockResolvedValue(mockUser);

      // Act, Asserts
      const result = await userService.delete(1, tokenPayload);
      expect(prismaService.user.delete).toHaveBeenCalledWith({
        where: {
          id: mockUser.id,
        },
      });
      expect(result).toEqual({
        message: true,
      });
    });
  });
});
