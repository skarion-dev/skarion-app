/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { WebhookResponse } from "../models/WebhookResponse";
import type { CancelablePromise } from "../core/CancelablePromise";
import { OpenAPI } from "../core/OpenAPI";
import { request as __request } from "../core/request";
export class WebhooksService {
  /**
   * Handle Stripe webhook events
   * @param requestBody Raw Stripe event data
   * @returns WebhookResponse Webhook processed
   * @throws ApiError
   */
  public static stripeWebhookControllerHandleStripeWebhook(
    requestBody: string,
  ): CancelablePromise<WebhookResponse> {
    return __request(OpenAPI, {
      method: "POST",
      url: "/webhooks/stripe",
      body: requestBody,
      mediaType: "application/json",
    });
  }
}
