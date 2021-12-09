import { Test, TestingModule } from '@nestjs/testing';
import { UsersController } from './users.controller';
import { UsersService } from './users.service';
import { AuthService } from './auth.service';
import { User } from './user.entity';

describe('UsersController', () => {
  let controller: UsersController;
  let fakeUsersService: Partial<UsersService>;
  let fakeAuthService: Partial<AuthService>;

  beforeEach(async () => {
    fakeUsersService = {
      findOne: (id: number) => {
        return Promise.resolve({ id, email: 'asdf@asdf.com', password: 'mypassword' } as User)
      },
      find: (email: string) => {
        return Promise.resolve([{ id: 1,  email, password: 'asdfasdf' } as User])
      },
      // remove: () => {},
      // update: () => {},
    };
    fakeAuthService = {
      // signup: () => {},
      signin: (email: string, password: string) => {
        return Promise.resolve({ id: 1, email, password } as User);
      },
    };
    const module: TestingModule = await Test.createTestingModule({
      controllers: [UsersController],
      providers: [
        {
          provide: UsersService,
          useValue: fakeUsersService
        },
        {
          provide: AuthService,
          useValue: fakeAuthService
        }
      ]
    }).compile();

    controller = module.get<UsersController>(UsersController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  it('findAllUsers returns a list of users with a given email', async () => {
    const users = await controller.findAllUsers('abc@email.com');
    expect(users.length).toEqual(1);
    expect(users[0].email).toEqual('abc@email.com')
  })

  it('findUser returns a single user with a given id', async () => {
    const user = await controller.findUser('1');
    expect(user).toBeDefined();
    expect(user.id).toEqual(1);
  })

  it('findUser throws an error', (done) => {
    (async () => {
      fakeUsersService.findOne = () => null;
      try {
        await controller.findUser('1');
      } catch (err) {
        done()
      }
    })();
  })

  it('signIn update session object and return user', async () => {
    const session = { userId: -10 };
    const user = await controller.signin({ email: 'emailx@email.com', password: 'mypassword' }, session)
    expect(user.id).toEqual(1);
    expect(session.userId).toEqual(1);
  })
});
