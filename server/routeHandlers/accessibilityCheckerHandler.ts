import * as aChecker from "accessibility-checker";
import { Request, Response } from "express";
import validateUrlParamAndReturnError from "../utils/validateUrlParamAndReturnError";

export default async function accessibilityCheckerHandler(
  req: Request,
  res: Response,
) {
  const url = req.body.url;
  const validationError = validateUrlParamAndReturnError(req.body.url);

  if (validationError) {
    return res.status(400).send({ error: validationError });
  }

  aChecker.getCompliance(url, url, (results) => {
    aChecker.close();
    res.send({ results });
  });
}
