import * as express from "express";
import QueryString from "qs";
import { z } from "zod";
import { Logger } from "../../core/logger";
import { Uuid } from "../../core/uuid";
import { ValidationError } from "../../core/validation-erros";

export abstract class BaseController {
  protected abstract executeImpl(
    req: express.Request,
    res: express.Response
  ): Promise<express.Response | void>;

  async execute(req: express.Request, res: express.Response): Promise<void> {
    const requestId = Uuid.random().value;
    try {
      Logger.info(`[BaseController] Request ${req.method} ${req.url}`, {
        requestId,
        data: {
          headers: req.headers,
          body: req.body,
          params: req.params,
          query: req.query,
          url: req.originalUrl,
        },
      });
      await this.executeImpl(req, res);
      Logger.info(`[BaseController] Response ${req.method} ${req.url}`, {
        requestId,
        data: {
          headers: res.getHeaders(),
          status: res.statusCode,
        },
      });
    } catch (err) {
      Logger.error(
        `[BaseController] Unexpected error occurred`,
        {
          error: err,
          requestId,
          data: {
            body: req.body,
            params: req.params,
            query: req.query,
            url: req.originalUrl,
          },
        },
        err
      );
      this.fail(res, `An unexpected error occurred`, err);
    }
  }

  static jsonResponse(
    res: express.Response,
    code: number,
    message: string
  ): express.Response {
    return res.status(code).json({ message });
  }

  ok<T>(res: express.Response, dto?: T): express.Response {
    if (dto) {
      res.type("application/json");
      return res.status(200).json(dto);
    }

    return res.sendStatus(200);
  }

  created<T>(res: express.Response, dto?: T): express.Response {
    if (dto) {
      res.type("application/json");
      return res.status(201).json(dto);
    }

    return res.sendStatus(201);
  }

  noContent(res: express.Response): express.Response {
    return res.sendStatus(204);
  }

  accepted<T>(res: express.Response, dto?: T): express.Response {
    if (dto) {
      res.type("application/json");
      return res.status(202).json(dto);
    }
    return res.sendStatus(202);
  }

  redirect(res: express.Response, url: string): void {
    res.redirect(url);
  }

  clientError(
    res: express.Response,
    message?: string,
    validationErrors?: ValidationError[]
  ): express.Response {
    if (validationErrors?.length) {
      return res
        .status(400)
        .json({ message: message ?? "Bad Request", errors: validationErrors });
    }
    return BaseController.jsonResponse(res, 400, message ?? "Bad Request");
  }

  unauthorized(res: express.Response, message?: string): express.Response {
    return BaseController.jsonResponse(
      res,
      401,
      message ? message : "Unauthorized"
    );
  }

  paymentRequired(res: express.Response, message?: string): express.Response {
    return BaseController.jsonResponse(
      res,
      402,
      message ? message : "Payment required"
    );
  }

  forbidden(res: express.Response, message?: string): express.Response {
    return BaseController.jsonResponse(
      res,
      403,
      message ? message : "Forbidden"
    );
  }

  notFound(res: express.Response, message?: string): express.Response {
    return BaseController.jsonResponse(
      res,
      404,
      message ? message : "Not found"
    );
  }

  conflict(res: express.Response, message?: string): express.Response {
    return BaseController.jsonResponse(
      res,
      409,
      message ? message : "Conflict"
    );
  }

  unprocessableEntity(
    res: express.Response,
    message?: string
  ): express.Response {
    return BaseController.jsonResponse(
      res,
      422,
      message ? message : "Unprocessable Entity"
    );
  }

  tooMany(res: express.Response, message?: string): express.Response {
    return BaseController.jsonResponse(
      res,
      429,
      message ? message : "Too many requests"
    );
  }

  mapValidationErrors(errors: z.ZodIssue[]): string {
    return errors
      .map((e) => `${e.path.toString()}: ${e.message.toString()}`)
      .join(" ");
  }

  setListHeaders(
    res: express.Response,
    params: { path: string; total: number; page: number; pageSize: number }
  ): void {
    const maxPage = Math.ceil(params.total / params.pageSize);
    const previousPage = params.page > 1 ? params.page - 1 : undefined;

    const links = [
      `<${params.path}?page=${params.page}&pageSize=${params.pageSize}>;rel=self,`,
      `<${params.path}?page=1&pageSize=${params.pageSize}>;rel=first,`,
      previousPage
        ? `<${params.path}?page=${previousPage}&pageSize=${params.pageSize}>;rel=previous,`
        : "",
      params.page < maxPage
        ? `<${params.path}?page=${params.page + 1}&pageSize=${
            params.pageSize
          }>;rel=next,`
        : "",
      `<${params.path}?page=${maxPage}&pageSize=${params.pageSize}>;rel=last`,
    ];

    res.setHeader("Link", links.join(""));
    res.setHeader("X-Total-Count", params.total);
  }

  mountQueryArray<T>(prop: unknown): T[] | undefined {
    if (!prop) return undefined;
    return prop instanceof Array ? prop : [prop];
  }

  mountOptionalArray<T>(prop: unknown): T[] | undefined {
    if (!prop) return undefined;
    return prop instanceof Array ? prop : [prop];
  }

  parseOptionalInt(prop?: string): number | undefined {
    return prop ? parseInt(prop) : undefined;
  }

  filterMetadataQueryArray(
    query: QueryString.ParsedQs
  ): Record<string, string[]> {
    return Object.keys(query)
      .filter((key) => key.startsWith("metadata."))
      .reduce((result: Record<string, string[]>, key: string) => {
        const [, parsedKey] = key.split("metadata.");
        result[parsedKey] = Array.isArray(query[key])
          ? (query[key] as string[])
          : [query[key] as string];
        return result;
      }, {});
  }

  private fail(
    res: express.Response,
    message: string,
    err?: unknown
  ): express.Response {
    const errMsg = err instanceof Error ? err.message : "unspecified";
    return res.status(500).json({
      message: `${message}. Error: ${errMsg}`,
    });
  }
}
