import { Effect, Layer } from "effect"
import { ServerLive } from "./server.ts"
import { NodeContext, NodeRuntime } from "@effect/platform-node"
import { UsersService } from "./services/user.service.ts"
import { UserRepo } from "./adapters/user.repository.ts"
import { FileAdapter } from "./adapters/file.adapter.ts"

const program = Layer.launch(ServerLive).pipe(
    Effect.provide(UsersService.Default),
    Effect.provide(UserRepo.Default),
    Effect.provide(FileAdapter.Default)
)

NodeRuntime.runMain(
    program.pipe(Effect.provide(NodeContext.layer))
)