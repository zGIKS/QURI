/**
 * Customer Analytics entity representing customer KPIs
 */
export class CustomerAnalytics {
  public id: string;
  public userId: string;
  public totalProjects: number;
  public blueprints: number;
  public designedGarments: number;
  public completed: number;

  constructor(
    id: string,
    userId: string,
    totalProjects: number,
    blueprints: number,
    designedGarments: number,
    completed: number
  ) {
    this.id = id;
    this.userId = userId;
    this.totalProjects = totalProjects;
    this.blueprints = blueprints;
    this.designedGarments = designedGarments;
    this.completed = completed;
  }

  /**
   * Gets the completion rate as a percentage
   */
  getCompletionRate(): number {
    return this.totalProjects > 0 ? (this.completed / this.totalProjects) * 100 : 0;
  }

  /**
   * Gets the blueprint to project ratio
   */
  getBlueprintRatio(): number {
    return this.totalProjects > 0 ? (this.blueprints / this.totalProjects) * 100 : 0;
  }

  /**
   * Gets the designed garments to project ratio
   */
  getDesignedGarmentsRatio(): number {
    return this.totalProjects > 0 ? (this.designedGarments / this.totalProjects) * 100 : 0;
  }

  /**
   * Checks if the customer is active (has projects)
   */
  isActive(): boolean {
    return this.totalProjects > 0;
  }

  /**
   * Gets a summary of the customer's activity level
   */
  getActivityLevel(): 'Low' | 'Medium' | 'High' {
    if (this.totalProjects === 0) return 'Low';
    if (this.totalProjects < 5) return 'Low';
    if (this.totalProjects < 15) return 'Medium';
    return 'High';
  }
}
