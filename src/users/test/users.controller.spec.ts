import { Test, TestingModule } from '@nestjs/testing';
import { UsersController } from '../users.controller';
import { UsersService } from '../users.service';
import { getModelToken } from '@nestjs/mongoose';
import { User } from '../schemas/users.schema';
import { BadRequestException } from '@nestjs/common';
import { CreateUserDto } from '../dto/create-user.dto';

const mockUser = {
  name: 'John Doe',
  email: 'john.doe@example.com',
  age: 25,
};

describe('UsersController', () => {
  let controller: UsersController;
  let service: UsersService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [UsersController],
      providers: [
        UsersService,
        {
          provide: getModelToken(User.name),
          useValue: {},
        },
      ],
    }).compile();

    controller = module.get<UsersController>(UsersController);
    service = module.get<UsersService>(UsersService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('create', () => {
    it('should create a user', async () => {
      jest.spyOn(service, 'create').mockResolvedValue(mockUser);

      const createUserDto: CreateUserDto = {
        name: mockUser.name,
        email: mockUser.email,
        age: mockUser.age,
      };

      const result = await controller.create(createUserDto);

      expect(result).toEqual(mockUser);
      expect(service.create).toHaveBeenCalledWith(createUserDto);
    });

    it('should throw an error if age is below 18', async () => {
      jest
        .spyOn(service, 'create')
        .mockRejectedValue(
          new BadRequestException('User must be at least 18 years old.'),
        );

      const createUserDto: CreateUserDto = {
        name: mockUser.name,
        email: mockUser.email,
        age: 17,
      };

      await expect(controller.create(createUserDto)).rejects.toThrow(
        new BadRequestException('User must be at least 18 years old.'),
      );
    });

    it('should throw an error if email already exists', async () => {
      jest
        .spyOn(service, 'create')
        .mockRejectedValue(new BadRequestException('Email already exists.'));

      const createUserDto: CreateUserDto = {
        name: mockUser.name,
        email: mockUser.email,
        age: mockUser.age,
      };

      await expect(controller.create(createUserDto)).rejects.toThrow(
        new BadRequestException('Email already exists.'),
      );
    });

    it('should throw an error if required fields are missing', async () => {
      jest
        .spyOn(service, 'create')
        .mockRejectedValue(
          new BadRequestException('Name, email, and age are required.'),
        );

      const missingNameDto = {
        email: mockUser.email,
        age: mockUser.age,
      } as CreateUserDto;
      await expect(controller.create(missingNameDto)).rejects.toThrow(
        BadRequestException,
      );

      const missingEmailDto = {
        name: mockUser.name,
        age: mockUser.age,
      } as CreateUserDto;
      await expect(controller.create(missingEmailDto)).rejects.toThrow(
        BadRequestException,
      );

      const missingAgeDto = {
        name: mockUser.name,
        email: mockUser.email,
      } as CreateUserDto;
      await expect(controller.create(missingAgeDto)).rejects.toThrow(
        BadRequestException,
      );
    });
  });

  describe('findAll', () => {
    it('should return an array of users', async () => {
      jest.spyOn(service, 'findAll').mockResolvedValue([mockUser]);

      const result = await controller.findAll();

      expect(result).toEqual([mockUser]);
      expect(service.findAll).toHaveBeenCalled();
    });
  });

  describe('findOne', () => {
    it('should return a user by id', async () => {
      jest.spyOn(service, 'findOne').mockResolvedValue(mockUser);

      const result = await controller.findOne('someId');

      expect(result).toEqual(mockUser);
      expect(service.findOne).toHaveBeenCalledWith('someId');
    });
  });

  describe('update', () => {
    it('should update a user', async () => {
      const updatedUser = { ...mockUser, name: 'Jane Doe' };
      jest.spyOn(service, 'update').mockResolvedValue(updatedUser);

      const result = await controller.update(
        'someId',
        'Jane Doe',
        mockUser.email,
      );

      expect(result).toEqual(updatedUser);
      expect(service.update).toHaveBeenCalledWith(
        'someId',
        'Jane Doe',
        mockUser.email,
      );
    });
  });

  describe('delete', () => {
    it('should delete a user', async () => {
      jest.spyOn(service, 'delete').mockResolvedValue(mockUser);

      const result = await controller.delete('someId');

      expect(result).toEqual(mockUser);
      expect(service.delete).toHaveBeenCalledWith('someId');
    });
  });
});
