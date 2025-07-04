/**
 * Product entity representing a product in the catalog
 */
export class Product {
  public id: string;
  public projectId: string;
  public priceAmount: number;
  public priceCurrency: string;
  public status: ProductStatus;
  public projectTitle: string;
  public projectPreviewUrl: string;
  public projectUserId: string;
  public likeCount: number;
  public createdAt: Date;
  public updatedAt: Date;

  constructor(
    id: string,
    projectId: string,
    priceAmount: number,
    priceCurrency: string,
    status: ProductStatus,
    projectTitle: string,
    projectPreviewUrl: string,
    projectUserId: string,
    likeCount: number = 0,
    createdAt: Date = new Date(),
    updatedAt: Date = new Date()
  ) {
    this.id = id;
    this.projectId = projectId;
    this.priceAmount = priceAmount;
    this.priceCurrency = priceCurrency;
    this.status = status;
    this.projectTitle = projectTitle;
    this.projectPreviewUrl = projectPreviewUrl;
    this.projectUserId = projectUserId;
    this.likeCount = likeCount;
    this.createdAt = createdAt;
    this.updatedAt = updatedAt;
  }

  /**
   * Updates the product's price
   */
  public updatePrice(amount: number, currency: string): void {
    this.priceAmount = amount;
    this.priceCurrency = currency;
    this.updatedAt = new Date();
  }

  /**
   * Updates the product's status
   */
  public updateStatus(status: ProductStatus): void {
    this.status = status;
    this.updatedAt = new Date();
  }

  /**
   * Increments the like count
   */
  public incrementLikeCount(): void {
    this.likeCount++;
    this.updatedAt = new Date();
  }

  /**
   * Decrements the like count
   */
  public decrementLikeCount(): void {
    if (this.likeCount > 0) {
      this.likeCount--;
      this.updatedAt = new Date();
    }
  }

  /**
   * Checks if the product is available for purchase
   */
  public isAvailable(): boolean {
    return this.status === ProductStatus.AVAILABLE;
  }
}

/**
 * Product status enumeration
 */
export enum ProductStatus {
  AVAILABLE = 'AVAILABLE',
  UNAVAILABLE = 'UNAVAILABLE',
  OUT_OF_STOCK = 'OUT_OF_STOCK',
  DISCONTINUED = 'DISCONTINUED'
}
