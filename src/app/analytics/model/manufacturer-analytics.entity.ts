/**
 * Manufacturer Analytics entity representing manufacturer KPIs
 */
export class ManufacturerAnalytics {
  public userId: string;
  public totalOrdersReceived: number;
  public pendingFulfillments: number;
  public producedProjects: number;
  public avgFulfillmentTimeDays: number;

  constructor(
    userId: string,
    totalOrdersReceived: number,
    pendingFulfillments: number,
    producedProjects: number,
    avgFulfillmentTimeDays: number
  ) {
    this.userId = userId;
    this.totalOrdersReceived = totalOrdersReceived;
    this.pendingFulfillments = pendingFulfillments;
    this.producedProjects = producedProjects;
    this.avgFulfillmentTimeDays = avgFulfillmentTimeDays;
  }

  /**
   * Gets the fulfillment completion rate as a percentage
   */
  getFulfillmentCompletionRate(): number {
    return this.totalOrdersReceived > 0 ?
      ((this.totalOrdersReceived - this.pendingFulfillments) / this.totalOrdersReceived) * 100 : 0;
  }

  /**
   * Gets the production success rate as a percentage
   */
  getProductionSuccessRate(): number {
    return this.totalOrdersReceived > 0 ? (this.producedProjects / this.totalOrdersReceived) * 100 : 0;
  }

  /**
   * Gets the fulfillment efficiency level based on average time
   */
  getFulfillmentEfficiency(): 'Excellent' | 'Good' | 'Average' | 'Poor' {
    if (this.avgFulfillmentTimeDays <= 2) return 'Excellent';
    if (this.avgFulfillmentTimeDays <= 4) return 'Good';
    if (this.avgFulfillmentTimeDays <= 7) return 'Average';
    return 'Poor';
  }

  /**
   * Checks if the manufacturer has pending work
   */
  hasPendingWork(): boolean {
    return this.pendingFulfillments > 0;
  }

  /**
   * Gets the workload status based on pending fulfillments
   */
  getWorkloadStatus(): 'Light' | 'Moderate' | 'Heavy' | 'Overloaded' {
    if (this.pendingFulfillments === 0) return 'Light';
    if (this.pendingFulfillments <= 3) return 'Moderate';
    if (this.pendingFulfillments <= 7) return 'Heavy';
    return 'Overloaded';
  }

  /**
   * Checks if the manufacturer is active (has received orders)
   */
  isActive(): boolean {
    return this.totalOrdersReceived > 0;
  }

  /**
   * Gets estimated completion time for pending fulfillments
   */
  getEstimatedCompletionTime(): number {
    return this.pendingFulfillments * this.avgFulfillmentTimeDays;
  }
}
