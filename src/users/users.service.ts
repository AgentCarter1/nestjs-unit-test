import { Injectable, BadRequestException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { User, UserDocument } from './schemas/users.schema';
import { CreateUserDto } from './dto/create-user.dto';

@Injectable()
export class UsersService {
  constructor(@InjectModel(User.name) private userModel: Model<UserDocument>) {}

  async create(createUserDto: CreateUserDto): Promise<User> {
    const { name, email, age } = createUserDto;

    if (age < 18) {
      throw new BadRequestException('User must be at least 18 years old.');
    }

    const existingUser = await this.userModel.findOne({ email }).exec();

    if (existingUser) {
      throw new BadRequestException('Email already exists.');
    }

    const createdUser = await this.userModel.create({ name, email, age });
    return createdUser;
  }

  async findAll(): Promise<User[]> {
    return this.userModel.find().exec();
  }

  async findOne(id: string): Promise<User> {
    return this.userModel.findById(id).exec();
  }

  async update(id: string, name: string, email: string): Promise<User> {
    return this.userModel
      .findByIdAndUpdate(id, { name, email }, { new: true })
      .exec();
  }

  async delete(id: string): Promise<User> {
    return this.userModel.findByIdAndDelete(id).exec();
  }
}
