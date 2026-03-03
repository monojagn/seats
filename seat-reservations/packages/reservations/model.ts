import { Schema } from "effect";

export const CreatePayload = Schema.Struct({
    seats: Schema.Array(Schema.String),
    owner: Schema.String,
    date: Schema.Date,
})

export const Reservation = Schema.Struct({
    ...CreatePayload.fields,
    id: Schema.String
})

export const Reservations = Schema.Array(Reservation);