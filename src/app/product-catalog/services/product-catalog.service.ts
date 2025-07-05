import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError, map, switchMap } from 'rxjs/operators';
import { environment } from '../../../environments/environment';
import { ProductResponse, ProductLikeResponse, ProductLikeCountResponse, ProductLikeStatusResponse, CreateProductResponse, UpdateProductResponse } from './product.response';
import { CreateProductRequest, UpdateProductRequest, GetProductsRequest } from './product.request';

/**
 * Service for handling product catalog operations
 */
@Injectable({
  providedIn: 'root'
})
export class ProductCatalogService {
  private readonly baseUrl = `${environment.serverBaseUrl}/api/v1/products`;

  constructor(
    private http: HttpClient
  ) {}

  /**
   * Gets all products, optionally filtered by project ID
   */
  getProducts(request?: GetProductsRequest): Observable<ProductResponse[]> {
    let params = new HttpParams();

    if (request?.projectId) {
      params = params.set('projectId', request.projectId);
    }

    return this.http.get<ProductResponse[]>(this.baseUrl, { params })
      .pipe(
        catchError(this.handleError)
      );
  }

  /**
   * Gets a specific product by ID
   */
  getProductById(productId: string): Observable<ProductResponse> {
    return this.http.get<ProductResponse>(`${this.baseUrl}/${productId}`)
      .pipe(
        catchError(this.handleError)
      );
  }

  /**
   * Creates a new product
   */
  createProduct(request: CreateProductRequest): Observable<CreateProductResponse> {
    console.log('🛒 Creating product for project:', request.projectId);

    return this.http.post<CreateProductResponse>(this.baseUrl, request)
      .pipe(
        map((productResponse: CreateProductResponse) => {
          console.log('✅ Product created successfully:', productResponse);
          return productResponse;
        }),
        catchError(this.handleError)
      );
  }

  /**
   * Updates an existing product
   */
  updateProduct(productId: string, request: UpdateProductRequest): Observable<UpdateProductResponse> {
    return this.http.patch<UpdateProductResponse>(`${this.baseUrl}/${productId}`, request)
      .pipe(
        catchError(this.handleError)
      );
  }

  /**
   * Deletes a product
   */
  deleteProduct(productId: string): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/${productId}`)
      .pipe(
        catchError(this.handleError)
      );
  }

  /**
   * Adds a like to a product
   */
  likeProduct(productId: string, userId: string): Observable<ProductLikeResponse> {
    return this.http.post<ProductLikeResponse>(`${this.baseUrl}/${productId}/likes/${userId}`, {})
      .pipe(
        catchError(this.handleError)
      );
  }

  /**
   * Removes a like from a product
   */
  unlikeProduct(productId: string, userId: string): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/${productId}/likes/${userId}`)
      .pipe(
        catchError(this.handleError)
      );
  }

  /**
   * Gets the like count for a product
   */
  getProductLikeCount(productId: string): Observable<ProductLikeCountResponse> {
    return this.http.get<ProductLikeCountResponse>(`${this.baseUrl}/${productId}/likes/count`)
      .pipe(
        catchError(this.handleError)
      );
  }

  /**
   * Checks if a user has liked a product
   */
  isProductLikedByUser(productId: string, userId: string): Observable<ProductLikeStatusResponse> {
    return this.http.get<ProductLikeStatusResponse>(`${this.baseUrl}/${productId}/likes/${userId}`)
      .pipe(
        catchError(this.handleError)
      );
  }

  /**
   * Gets products by user ID (helper method)
   */
  getProductsByUserId(userId: string): Observable<ProductResponse[]> {
    return this.getProducts().pipe(
      map(products => products.filter(product => product.projectUserId === userId))
    );
  }

  /**
   * Gets available products only (helper method)
   */
  getAvailableProducts(): Observable<ProductResponse[]> {
    return this.getProducts().pipe(
      map(products => products.filter(product => product.status === 'AVAILABLE'))
    );
  }

  /**
   * Searches products by title (helper method)
   */
  searchProductsByTitle(title: string): Observable<ProductResponse[]> {
    return this.getProducts().pipe(
      map(products => products.filter(product =>
        product.projectTitle.toLowerCase().includes(title.toLowerCase())
      ))
    );
  }

  /**
   * Toggles like status for a product
   */
  toggleProductLike(productId: string, userId: string): Observable<{ isLiked: boolean, likeCount: number }> {
    return this.isProductLikedByUser(productId, userId).pipe(
      switchMap((status: ProductLikeStatusResponse) => {
        if (status.isLiked) {
          return this.unlikeProduct(productId, userId).pipe(
            switchMap(() => this.getProductLikeCount(productId)),
            map((count: ProductLikeCountResponse) => ({ isLiked: false, likeCount: count.likeCount }))
          );
        } else {
          return this.likeProduct(productId, userId).pipe(
            switchMap(() => this.getProductLikeCount(productId)),
            map((count: ProductLikeCountResponse) => ({ isLiked: true, likeCount: count.likeCount }))
          );
        }
      })
    );
  }

  /**
   * Handles HTTP errors
   */
  private handleError(error: any): Observable<never> {
    console.error('ProductCatalogService error:', error);

    let errorMessage = 'An error occurred';

    if (error.error instanceof ErrorEvent) {
      // Client-side error
      errorMessage = `Error: ${error.error.message}`;
    } else {
      // Server-side error
      if (error.error && error.error.message) {
        errorMessage = error.error.message;
      } else if (error.message) {
        errorMessage = error.message;
      } else {
        errorMessage = `Error Code: ${error.status}\nMessage: ${error.message}`;
      }
    }

    return throwError(() => new Error(errorMessage));
  }
}
