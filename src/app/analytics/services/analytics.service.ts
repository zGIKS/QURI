import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError, map } from 'rxjs/operators';
import { environment } from '../../../environments/environment';
import { CustomerAnalyticsResponse, ManufacturerAnalyticsResponse } from './analytics.response';
import { UpdateCustomerAnalyticsRequest, UpdateManufacturerAnalyticsRequest } from './analytics.request';
import { CustomerAnalytics } from '../model/customer-analytics.entity';
import { ManufacturerAnalytics } from '../model/manufacturer-analytics.entity';

/**
 * Service for handling analytics operations
 */
@Injectable({
  providedIn: 'root'
})
export class AnalyticsService {
  private readonly baseUrl = `${environment.serverBaseUrl}/api/v1/analytics`;

  constructor(private http: HttpClient) {}

  /**
   * Gets customer analytics KPIs for a specific user
   */
  getCustomerAnalytics(userId: string): Observable<CustomerAnalytics> {
    return this.http.get<CustomerAnalyticsResponse>(`${this.baseUrl}/customer-kpis/${userId}`)
      .pipe(
        map(response => this.mapCustomerAnalyticsResponseToEntity(response)),
        catchError(this.handleError)
      );
  }

  /**
   * Gets manufacturer analytics KPIs for a specific user
   */
  getManufacturerAnalytics(userId: string): Observable<ManufacturerAnalytics> {
    return this.http.get<ManufacturerAnalyticsResponse>(`${this.baseUrl}/manufacturer-kpis/${userId}`)
      .pipe(
        map(response => this.mapManufacturerAnalyticsResponseToEntity(response)),
        catchError(this.handleError)
      );
  }

  /**
   * Updates customer analytics (if the API supports it)
   */
  updateCustomerAnalytics(userId: string, request: UpdateCustomerAnalyticsRequest): Observable<CustomerAnalytics> {
    return this.http.put<CustomerAnalyticsResponse>(`${this.baseUrl}/customer-kpis/${userId}`, request)
      .pipe(
        map(response => this.mapCustomerAnalyticsResponseToEntity(response)),
        catchError(this.handleError)
      );
  }

  /**
   * Updates manufacturer analytics (if the API supports it)
   */
  updateManufacturerAnalytics(userId: string, request: UpdateManufacturerAnalyticsRequest): Observable<ManufacturerAnalytics> {
    return this.http.put<ManufacturerAnalyticsResponse>(`${this.baseUrl}/manufacturer-kpis/${userId}`, request)
      .pipe(
        map(response => this.mapManufacturerAnalyticsResponseToEntity(response)),
        catchError(this.handleError)
      );
  }

  /**
   * Maps CustomerAnalyticsResponse to CustomerAnalytics entity
   */
  private mapCustomerAnalyticsResponseToEntity(response: CustomerAnalyticsResponse): CustomerAnalytics {
    return new CustomerAnalytics(
      response.id,
      response.userId,
      response.totalProjects,
      response.blueprints,
      response.designedGarments,
      response.completed
    );
  }

  /**
   * Maps ManufacturerAnalyticsResponse to ManufacturerAnalytics entity
   */
  private mapManufacturerAnalyticsResponseToEntity(response: ManufacturerAnalyticsResponse): ManufacturerAnalytics {
    return new ManufacturerAnalytics(
      response.userId,
      response.totalOrdersReceived,
      response.pendingFulfillments,
      response.producedProjects,
      response.avgFulfillmentTimeDays
    );
  }

  /**
   * Handles HTTP errors
   */
  private handleError(error: any): Observable<never> {
    console.error('Analytics service error:', error);

    let errorMessage = 'An error occurred while fetching analytics data';

    if (error.error?.message) {
      errorMessage = error.error.message;
    } else if (error.status === 400) {
      errorMessage = 'Invalid user ID provided';
    } else if (error.status === 404) {
      errorMessage = 'Analytics data not found for this user';
    } else if (error.status === 500) {
      errorMessage = 'Internal server error occurred';
    }

    return throwError(() => new Error(errorMessage));
  }
}
