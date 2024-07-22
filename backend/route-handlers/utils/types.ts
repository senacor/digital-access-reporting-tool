import { Request, Response } from "express"
import { Send } from "express-serve-static-core"

export type ServerError = {
  message: string
}

export type FormValidationError<RequestBody> = {
  key: keyof RequestBody
  message: string
}

export type ResponseBody<Data, RequestBody> = {
  data: Data | null
  formErrors: FormValidationError<RequestBody>[] | null
  serverError: ServerError | null
}

export interface TypedExpressRequest<Body> extends Request {
  body: Body
}

export interface TypedExpressResponse<Body> extends Response {
  send: Send<Body, this>
}
