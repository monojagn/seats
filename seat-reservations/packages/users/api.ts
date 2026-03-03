import { Effect, Layer, Schema } from "effect"
import { HttpApi, HttpApiBuilder, HttpApiEndpoint, HttpApiError, HttpApiGroup, OpenApi } from "@effect/platform"
import { LoginPayload, RegisterPayload, User } from "./model.ts";
import { UsersService } from "./services/user.service.ts";

const HealthGroup = HttpApiGroup.make("Health", { topLevel: true })
    .add(
        HttpApiEndpoint.get("health")`/health`
            .addSuccess(Schema.Void)
    )

const UsersGroup = HttpApiGroup.make("Users")
    .add(
        HttpApiEndpoint.get("verify")`/`
            .setHeaders(Schema.Struct({ token: Schema.String }))
            .addSuccess(Schema.Void)
            .addError(HttpApiError.NotFound)
    )
    .add(
        HttpApiEndpoint.post("register")`/`
            .setPayload(RegisterPayload)
            .addSuccess(User)
            .addError(HttpApiError.BadRequest)
    )
    .add(
        HttpApiEndpoint.post("login")`/login`
            .setPayload(LoginPayload)
            .addSuccess(User)
            .addError(HttpApiError.BadRequest)
    )
    .add(
        HttpApiEndpoint.get("info")`/info`
            .setHeaders(Schema.Struct({ token: Schema.String }))
            .addSuccess(User)
            .addError(HttpApiError.NotFound)
    )
    .add(
        HttpApiEndpoint.get("logout")`/logout`
            .setHeaders(Schema.Struct({ token: Schema.String }))
            .addSuccess(Schema.Void)

    )
    .prefix("/users")

export const Api = HttpApi.make("Users")
    .add(HealthGroup)
    .add(UsersGroup)
    .annotate(OpenApi.Transform, spec => ({
        ...spec,
        info: {
            ...spec.info ?? {},
            title: "Users API"
        }
    }))

const HealthGroupLive = HttpApiBuilder.group(
    Api,
    "Health",
    handlers =>
        handlers.handle("health", () => Effect.void)
)

/**
 * TODO: Fill in the implementation
 */
const UsersGroupLive = HttpApiBuilder.group(
    Api,
    "Users",
    handlers =>
        handlers
            .handle("info", ({ headers: {token}}) => UsersService.verify(token).pipe(
                Effect.catchTag("NoSuchElementException", () => new HttpApiError.NotFound())
            ))
            .handle("login", Effect.fnUntraced(function*({ payload: { username }}){
                return yield* UsersService.login(username).pipe(
                    Effect.catchTag("NoSuchElementException", () => new HttpApiError.BadRequest)
                )
            }))
            .handle("logout", Effect.fnUntraced(function*({headers: {token}}){
                yield* UsersService.logout(token).pipe(
                    Effect.ignoreLogged
                )
            }))        
            .handle("register", ({payload}) => UsersService.register(payload))
            .handle("verify", Effect.fnUntraced(function*({ headers: {token}}){
                 yield* UsersService.verify(token).pipe(
                    Effect.catchTag("NoSuchElementException", () => new HttpApiError.NotFound())
                )
            }))
)

export const ApiLive = HttpApiBuilder.api(Api).pipe(
    Layer.provide(HealthGroupLive),
    Layer.provide(UsersGroupLive),
)