/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { AuthResponse } from "../models/AuthResponse";
import type { LoginDto } from "../models/LoginDto";
import type { OauthLoginDto } from "../models/OauthLoginDto";
import type { SignupDto } from "../models/SignupDto";
import type { CancelablePromise } from "../core/CancelablePromise";
import { OpenAPI } from "../core/OpenAPI";
import { request as __request } from "../core/request";
export class AuthService {
  /**
   * Sign up a new user
   * @param requestBody
   * @returns AuthResponse User created successfully
   * @throws ApiError
   */
  public static authControllerSignup(
    requestBody: SignupDto,
  ): CancelablePromise<AuthResponse> {
    return __request(OpenAPI, {
      method: "POST",
      url: "/auth/signup",
      body: requestBody,
      mediaType: "application/json",
    });
  }
  /**
   * Login with email and password
   * @param requestBody
   * @returns AuthResponse User login successful
   * @throws ApiError
   */
  public static authControllerLogin(
    requestBody: LoginDto,
  ): CancelablePromise<AuthResponse> {
    return __request(OpenAPI, {
      method: "POST",
      url: "/auth/login",
      body: requestBody,
      mediaType: "application/json",
      errors: {
        401: `Invalid credentials`,
      },
    });
  }
  /**
   * Login with OAuth provider
   * @param requestBody
   * @returns AuthResponse OAuth login successful
   * @throws ApiError
   */
  public static authControllerOauthLogin(
    requestBody: OauthLoginDto,
  ): CancelablePromise<AuthResponse> {
    return __request(OpenAPI, {
      method: "POST",
      url: "/auth/oauth",
      body: requestBody,
      mediaType: "application/json",
    });
  }
}
