import { Effect } from "effect";
import { UserRepo } from "../adapters/user.repository.ts";
import { RegisterPayload, User } from "../model.ts";
import { randomUUID } from "node:crypto"

export class UsersService extends Effect.Service<UsersService>()("UsersService", {
    accessors: true,
    effect: Effect.gen(function* () {
        const repo = yield* UserRepo;
        return {
            login: Effect.fn(function* (username: string) {
                return yield* repo.readByUsername(username)
            }),
            verify: Effect.fn(function* (token: string) {
                return yield* repo.readByToken(token)
            }),
            register: Effect.fn(function* (payload: typeof RegisterPayload.Type) {
                return yield* repo.create(payload)
            }),
            info: Effect.fn(function* (token: string) {
                return yield* repo.readByToken(token)
            }),
            logout: Effect.fn(function* (token: string) {
                const user = yield* repo.readByToken(token)
                if (user) {
                    const id = randomUUID();
                    const newUser: User = {
                        ...user,
                        token: id
                    };
                    yield* repo.update(token, newUser)
                }
            })
        }
    })
}) { }
