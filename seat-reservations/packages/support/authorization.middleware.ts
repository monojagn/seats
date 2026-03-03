import { HttpApiMiddleware, HttpApiSchema, HttpApiSecurity } from "@effect/platform"
import { Config, Context, Effect, Layer, Redacted, Schema } from "effect"
import type { User } from "../users/model.ts"
import { Client } from "../users/client.ts"

class Unauthorized extends Schema.TaggedError<Unauthorized>()(
  "Unauthorized",
  {},
  HttpApiSchema.annotations({ status: 401 })
) {}

export class CurrentUser extends Context.Tag("CurrentUser")<CurrentUser, User>() {}

export class Authorization extends HttpApiMiddleware.Tag<Authorization>()(
  "Authorization",
  {
    failure: Unauthorized,
    provides: CurrentUser,
    security: {
      bearerToken: HttpApiSecurity.bearer
    }
  }
) {
  static CurrentUser = CurrentUser;
}

export const AuthorizationLive = Layer.effect(
  Authorization,
  Effect.gen(function* () {
    return {
      bearerToken: (bearerToken) =>
        Effect.gen(function* () {
          const usersBaseUrl = yield* Config.string("USERS_URL").pipe(Effect.orDie)

          const client = yield* Client(usersBaseUrl);
          
          return yield* client.Users.info({ 
              headers: { 
                  token: `Bearer ${Redacted.value(bearerToken)}`
              }
          }).pipe(Effect.mapError(() => new Unauthorized))
        })
    }
  })
)