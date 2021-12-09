import { Test } from '@nestjs/testing';
import { AuthService } from './auth.service';
import { User } from './user.entity';
import { UsersService } from './users.service';

describe('AuthService', () => {
    let service: AuthService;
    let fakeUsersService: Partial<UsersService>;
    const users: User[] = [];

    beforeEach(async () => {
        // create a fake copy of UsersService
        fakeUsersService = {
            find: (email: string) => {
                const filteredUsers = users.filter(user => user.email === email);
                return Promise.resolve(filteredUsers);
            },
            create: (email: string, password: string) => {
                const user = { id: Math.floor(Math.random() * 999999), email, password } as User;
                users.push(user);
                return Promise.resolve(user);
            },
        }
    
        const module = await Test.createTestingModule({
            providers: [
                AuthService,
                {
                    provide: UsersService,
                    useValue: fakeUsersService
                }
            ],
        }).compile();
    
        service = module.get(AuthService);
    })
    
    it('can create an instance of AuthService', async () => {
        expect(service).toBeDefined();
    });

    it('create an user with salted and hased password', async () => {
        const user = await service.signup('asdf@asdf.com', 'asdf');

        expect(user.password).not.toEqual('asdf');
        const [salt, hash] = user.password.split('.');
        expect(salt).toBeDefined();
        expect(hash).toBeDefined();
    });

    it('throw an error if sign up with an email that is in use', (done) => {
        (async () => {
            // fakeUsersService.find = () => Promise.resolve([{ id: 1, email: 'a', password: 'a' } as User]);
            await service.signup('email1@asdf.com', 'password');
            try {
                await service.signup('email1@asdf.com', 'asdf');
            } catch (err) {
                done();
            }
        })();
    })

    it('throws if sign in with unuse email', (done) => {
        (async () => {
            try {
                await service.signin('email2@asd.com', 'asdf')
            } catch (err) {
                done();
            }
        })();
    })

    it('throw if an invalid password provided', (done) => {
        (async () => {
            // fakeUsersService.find = () => Promise.resolve([{ id: 1, email: 'a', password: 'a' } as User]);
            await service.signup('email3@asdf.com', 'asdf123');
            try {
                await service.signin('email3@asdf.com', 'asdf');
            } catch (err) {
                done();
            }
        })();
    })

    it('returns user if correct password is provied', async () => {
        await service.signup('new@asdf.com', 'mypassword');
        const user = await service.signin('new@asdf.com', 'mypassword');
        expect(user).toBeDefined();
    })
})
