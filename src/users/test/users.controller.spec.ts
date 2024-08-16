import { Test, TestingModule } from '@nestjs/testing';
import { UsersController } from '../users.controller';
import { UsersService } from '../users.service';
import { getModelToken } from '@nestjs/mongoose';
import { User } from '../schemas/users.schema';

const mockUser = {
  name: 'John Doe',
  email: 'john.doe@example.com',
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

      const result = await controller.create(mockUser.name, mockUser.email);

      expect(result).toEqual(mockUser);
      expect(service.create).toHaveBeenCalledWith(
        mockUser.name,
        mockUser.email,
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
