/**
 * Request DTO for updating Customer Analytics
 */
export interface UpdateCustomerAnalyticsRequest {
  totalProjects?: number;
  blueprints?: number;
  designedGarments?: number;
  completed?: number;
}

/**
 * Request DTO for updating Manufacturer Analytics
 */
export interface UpdateManufacturerAnalyticsRequest {
  totalOrdersReceived?: number;
  pendingFulfillments?: number;
  producedProjects?: number;
  avgFulfillmentTimeDays?: number;
}
