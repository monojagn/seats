import { FileSystem } from "@effect/platform";
import { Data, Effect, Layer, pipe } from "effect";

export class MissingFile
extends Data.TaggedError("MissingFile")<{ path: string }> {}

export interface FileAdapterShape {
    read: (path: string) => Effect.Effect<string, MissingFile>;
    write: (path: string, content: string) => Effect.Effect<void>;
}

export class FileAdapter extends Effect.Tag("FileAdapter")<
    FileAdapter,
    FileAdapterShape
>(){
    static Default = Layer.effect(FileAdapter, Effect.gen(function*(){
        const fs = yield* FileSystem.FileSystem;
        return {
            read: (path) => pipe(
                fs.readFileString(path),
                Effect.mapError(() => new MissingFile({ path }))
            ),
            write: Effect.fn(function*(path, content) {
                yield* fs.writeFileString(path, content)
            }, Effect.orDie),
        }
    }))
}