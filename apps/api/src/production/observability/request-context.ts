export type RequestContext = {
  correlationId?: string;
  operationId?: string;
};

export type RequestWithContext = RequestContext & {
  readonly headers?: Record<string, string | readonly string[] | undefined>;
  readonly id?: string;
  readonly method?: string;
  readonly routeOptions?: { readonly url?: string };
  readonly url?: string;
};
