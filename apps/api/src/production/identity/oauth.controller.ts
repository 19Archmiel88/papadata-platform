import { Inject } from "@nestjs/common";
import { Body, Controller, Post } from "@nestjs/common";
import { Principal } from "../auth/principal.decorator.js";
import type { RequestPrincipal } from "../auth/request-principal.js";
import {
  AuditDeniedAccess,
  OperationId,
  PublicEndpoint,
  RequireAuthLevel,
  RequireCapabilities,
} from "../auth/route-policy.js";
import {
  OAuthCallbackDto,
  OAuthLinkOrReauthStartDto,
  OAuthStartDto,
} from "./oauth.dto.js";
import { OAuthFlowService } from "./oauth-flow.service.js";

// Dedicated REST endpoints (not the generic contract-runtime dispatcher):
// login/register/accept_invitation results need to flow into the BFF's
// real session-cookie issuance the same way /v1/identity/login does, and
// link_account/reauth need a real authenticated principal — neither of
// those compose cleanly with the generic pass-through proxy the decoy
// contract-runtime auth.oauth.* operations used.
@Controller("v1/identity/oauth")
export class OAuthController {
  constructor(@Inject(OAuthFlowService) private readonly flow: OAuthFlowService) {}

  @Post("start")
  @PublicEndpoint()
  @OperationId("identity.oauth.start")
  async start(@Body() body: OAuthStartDto): Promise<object> {
    return {
      data: await this.flow.start({
        intent: body.intent,
        invitationId: body.invitationId,
        invitationToken: body.invitationToken,
        provider: body.provider,
        returnTo: body.returnTo,
      }),
    };
  }

  @Post("link/start")
  @OperationId("identity.oauth.link.start")
  @RequireCapabilities("auth.session.revoke")
  @RequireAuthLevel("mfa")
  @AuditDeniedAccess()
  async startLink(
    @Principal() principal: RequestPrincipal,
    @Body() body: OAuthLinkOrReauthStartDto,
  ): Promise<object> {
    return {
      data: await this.flow.start({
        intent: "link_account",
        principal,
        provider: body.provider,
        returnTo: body.returnTo,
      }),
    };
  }

  @Post("reauth/start")
  @OperationId("identity.oauth.reauth.start")
  @RequireCapabilities("auth.session.revoke")
  @RequireAuthLevel("mfa")
  @AuditDeniedAccess()
  async startReauth(
    @Principal() principal: RequestPrincipal,
    @Body() body: OAuthLinkOrReauthStartDto,
  ): Promise<object> {
    return {
      data: await this.flow.start({
        intent: "reauth",
        principal,
        provider: body.provider,
        returnTo: body.returnTo,
      }),
    };
  }

  // Handles every intent's callback. No principal needed: for
  // link_account/reauth, the target user was already captured server-side
  // in the transaction at start time (see oauth-flow.service.ts).
  @Post("callback")
  @PublicEndpoint()
  @OperationId("identity.oauth.callback")
  async callback(@Body() body: OAuthCallbackDto): Promise<object> {
    return {
      data: await this.flow.callback({
        code: body.code,
        state: body.state,
      }),
    };
  }
}
