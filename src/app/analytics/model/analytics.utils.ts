import { CustomerAnalytics } from './customer-analytics.entity';
import { ManufacturerAnalytics } from './manufacturer-analytics.entity';

/**
 * Utility functions for analytics calculations and formatting
 */
export class AnalyticsUtils {
  /**
   * Formats a number as a percentage with specified decimal places
   */
  static formatPercentage(value: number, decimals: number = 1): string {
    return `${value.toFixed(decimals)}%`;
  }

  /**
   * Formats average fulfillment time in days
   */
  static formatFulfillmentTime(days: number): string {
    if (days === 0) return '0 days';
    if (days < 1) return `${Math.round(days * 24)} hours`;
    if (days === 1) return '1 day';
    return `${days.toFixed(1)} days`;
  }

  /**
   * Gets color class based on completion rate
   */
  static getCompletionRateColor(rate: number): string {
    if (rate >= 80) return 'success';
    if (rate >= 60) return 'warning';
    return 'danger';
  }

  /**
   * Gets color class based on fulfillment efficiency
   */
  static getFulfillmentEfficiencyColor(efficiency: string): string {
    switch (efficiency) {
      case 'Excellent': return 'success';
      case 'Good': return 'primary';
      case 'Average': return 'warning';
      case 'Poor': return 'danger';
      default: return 'secondary';
    }
  }

  /**
   * Gets color class based on workload status
   */
  static getWorkloadStatusColor(status: string): string {
    switch (status) {
      case 'Light': return 'success';
      case 'Moderate': return 'primary';
      case 'Heavy': return 'warning';
      case 'Overloaded': return 'danger';
      default: return 'secondary';
    }
  }

  /**
   * Gets color class based on activity level
   */
  static getActivityLevelColor(level: string): string {
    switch (level) {
      case 'High': return 'success';
      case 'Medium': return 'primary';
      case 'Low': return 'warning';
      default: return 'secondary';
    }
  }

  /**
   * Calculates productivity score for customers (0-100)
   */
  static calculateCustomerProductivityScore(analytics: CustomerAnalytics): number {
    const completionWeight = 0.4;
    const blueprintWeight = 0.3;
    const designWeight = 0.3;

    const completionScore = analytics.getCompletionRate();
    const blueprintScore = Math.min(analytics.getBlueprintRatio(), 100);
    const designScore = Math.min(analytics.getDesignedGarmentsRatio(), 100);

    return Math.round(
      (completionScore * completionWeight) +
      (blueprintScore * blueprintWeight) +
      (designScore * designWeight)
    );
  }

  /**
   * Calculates efficiency score for manufacturers (0-100)
   */
  static calculateManufacturerEfficiencyScore(analytics: ManufacturerAnalytics): number {
    const completionWeight = 0.4;
    const timeWeight = 0.3;
    const successWeight = 0.3;

    const completionScore = analytics.getFulfillmentCompletionRate();
    const timeScore = Math.max(0, 100 - (analytics.avgFulfillmentTimeDays * 10)); // Lower time = higher score
    const successScore = analytics.getProductionSuccessRate();

    return Math.round(
      (completionScore * completionWeight) +
      (timeScore * timeWeight) +
      (successScore * successWeight)
    );
  }

  /**
   * Validates if a user ID is a valid UUID format
   */
  static isValidUUID(uuid: string): boolean {
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
    return uuidRegex.test(uuid);
  }

  /**
   * Formats large numbers with appropriate suffixes (K, M, B)
   */
  static formatLargeNumber(num: number): string {
    if (num >= 1000000000) {
      return (num / 1000000000).toFixed(1) + 'B';
    }
    if (num >= 1000000) {
      return (num / 1000000).toFixed(1) + 'M';
    }
    if (num >= 1000) {
      return (num / 1000).toFixed(1) + 'K';
    }
    return num.toString();
  }

  /**
   * Gets trend indicator based on current vs previous values
   */
  static getTrendIndicator(current: number, previous: number): 'up' | 'down' | 'stable' {
    const threshold = 0.05; // 5% threshold for stability
    const percentChange = (current - previous) / previous;

    if (Math.abs(percentChange) < threshold) return 'stable';
    return percentChange > 0 ? 'up' : 'down';
  }

  /**
   * Gets trend color based on trend direction
   */
  static getTrendColor(trend: 'up' | 'down' | 'stable'): string {
    switch (trend) {
      case 'up': return 'success';
      case 'down': return 'danger';
      case 'stable': return 'secondary';
      default: return 'secondary';
    }
  }
}
