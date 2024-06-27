import { Request, Response } from "express"
import { Send } from "express-serve-static-core"

export type ServerError = {
  message: string
}

type FormValidationError<RequestBody> = {
  key: keyof RequestBody
  message: string
}

export type ResponseBody<Data, RequestBody> =
  | {
      data: Data
      formErrors: null
      serverError: null
    }
  | {
      data: null
      formErrors: FormValidationError<RequestBody>[]
      serverError: null
    }
  | {
      data: null
      formErrors: null
      serverError: ServerError
    }

export interface TypedExpressRequest<Body> extends Request {
  body: Body
}

export interface TypedExpressResponse<Body> extends Response {
  send: Send<Body, this>
}
