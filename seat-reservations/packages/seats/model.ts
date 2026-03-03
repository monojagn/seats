import { Schema } from "effect";

export const Coordinate = Schema.Struct({
    x: Schema.Number,
    y: Schema.Number
})

export const CreatePayload = Schema.Struct({
    floor: Schema.Number,
    location: Coordinate
})

export const UpdatePayload = Schema.Struct({
    ...CreatePayload.fields
})

export const Seat = Schema.Struct({
    ...CreatePayload.fields,
    id: Schema.String
})

export const Seats = Schema.Array(Seat)