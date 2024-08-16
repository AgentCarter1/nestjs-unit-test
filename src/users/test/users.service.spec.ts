import { Test, TestingModule } from '@nestjs/testing';
import { getModelToken } from '@nestjs/mongoose';
import { UsersService } from '../users.service';
import { User, UserDocument } from '../schemas/users.schema';
import { Model } from 'mongoose';

const mockUser = {
  name: 'John Doe',
  email: 'john.doe@example.com',
};

const mockUserModel = {
  create: jest.fn().mockResolvedValue(mockUser),
  find: jest.fn(),
  findOne: jest.fn(),
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

  it('should create a user', async () => {
    const user = await service.create(mockUser.name, mockUser.email);
    expect(user).toEqual(mockUser);
    expect(mockUserModel.create).toHaveBeenCalledWith({
      name: mockUser.name,
      email: mockUser.email,
    });
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
