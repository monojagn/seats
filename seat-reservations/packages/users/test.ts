import { Effect } from "effect";
import { Client } from "./client.ts";


Effect.gen(function*(){
    const client = yield* Client("http://localhost:3002")
    const user = yield* client.Users.login( {payload: {username: "Lili" }})
    yield* client.Users.logout({headers : {token: user.token}})
}).pipe(Effect.runPromise)