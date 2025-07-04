import { Product, ProductStatus } from './product.entity';
import { ProductLike } from './product-like.entity';
import {
  ProductResponse,
  ProductLikeResponse,
  ProductLikeCountResponse,
  ProductLikeStatusResponse,
  CreateProductResponse,
  UpdateProductResponse
} from './product.response';
import { CreateProductRequest, UpdateProductRequest } from './product.request';

/**
 * Assembler class for converting between Product entities and DTOs
 */
export class ProductAssembler {

  /**
   * Converts a Product entity to a ProductResponse DTO
   */
  static toProductResponse(product: Product): ProductResponse {
    return {
      id: product.id,
      projectId: product.projectId,
      priceAmount: product.priceAmount,
      priceCurrency: product.priceCurrency,
      status: product.status,
      projectTitle: product.projectTitle,
      projectPreviewUrl: product.projectPreviewUrl,
      projectUserId: product.projectUserId,
      likeCount: product.likeCount,
      createdAt: product.createdAt.toISOString(),
      updatedAt: product.updatedAt.toISOString()
    };
  }

  /**
   * Converts a Product entity to a CreateProductResponse DTO
   */
  static toCreateProductResponse(product: Product): CreateProductResponse {
    return this.toProductResponse(product);
  }

  /**
   * Converts a Product entity to an UpdateProductResponse DTO
   */
  static toUpdateProductResponse(product: Product): UpdateProductResponse {
    return this.toProductResponse(product);
  }

  /**
   * Converts an array of Product entities to an array of ProductResponse DTOs
   */
  static toProductResponseList(products: Product[]): ProductResponse[] {
    return products.map(product => this.toProductResponse(product));
  }

  /**
   * Converts a ProductResponse DTO to a Product entity
   */
  static fromProductResponse(response: ProductResponse): Product {
    return new Product(
      response.id,
      response.projectId,
      response.priceAmount,
      response.priceCurrency,
      response.status,
      response.projectTitle,
      response.projectPreviewUrl,
      response.projectUserId,
      response.likeCount,
      new Date(response.createdAt),
      new Date(response.updatedAt)
    );
  }

  /**
   * Creates a Product entity from a CreateProductRequest DTO
   */
  static fromCreateProductRequest(
    request: CreateProductRequest,
    id: string,
    projectTitle: string,
    projectPreviewUrl: string,
    projectUserId: string
  ): Product {
    return new Product(
      id,
      request.projectId,
      request.priceAmount,
      request.priceCurrency,
      request.status || ProductStatus.AVAILABLE,
      projectTitle,
      projectPreviewUrl,
      projectUserId
    );
  }

  /**
   * Updates a Product entity with data from an UpdateProductRequest DTO
   */
  static updateProductFromRequest(product: Product, request: UpdateProductRequest): Product {
    if (request.priceAmount !== undefined && request.priceCurrency !== undefined) {
      product.updatePrice(request.priceAmount, request.priceCurrency);
    } else if (request.priceAmount !== undefined) {
      product.updatePrice(request.priceAmount, product.priceCurrency);
    } else if (request.priceCurrency !== undefined) {
      product.updatePrice(product.priceAmount, request.priceCurrency);
    }

    if (request.status !== undefined) {
      product.updateStatus(request.status);
    }

    return product;
  }

  /**
   * Creates a ProductLikeResponse DTO
   */
  static toProductLikeResponse(productId: string, userId: string, message: string): ProductLikeResponse {
    return {
      message,
      productId,
      userId
    };
  }

  /**
   * Creates a ProductLikeCountResponse DTO
   */
  static toProductLikeCountResponse(likeCount: number): ProductLikeCountResponse {
    return {
      likeCount
    };
  }

  /**
   * Creates a ProductLikeStatusResponse DTO
   */
  static toProductLikeStatusResponse(isLiked: boolean): ProductLikeStatusResponse {
    return {
      isLiked
    };
  }

  /**
   * Converts a ProductLike entity to a basic object
   */
  static toProductLikeObject(like: ProductLike): { productId: string, userId: string, createdAt: string } {
    return {
      productId: like.productId,
      userId: like.userId,
      createdAt: like.createdAt.toISOString()
    };
  }

  /**
   * Creates a ProductLike entity from basic parameters
   */
  static createProductLike(productId: string, userId: string): ProductLike {
    return new ProductLike(productId, userId);
  }

  /**
   * Validates a CreateProductRequest
   */
  static validateCreateProductRequest(request: CreateProductRequest): string[] {
    const errors: string[] = [];

    if (!request.projectId || request.projectId.trim() === '') {
      errors.push('projectId is required and cannot be empty');
    }

    if (request.priceAmount === null || request.priceAmount === undefined) {
      errors.push('priceAmount is required');
    } else if (request.priceAmount < 0) {
      errors.push('priceAmount must be greater than or equal to 0');
    }

    if (!request.priceCurrency || request.priceCurrency.trim() === '') {
      errors.push('priceCurrency is required and cannot be empty');
    }

    if (request.status && !Object.values(ProductStatus).includes(request.status)) {
      errors.push('status must be one of: ' + Object.values(ProductStatus).join(', '));
    }

    return errors;
  }

  /**
   * Validates an UpdateProductRequest
   */
  static validateUpdateProductRequest(request: UpdateProductRequest): string[] {
    const errors: string[] = [];

    if (request.priceAmount !== undefined && request.priceAmount < 0) {
      errors.push('priceAmount must be greater than or equal to 0');
    }

    if (request.priceCurrency !== undefined && request.priceCurrency.trim() === '') {
      errors.push('priceCurrency cannot be empty');
    }

    if (request.status && !Object.values(ProductStatus).includes(request.status)) {
      errors.push('status must be one of: ' + Object.values(ProductStatus).join(', '));
    }

    return errors;
  }

  /**
   * Validates a UUID string
   */
  static validateUUID(uuid: string): boolean {
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
    return uuidRegex.test(uuid);
  }

  /**
   * Validates currency code (basic validation for common currencies)
   */
  static validateCurrencyCode(currency: string): boolean {
    const commonCurrencies = ['PEN', 'USD', 'EUR', 'GBP', 'JPY', 'CAD', 'AUD', 'CHF', 'CNY', 'MXN'];
    return commonCurrencies.includes(currency.toUpperCase());
  }
}
