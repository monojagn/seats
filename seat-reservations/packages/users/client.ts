import { FetchHttpClient, HttpApiClient } from "@effect/platform"
import { Api } from "./api.ts";
import { Effect } from "effect";

export const Client = (baseUrl?: string) => 
    HttpApiClient.make(Api, {
        baseUrl,
    }).pipe(Effect.provide(FetchHttpClient.layer))