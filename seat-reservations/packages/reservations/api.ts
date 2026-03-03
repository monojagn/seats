import { Effect, Layer, Schema } from "effect"
import { HttpApi, HttpApiBuilder, HttpApiEndpoint, HttpApiError, HttpApiGroup, HttpApiSchema, OpenApi } from "@effect/platform"
import { CreatePayload, Reservation, Reservations } from "./model.ts";

const HealthGroup = HttpApiGroup.make("Health", { topLevel: true })
    .add(
        HttpApiEndpoint.get("health")`/health`
            .addSuccess(Schema.Void)
    )

const IdParam = HttpApiSchema.param("id", Schema.String);

const TokenHeaders = Schema.Struct({ token: Schema.String })

const ReservationsGroup = HttpApiGroup.make("Reservations")
    .add(
        HttpApiEndpoint.get("info")`/${IdParam}`
            .setHeaders(TokenHeaders)
            .addSuccess(Reservation)
            .addError(HttpApiError.BadRequest)
    )
    .add(
        HttpApiEndpoint.post("create")`/`
            .setHeaders(TokenHeaders)
            .addSuccess(Reservation)
            .setPayload(CreatePayload)
            .addError(HttpApiError.BadRequest)
    )
    .add(
        HttpApiEndpoint.del("delete")`/${IdParam}`
            .setHeaders(TokenHeaders)
            .addSuccess(Schema.Void)
            .addError(HttpApiError.BadRequest)
    )
    .add(
        HttpApiEndpoint.get("all")`/`
            .setHeaders(TokenHeaders)
            .addSuccess(Reservations)
            .addError(HttpApiError.BadRequest)
            .setUrlParams(Schema.Struct({ 
                owner: Schema.String.pipe(Schema.optional),
            }))
    )
    .prefix("/reservations")

export const Api = HttpApi.make("Reservations")
    .add(HealthGroup)
    .add(ReservationsGroup)
    .annotate(OpenApi.Transform, spec => ({
        ...spec,
        info: {
            ...spec.info ?? {},
            title: "Reservations API"
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
const ReservationsGroupLive = HttpApiBuilder.group(
    Api,
    "Reservations",
    handlers =>
        handlers
            .handle("all", () => new HttpApiError.BadRequest())
            .handle("create", () => new HttpApiError.BadRequest())
            .handle("delete", () => new HttpApiError.BadRequest())
            .handle("info", () => new HttpApiError.BadRequest())
)

export const ApiLive = HttpApiBuilder.api(Api).pipe(
    Layer.provide(HealthGroupLive),
    Layer.provide(ReservationsGroupLive)
)