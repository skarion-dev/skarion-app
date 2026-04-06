/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { CheckoutResponse } from "../models/CheckoutResponse";
import type { CreateCheckoutDto } from "../models/CreateCheckoutDto";
import type { PurchaseResponse } from "../models/PurchaseResponse";
import type { CancelablePromise } from "../core/CancelablePromise";
import { OpenAPI } from "../core/OpenAPI";
import { request as __request } from "../core/request";
export class PaymentsService {
  /**
   * Create checkout session
   * @param requestBody
   * @returns CheckoutResponse Checkout session created
   * @throws ApiError
   */
  public static paymentsControllerCreateCheckout(
    requestBody: CreateCheckoutDto,
  ): CancelablePromise<CheckoutResponse> {
    return __request(OpenAPI, {
      method: "POST",
      url: "/payments/checkout",
      body: requestBody,
      mediaType: "application/json",
    });
  }
  /**
   * Get purchase history
   * @returns PurchaseResponse User purchase history
   * @throws ApiError
   */
  public static paymentsControllerGetHistory(): CancelablePromise<
    Array<PurchaseResponse>
  > {
    return __request(OpenAPI, {
      method: "GET",
      url: "/payments/history",
    });
  }
  /**
   * Get purchase details by session ID
   * @param sessionId
   * @returns PurchaseResponse Purchase details retrieved
   * @throws ApiError
   */
  public static paymentsControllerGetPurchase(
    sessionId: string,
  ): CancelablePromise<PurchaseResponse> {
    return __request(OpenAPI, {
      method: "GET",
      url: "/payments/purchase/{sessionId}",
      path: {
        sessionId: sessionId,
      },
    });
  }
}
