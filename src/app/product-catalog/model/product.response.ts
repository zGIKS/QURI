import { ProductStatus } from './product.entity';

/**
 * Response DTO for product data
 */
export interface ProductResponse {
  id: string;
  projectId: string;
  priceAmount: number;
  priceCurrency: string;
  status: ProductStatus;
  projectTitle: string;
  projectPreviewUrl: string;
  projectUserId: string;
  likeCount: number;
  createdAt: string;
  updatedAt: string;
}

/**
 * Response DTO for product like operations
 */
export interface ProductLikeResponse {
  message: string;
  productId: string;
  userId: string;
}

/**
 * Response DTO for like count
 */
export interface ProductLikeCountResponse {
  likeCount: number;
}

/**
 * Response DTO for checking if user liked a product
 */
export interface ProductLikeStatusResponse {
  isLiked: boolean;
}

/**
 * Response DTO for API errors
 */
export interface ApiErrorResponse {
  message: string;
  error: string;
  status: number;
}

/**
 * Response DTO for paginated product results
 */
export interface ProductListResponse {
  products: ProductResponse[];
  totalCount: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

/**
 * Response DTO for product creation success
 */
export interface CreateProductResponse extends ProductResponse {
  // Inherits all properties from ProductResponse
}

/**
 * Response DTO for product update success
 */
export interface UpdateProductResponse extends ProductResponse {
  // Inherits all properties from ProductResponse
}
