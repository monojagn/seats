import { Schema } from "effect";

export const RegisterPayload = Schema.Struct({
    username: Schema.String,
    email: Schema.String,
    name: Schema.String,
})

export const LoginPayload = Schema.Struct({
    username: Schema.String
})

export class User extends Schema.Class<User>("User")({
    ...RegisterPayload.fields,
    token: Schema.String,
}){}

export const UserJson = Schema.parseJson(Schema.Array(User)).pipe(Schema.asSchema)