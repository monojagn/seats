import { Config, Effect, Schema, Data, Array } from "effect";
import { FileAdapter } from "./file.adapter.ts";
import { Path } from "@effect/platform";
import { RegisterPayload, UserJson, User } from "../model.ts";
import { randomUUID } from "node:crypto"


export class UserNotFoundError extends Data.TaggedError("UserNotFound")<{
    token: string
}> { }
export class UserRepo extends Effect.Service<UserRepo>()("UserRepo", {
    accessors: true,
    effect: Effect.gen(function* () {
        const file = yield* FileAdapter;
        const path = yield* Path.Path;
        const base = yield* Config.string("PERSISTANCE").pipe(
            Config.withDefault("./.persist")
        )

        const fullpath = path.join(base, "users.json");

        const readAll = Effect.gen(function* () {
            const data = yield* file.read(fullpath).pipe(
                Effect.catchAll(() => file.write(fullpath, "[]").pipe(
                    Effect.as("[]")
                ))
            );

            return yield* Schema.decode(UserJson)(data).pipe(Effect.orDie);
        })

        return {
            readByToken: Effect.fn(function* (token: string) {
                const decoded = yield* readAll

                return yield* Effect.fromNullable(decoded.find(user => user.token === token))


            }),
            readByUsername: Effect.fn(function* (username: string) {
                const decoded = yield* readAll

                return yield* Effect.fromNullable(decoded.find(user => user.username === username))
            }),
            create: Effect.fn(function* (data: typeof RegisterPayload.Type) {
                const id = randomUUID();
                const newUser = {
                    ...data,
                    token: id,
                }

                const previousUsers = yield* readAll

                const updatedUsers = [...previousUsers, newUser];

                const usersAsJson = yield* Schema.encode(UserJson)(updatedUsers).pipe(Effect.orDie);

                yield* file.write(fullpath, usersAsJson);

                return newUser
            }),

            update: Effect.fn(function* (token: string, user: typeof User.Type) {
                const users = yield* readAll
                const index = users.findIndex((user) => user.token === token)
                if (index == -1) {
                    return yield* new UserNotFoundError({ token })
                }
                const usersUpdated = [...users]
                usersUpdated[index] = user
                const usersDecoded = yield* Schema.encode(UserJson)(usersUpdated).pipe(Effect.orDie);
                yield* file.write(fullpath, usersDecoded);
            })
        }
    })
}) { }