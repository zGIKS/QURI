/**
 * ProductLike entity representing a user's like on a product
 */
export class ProductLike {
  public productId: string;
  public userId: string;
  public createdAt: Date;

  constructor(
    productId: string,
    userId: string,
    createdAt: Date = new Date()
  ) {
    this.productId = productId;
    this.userId = userId;
    this.createdAt = createdAt;
  }

  /**
   * Checks if this like belongs to a specific user
   */
  public belongsToUser(userId: string): boolean {
    return this.userId === userId;
  }

  /**
   * Checks if this like is for a specific product
   */
  public isForProduct(productId: string): boolean {
    return this.productId === productId;
  }
}
