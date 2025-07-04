import { ProductStatus } from '../model/product.entity';

/**
 * Request DTO for creating a new product
 */
export interface CreateProductRequest {
  projectId: string;
  priceAmount: number;
  priceCurrency: string;
  status?: ProductStatus;
}

/**
 * Request DTO for updating an existing product
 */
export interface UpdateProductRequest {
  priceAmount?: number;
  priceCurrency?: string;
  status?: ProductStatus;
}

/**
 * Request DTO for getting products with optional filters
 */
export interface GetProductsRequest {
  projectId?: string;
}
