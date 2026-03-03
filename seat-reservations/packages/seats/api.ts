import { Effect, Layer, Schema } from "effect"
import { HttpApi, HttpApiBuilder, HttpApiEndpoint, HttpApiError, HttpApiGroup, HttpApiSchema, OpenApi } from "@effect/platform"
import { CreatePayload, Seat, Seats, UpdatePayload } from "./model.ts";

const HealthGroup = HttpApiGroup.make("Health", { topLevel: true })
    .add(
        HttpApiEndpoint.get("health")`/health`
            .addSuccess(Schema.Void)
    )

const IdParam = HttpApiSchema.param("id", Schema.String);

const TokenHeaders = Schema.Struct({ token: Schema.String })

const SeatsGroup = HttpApiGroup.make("Seats")
    .add(
        HttpApiEndpoint.get("all")`/`
            .setHeaders(TokenHeaders)
            .addSuccess(Seats)
            .addError(HttpApiError.BadRequest)
            .setUrlParams(Schema.Struct({ 
                floor: Schema.NumberFromString.pipe(Schema.optional),
            }))
    )
    .add(
        HttpApiEndpoint.get("info")`/${IdParam}`
            .setHeaders(TokenHeaders)
            .addSuccess(Seat)
            .addError(HttpApiError.BadRequest)
    )
    .add(
        HttpApiEndpoint.post("create")`/`
            .setHeaders(TokenHeaders)
            .setPayload(CreatePayload)
            .addSuccess(Seat)
            .addError(HttpApiError.BadRequest)
    )
    .add(
        HttpApiEndpoint.put("update")`/${IdParam}`
            .setHeaders(TokenHeaders)
            .addSuccess(Seat)
            .addError(HttpApiError.BadRequest)
            .setPayload(UpdatePayload)
        )
    .add(
        HttpApiEndpoint.del("delete")`/${IdParam}`
            .setHeaders(TokenHeaders)
            .addError(HttpApiError.BadRequest)
            .addSuccess(Schema.Void)
    )
    .prefix("/seats")

export const Api = HttpApi.make("Seats")
    .add(HealthGroup)
    .add(SeatsGroup)
    .annotate(OpenApi.Transform, spec => ({
        ...spec,
        info: {
            ...spec.info ?? {},
            title: "Seats API"
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
const SeatsGroupLive = HttpApiBuilder.group(
    Api,
    "Seats",
    handlers =>
        handlers
            .handle("all", () => new HttpApiError.BadRequest())
            .handle("create", () => new HttpApiError.BadRequest())
            .handle("delete", () => new HttpApiError.BadRequest())
            .handle("info", () => new HttpApiError.BadRequest())
            .handle("update", () => new HttpApiError.BadRequest())
)

export const ApiLive = HttpApiBuilder.api(Api).pipe(
    Layer.provide(HealthGroupLive),
    Layer.provide(SeatsGroupLive),
)