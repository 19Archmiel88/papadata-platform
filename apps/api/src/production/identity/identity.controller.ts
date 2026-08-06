import { Inject } from "@nestjs/common";
import { Body, Controller, Headers, Post, Req } from "@nestjs/common";
import type { FastifyRequest } from "fastify";
import { OperationId, PublicEndpoint } from "../auth/route-policy.js";
import { IdentityLoginDto, IdentityRegisterDto } from "./identity.dto.js";
import { IdentityService } from "./identity.service.js";

@Controller("v1/identity")
export class IdentityController {
  constructor(@Inject(IdentityService) private readonly service: IdentityService) {}

  @Post("register")
  @PublicEndpoint()
  @OperationId("identity.register")
  async register(@Body() input: IdentityRegisterDto): Promise<object> {
    return { data: await this.service.register(input) };
  }

  @Post("login")
  @PublicEndpoint()
  @OperationId("identity.login")
  async login(
    @Body() input: IdentityLoginDto,
    @Headers("x-correlation-id") correlationId: string | undefined,
    @Req() request: FastifyRequest,
  ): Promise<object> {
    return {
      data: await this.service.login(input, {
        correlationId: correlationId ?? null,
        ipAddress: request.ip ?? null,
      }),
    };
  }
}
