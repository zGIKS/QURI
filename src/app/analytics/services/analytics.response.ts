/**
 * Response DTO for Customer Analytics from the API
 */
export interface CustomerAnalyticsResponse {
  id: string;
  userId: string;
  totalProjects: number;
  blueprints: number;
  designedGarments: number;
  completed: number;
}

/**
 * Response DTO for Manufacturer Analytics from the API
 */
export interface ManufacturerAnalyticsResponse {
  userId: string;
  totalOrdersReceived: number;
  pendingFulfillments: number;
  producedProjects: number;
  avgFulfillmentTimeDays: number;
}
