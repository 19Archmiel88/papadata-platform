import {
  Controller,
  ForbiddenException,
  Param,
  Post,
} from "@nestjs/common";

import type {
  MvpIntegrationCatalogProviderId,
} from "@papadata/contracts";
import { ExternalProviderEndpoint } from "../auth/route-policy.js";

@Controller("v1/integrations/webhooks")
export class WebhookController {
  @Post(":provider")
  @ExternalProviderEndpoint()
  async receive(
    @Param("provider")
    provider: MvpIntegrationCatalogProviderId,
  ): Promise<object> {
    void provider;
    throw new ForbiddenException(
      "External provider verification is not enabled.",
    );
  }
}
