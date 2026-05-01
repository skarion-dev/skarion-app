import type { CancelablePromise } from '../core/CancelablePromise';
import { OpenAPI } from '../core/OpenAPI';
import { request as __request } from '../core/request';

export type Job = {
    id: string;
    title: string;
    company: string;
    link: string;
    externalId: string;
    postedAt: string;
};

export type GroupedJobs = Record<string, Job[]>;

export class JobsService {
    /**
     * Get all jobs grouped by company
     * @returns GroupedJobs Get all jobs grouped by company
     * @throws ApiError
     */
    public static findAll(): CancelablePromise<GroupedJobs> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/jobs',
        });
    }
}
