import { Controller, Get, Header } from "@nestjs/common";
import { collectDefaultMetrics, Counter, Histogram, Registry } from "prom-client";
import { InfrastructureEndpoint } from "../auth/route-policy.js";
const registry=new Registry();collectDefaultMetrics({register:registry,prefix:"papadata_api_"});
export const requestCounter=new Counter({name:"papadata_api_requests_total",help:"API requests",labelNames:["route","method","status"] as const,registers:[registry]});
export const requestDuration=new Histogram({name:"papadata_api_request_duration_seconds",help:"API request duration",labelNames:["route","method"] as const,registers:[registry]});
@Controller()
export class MetricsController{@Get("metrics")@InfrastructureEndpoint()@Header("content-type",registry.contentType)metrics():Promise<string>{return registry.metrics();}}
