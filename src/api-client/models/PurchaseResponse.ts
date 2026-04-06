/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { CourseResponse } from "./CourseResponse";
export type PurchaseResponse = {
  id: string;
  courseId: string;
  course: CourseResponse;
  amount: number;
  currency: string;
  status: string;
  stripeSessionId?: string;
  customerEmail?: string;
  createdAt: string;
};
