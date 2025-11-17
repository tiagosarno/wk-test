import { PayloadTokenDto } from 'src/auth/dto/payload-token.dto';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { UsersController } from './users.controller';

describe('Users Controller', () => {
  let controller: UsersController;
  const usersServiceMock = {
    findOneById: jest.fn(),
    store: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
  };

  beforeEach(() => {
    controller = new UsersController(usersServiceMock as any);
  });

  it('should find one user', async () => {
    // Arrange
    const userId = 1;

    // Act, Asserts
    await controller.findOneById(userId);
    expect(usersServiceMock.findOneById).toHaveBeenCalledWith(userId);
  });
  it('should create a new user', async () => {
    // Arrange
    const createUserDto: CreateUserDto = {
      name: 'Tiago Rocha Sarno',
      email: 'tiago@gmail.com',
      passwordHash: '123456',
    };

    const mockUser = {
      id: 1,
      name: 'Tiago Rocha Sarno',
      email: 'tiago@gmail.com',
    };

    usersServiceMock.store.mockResolvedValue(mockUser);

    // Act, Asserts
    const result = await controller.create(createUserDto);

    expect(usersServiceMock.store).toHaveBeenCalledWith(createUserDto);
    expect(result).toEqual(mockUser);
  });
  it('should update user', async () => {
    // Arrange
    const userId = 1;
    const updateUserDto: UpdateUserDto = {
      name: 'Tiago Rocha Sarno Novo',
    };
    const updatedUser = {
      id: userId,
      name: 'Tiago Rocha Sarno Novo',
      email: 'tiago@gmail.com',
    };
    const tokenPayload: PayloadTokenDto = {
      sub: userId,
      aud: '',
      email: '',
      exp: 1,
      iat: 1,
      iss: '',
    };

    usersServiceMock.update.mockResolvedValue(updatedUser);

    // Act, Asserts
    const result = await controller.update(userId, updatedUser, tokenPayload);

    expect(usersServiceMock.update).toHaveBeenCalledWith(
      userId,
      updatedUser,
      tokenPayload,
    );
    expect(result).toEqual(updatedUser);
  });
  it('should delete user', async () => {
    // Arrange
    const userId = 1;

    const tokenPayload: PayloadTokenDto = {
      sub: userId,
      aud: '',
      email: '',
      exp: 1,
      iat: 1,
      iss: '',
    };

    // Act, Asserts
    await controller.delete(userId, tokenPayload);
    expect(usersServiceMock.delete).toHaveBeenCalledWith(userId, tokenPayload);
  });
});
