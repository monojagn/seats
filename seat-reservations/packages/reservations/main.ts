import { Effect, Layer } from "effect"
import { ServerLive } from "./server.ts"
import { NodeContext, NodeRuntime } from "@effect/platform-node"

const program = Layer.launch(ServerLive)

NodeRuntime.runMain(
    program.pipe(Effect.provide(NodeContext.layer))
)