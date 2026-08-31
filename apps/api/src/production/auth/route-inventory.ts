import { METHOD_METADATA, PATH_METADATA } from "@nestjs/common/constants";
import { RequestMethod } from "@nestjs/common";
import { productionControllers } from "../app.module.js";

// Enumerates every route registered on every production controller purely
// via Nest's own routing metadata (the same PATH_METADATA/METHOD_METADATA
// Nest itself reads when wiring the HTTP router) -- no DI instantiation, no
// database, no live app bootstrap. Importing `productionControllers` only
// evaluates class bodies (which is when method/class decorators run and
// attach their metadata), it never constructs a controller instance, so
// this is safe to run in a plain CI job right after `pnpm install`.
export type ProductionRouteOperation = {
  readonly controller: Function;
  readonly handler: Function;
  readonly httpMethod: string;
  readonly httpOperation: string;
  readonly path: string;
};

export function listProductionOperations(): readonly ProductionRouteOperation[] {
  return productionControllers.flatMap((controller) => {
    const controllerPath = readPath(Reflect.getMetadata(PATH_METADATA, controller));
    const prototype = controller.prototype as unknown as Record<string, Function>;

    return Object.getOwnPropertyNames(prototype)
      .filter((propertyName) => propertyName !== "constructor")
      .flatMap((propertyName): readonly ProductionRouteOperation[] => {
        const handler = prototype[propertyName];
        const method = Reflect.getMetadata(METHOD_METADATA, handler) as RequestMethod | undefined;
        if (method === undefined) {
          return [];
        }

        const methodPath = readPath(Reflect.getMetadata(PATH_METADATA, handler));
        const httpMethod = httpMethodName(method);
        const path = joinRoutePath(controllerPath, methodPath);

        return [{
          controller,
          handler,
          httpMethod,
          httpOperation: `${httpMethod} ${path}`,
          path,
        }];
      });
  });
}

function readPath(value: unknown): string {
  if (Array.isArray(value)) {
    return readPath(value[0]);
  }
  return typeof value === "string" ? value : "";
}

function joinRoutePath(controllerPath: string, methodPath: string): string {
  const path = [controllerPath, methodPath]
    .filter((part) => part.length > 0)
    .join("/")
    .replaceAll(/\/+/gu, "/");
  // A bare `@Controller()` (no argument) reports PATH_METADATA as "/", not
  // "" -- `path` above can therefore already start with "/" (e.g. the six
  // generated contract-runtime controllers, all `@Controller()`), and
  // prepending another "/" via the template literal produces a "//" that
  // the *first* collapse above ran too early to catch. Collapse again
  // after prepending, not just before.
  return `/${path}`.replaceAll(/\/+/gu, "/").replace(/\/$/u, "") || "/";
}

function httpMethodName(method: RequestMethod): string {
  const methodNames: Partial<Record<RequestMethod, string>> = {
    [RequestMethod.GET]: "GET",
    [RequestMethod.POST]: "POST",
    [RequestMethod.PUT]: "PUT",
    [RequestMethod.DELETE]: "DELETE",
    [RequestMethod.PATCH]: "PATCH",
  };
  return methodNames[method] ?? "UNKNOWN";
}
