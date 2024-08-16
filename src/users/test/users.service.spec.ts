import { Test, TestingModule } from '@nestjs/testing';
import { getModelToken } from '@nestjs/mongoose';
import { UsersService } from '../users.service';
import { User, UserDocument } from '../schemas/users.schema';
import { Model } from 'mongoose';
import { BadRequestException } from '@nestjs/common';
import { CreateUserDto } from '../dto/create-user.dto';

const mockUser = {
  name: 'John Doe',
  email: 'john.doe@example.com',
  age: 25,
};

const mockUserModel = {
  create: jest.fn().mockResolvedValue(mockUser),
  find: jest.fn(),
  findOne: jest.fn().mockReturnValue({
    exec: jest.fn().mockResolvedValue(null),
  }),
  findById: jest.fn(),
  findByIdAndUpdate: jest.fn().mockReturnThis(),
  findByIdAndDelete: jest.fn().mockReturnThis(),
  exec: jest.fn().mockResolvedValue(mockUser),
};

describe('UsersService', () => {
  let service: UsersService;
  let model: Model<UserDocument>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UsersService,
        {
          provide: getModelToken(User.name),
          useValue: mockUserModel,
        },
      ],
    }).compile();

    service = module.get<UsersService>(UsersService);
    model = module.get<Model<UserDocument>>(getModelToken(User.name));
  });

  it('should create a user if age is 18 or above and email is unique', async () => {
    jest.spyOn(mockUserModel, 'findOne').mockReturnValue({
      exec: jest.fn().mockResolvedValueOnce(null),
    });

    const createUserDto: CreateUserDto = {
      name: mockUser.name,
      email: mockUser.email,
      age: mockUser.age,
    };

    const user = await service.create(createUserDto);
    expect(user).toEqual(mockUser);
    expect(mockUserModel.create).toHaveBeenCalledWith({
      name: mockUser.name,
      email: mockUser.email,
      age: mockUser.age,
    });
  });

  it('should throw an error if age is below 18', async () => {
    const createUserDto: CreateUserDto = {
      name: mockUser.name,
      email: mockUser.email,
      age: 15,
    };

    await expect(service.create(createUserDto)).rejects.toThrow(
      new BadRequestException('User must be at least 18 years old.'),
    );
  });

  it('should throw an error if email already exists', async () => {
    jest.spyOn(mockUserModel, 'findOne').mockImplementation(({ email }) => {
      return {
        exec: jest
          .fn()
          .mockResolvedValueOnce(email === mockUser.email ? mockUser : null),
      };
    });

    const createUserDto: CreateUserDto = {
      name: mockUser.name,
      email: mockUser.email, // Yanlış email
      age: mockUser.age,
    };

    await expect(service.create(createUserDto)).rejects.toThrow(
      new BadRequestException('Email already exists.'),
    );
  });

  it('should return an array of users', async () => {
    jest.spyOn(model, 'find').mockReturnValue({
      exec: jest.fn().mockResolvedValueOnce([mockUser]),
    } as any);
    const users = await service.findAll();
    expect(users).toEqual([mockUser]);
  });

  it('should return a user by id', async () => {
    jest.spyOn(model, 'findById').mockReturnValue({
      exec: jest.fn().mockResolvedValueOnce(mockUser),
    } as any);
    const user = await service.findOne('someId');
    expect(user).toEqual(mockUser);
  });

  it('should update a user', async () => {
    const updatedUser = { ...mockUser, name: 'Jane Doe' };
    jest.spyOn(model, 'findByIdAndUpdate').mockReturnThis();
    jest.spyOn(mockUserModel, 'exec').mockResolvedValueOnce(updatedUser);
    const user = await service.update('someId', 'Jane Doe', mockUser.email);
    expect(user).toEqual(updatedUser);
  });

  it('should delete a user', async () => {
    jest.spyOn(model, 'findByIdAndDelete').mockReturnThis();
    jest.spyOn(mockUserModel, 'exec').mockResolvedValueOnce(mockUser);
    const user = await service.delete('someId');
    expect(user).toEqual(mockUser);
  });
});
