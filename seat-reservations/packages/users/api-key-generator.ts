import { Context, Effect, Layer } from "effect"

//************************* Interfaz ********************************
interface ApiKeyInterface {
  getApiKey: () => Effect.Effect<string>
}

Effect.gen(function* () {
  yield* Effect.log(" Se define la INTERFAZ para decir qué métodos hay")  
  yield* Effect.log("   ApiKeyInterface tiene: getApiKey()\n")
}).pipe(Effect.runPromise)



//************************* Servicio ********************************
const ApiKeyService = Context.GenericTag<ApiKeyInterface>("ApiKeyService")

Effect.gen(function* () {
  yield* Effect.log(" Definimos un SERVICIO (Tag) para poder pedir los métodos de la interfaz")
  yield* Effect.log("   ApiKeyService es el Tag que usaremos con yield*\n")
}).pipe(Effect.runPromise)

//************************* Implementación ********************************
const ApiKeyDevImpl: ApiKeyInterface = {
  getApiKey: () => Effect.gen(function* () {
    const key = Math.random().toString().slice(2, 18).padEnd(16, "0")
    yield* Effect.log(`  DEV: Generando key random: ${key}`)
    return key
  })
}


Effect.gen(function* () {
  yield* Effect.log(" Creamos IMPLEMENTACIONES concretas de la interfaz")
  yield* Effect.log("    ApiKeyDevImpl (genera keys random)")
  yield* Effect.log("    ApiKeyProdImpl (obtiene key del servidor)\n")
}).pipe(Effect.runPromise)


//************************* Capa ********************************
const LayerDev = Layer.succeed(ApiKeyService, ApiKeyDevImpl)


Effect.gen(function* () {
  yield* Effect.log(" En la LAYER conectamos el servicio con su implementación")
  yield* Effect.log("    LayerDev conecta ApiKeyService ← ApiKeyDevImpl")
  yield* Effect.log("    LayerProd conecta ApiKeyService ← ApiKeyProdImpl\n")
}).pipe(Effect.runPromise)

//************************* Implementación ********************************
const program = Effect.gen(function* () {
  const keySvc = yield* ApiKeyService
  const apiKey = yield* keySvc.getApiKey()
  yield* Effect.log(` Usando API Key: ${apiKey}`)
  return { success: true, apiKey }
})

Effect.gen(function* () {
  yield* Effect.log(" Definimos el EFECTO que usa el servicio (sin conocer la implementación)")
  yield* Effect.log("    El program pide ApiKeyService con yield*")
  yield* Effect.log(" En runPromise le pasamos la capa para ejecutar")
}).pipe(Effect.runPromise)

//************************* Inyeccion de dependencias********************************
program.pipe(
  Effect.provide(LayerDev),
  Effect.runPromise
)

const ApiKeyProdImpl: ApiKeyInterface = {
  getApiKey: () => Effect.gen(function* () {
    // Aquí va tu lógica para obtener la key del servidor
    // Ejemplo: llamar a una API, leer de una base de datos, etc.
    yield* Effect.log(`  PROD: Obteniendo key del servidor`)
    return "clave-desde-servidor-123"
  })
}

const LayerProd = Layer.succeed(ApiKeyService, ApiKeyProdImpl)