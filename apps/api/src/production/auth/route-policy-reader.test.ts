import "reflect-metadata";
import { Controller, Get, RequestMethod, SetMetadata } from "@nestjs/common";
import { METHOD_METADATA, PATH_METADATA } from "@nestjs/common/constants";
import { Reflector } from "@nestjs/core";
import { capabilityCatalog } from "@papadata/contracts";
import { describe, expect, it } from "vitest";
import { productionControllers } from "../app.module.js";
import {
  PublicEndpoint,
  RequireAuthLevel,
  RequireCapabilities,
  authenticatedEndpointMetadataKey,
  requiredCapabilitiesMetadataKey,
} from "./route-policy.js";
import { readRoutePolicy } from "./route-policy-reader.js";

const reflector = new Reflector();

describe("readRoutePolicy", () => {
  it("fails closed when an endpoint has no classification", () => {
    class ExampleController {
      handler(): void {}
    }

    expect(readRoutePolicy(reflector, ExampleController.prototype.handler, ExampleController))
      .toEqual({
        reason: "endpoint_policy_classification_required",
        valid: false,
      });
  });

  it("fails closed when an endpoint has more than one classification", () => {
    @Controller()
    class ExampleController {
      @Get()
      @PublicEndpoint()
      @RequireCapabilities("workspace.read")
      handler(): void {}
    }

    expect(readRoutePolicy(reflector, ExampleController.prototype.handler, ExampleController))
      .toEqual({
        reason: "endpoint_policy_classification_required",
        valid: false,
      });
  });

  it("fails closed when authenticated metadata has no capabilities", () => {
    class ExampleController {
      @SetMetadata(authenticatedEndpointMetadataKey, true)
      handler(): void {}
    }

    expect(readRoutePolicy(reflector, ExampleController.prototype.handler, ExampleController))
      .toEqual({
        reason: "endpoint_capability_policy_required",
        valid: false,
      });
  });

  it("fails closed when capability metadata bypasses the canonical decorator", () => {
    class ExampleController {
      @SetMetadata(authenticatedEndpointMetadataKey, true)
      @SetMetadata(requiredCapabilitiesMetadataKey, ["workspace.delete"])
      handler(): void {}
    }

    expect(readRoutePolicy(reflector, ExampleController.prototype.handler, ExampleController))
      .toEqual({
        reason: "endpoint_capability_catalog_entry_required",
        valid: false,
      });
  });

  it("derives step-up from capability catalog reauthentication requirements", () => {
    class ExampleController {
      @RequireCapabilities("auth.session.revoke")
      @RequireAuthLevel("mfa")
      handler(): void {}
    }

    const result = readRoutePolicy(
      reflector,
      ExampleController.prototype.handler,
      ExampleController,
    );

    expect(result.valid).toBe(true);
    if (result.valid) {
      expect(result.policy.authLevel).toBe("step_up");
    }
  });

  it("derives step-up from critical capability catalog requirements", () => {
    class ExampleController {
      @RequireCapabilities("audit.read")
      handler(): void {}
    }

    const result = readRoutePolicy(
      reflector,
      ExampleController.prototype.handler,
      ExampleController,
    );

    expect(result.valid).toBe(true);
    if (result.valid) {
      expect(result.policy.authLevel).toBe("step_up");
    }
  });

  it("keeps every production controller route classified and capability-backed", () => {
    const implementedOperations = listProductionOperations();
    const catalogOperations = new Map<string, string>();

    for (const descriptor of capabilityCatalog) {
      for (const operation of descriptor.operations) {
        catalogOperations.set(operation, descriptor.capability);
      }
    }

    expect(implementedOperations.length).toBeGreaterThan(0);

    for (const operation of implementedOperations) {
      const policy = readRoutePolicy(
        reflector,
        operation.handler,
        operation.controller,
      );

      expect(policy, `${operation.httpOperation} must have one valid route policy`)
        .toMatchObject({ valid: true });

      if (!policy.valid || policy.policy.classification !== "authenticated") {
        continue;
      }

      expect(policy.policy.capabilities.length, operation.httpOperation)
        .toBeGreaterThan(0);

      const catalogCapability = catalogOperations.get(operation.httpOperation);
      if (catalogCapability) {
        expect(policy.policy.capabilities, operation.httpOperation)
          .toContain(catalogCapability);
      }
    }
  });
});

type ImplementedOperation = {
  readonly controller: Function;
  readonly handler: Function;
  readonly httpOperation: string;
};

function listProductionOperations(): readonly ImplementedOperation[] {
  return productionControllers.flatMap((controller) => {
    const controllerPath = readPath(Reflect.getMetadata(PATH_METADATA, controller));
    const prototype = controller.prototype as unknown as Record<string, Function>;

    return Object.getOwnPropertyNames(prototype)
      .filter((propertyName) => propertyName !== "constructor")
      .flatMap((propertyName) => {
        const handler = prototype[propertyName];
        const method = Reflect.getMetadata(METHOD_METADATA, handler) as RequestMethod | undefined;
        if (method === undefined) {
          return [];
        }

        const methodPath = readPath(Reflect.getMetadata(PATH_METADATA, handler));
        const httpMethod = httpMethodName(method);

        return [{
          controller,
          handler,
          httpOperation: `${httpMethod} ${joinRoutePath(controllerPath, methodPath)}`,
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
  return `/${path}`.replace(/\/$/u, "") || "/";
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
