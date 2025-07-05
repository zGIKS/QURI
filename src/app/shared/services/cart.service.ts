import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';

export interface CartItem {
  productId: string;
  addedAt: Date;
}

@Injectable({
  providedIn: 'root'
})
export class CartService {
  private readonly CART_STORAGE_KEY = 'quri_shopping_cart';
  private cartItemsSubject = new BehaviorSubject<CartItem[]>([]);

  constructor() {
    this.loadCartFromStorage();
  }

  /**
   * Get cart items as observable
   */
  get cartItems$(): Observable<CartItem[]> {
    return this.cartItemsSubject.asObservable();
  }

  /**
   * Get current cart items
   */
  get cartItems(): CartItem[] {
    return this.cartItemsSubject.value;
  }

  /**
   * Get cart items count
   */
  get cartCount(): number {
    return this.cartItems.length;
  }

  /**
   * Add product to cart
   */
  addToCart(productId: string): boolean {
    try {
      const currentItems = this.cartItems;

      // Check if product is already in cart
      if (this.isInCart(productId)) {
        console.log('Product already in cart:', productId);
        return false;
      }

      // Add new item to cart
      const newItem: CartItem = {
        productId: productId,
        addedAt: new Date()
      };

      const updatedItems = [...currentItems, newItem];
      this.updateCart(updatedItems);

      console.log('✅ Product added to cart:', productId);
      return true;
    } catch (error) {
      console.error('Error adding product to cart:', error);
      return false;
    }
  }

  /**
   * Remove product from cart
   */
  removeFromCart(productId: string): boolean {
    try {
      const currentItems = this.cartItems;
      const updatedItems = currentItems.filter(item => item.productId !== productId);

      this.updateCart(updatedItems);
      console.log('✅ Product removed from cart:', productId);
      return true;
    } catch (error) {
      console.error('Error removing product from cart:', error);
      return false;
    }
  }

  /**
   * Check if product is in cart
   */
  isInCart(productId: string): boolean {
    return this.cartItems.some(item => item.productId === productId);
  }

  /**
   * Clear entire cart
   */
  clearCart(): void {
    try {
      this.updateCart([]);
      console.log('✅ Cart cleared');
    } catch (error) {
      console.error('Error clearing cart:', error);
    }
  }

  /**
   * Get cart items as product IDs array
   */
  getCartProductIds(): string[] {
    return this.cartItems.map(item => item.productId);
  }

  /**
   * Get cart summary
   */
  getCartSummary(): { count: number, productIds: string[], lastUpdated: Date | null } {
    const items = this.cartItems;
    return {
      count: items.length,
      productIds: items.map(item => item.productId),
      lastUpdated: items.length > 0 ? new Date(Math.max(...items.map(item => item.addedAt.getTime()))) : null
    };
  }

  /**
   * Load cart from localStorage
   */
  private loadCartFromStorage(): void {
    try {
      const storedCart = localStorage.getItem(this.CART_STORAGE_KEY);
      if (storedCart) {
        const parsedCart: CartItem[] = JSON.parse(storedCart);
        // Convert addedAt strings back to Date objects
        const cartWithDates = parsedCart.map(item => ({
          ...item,
          addedAt: new Date(item.addedAt)
        }));
        this.cartItemsSubject.next(cartWithDates);
        console.log('📦 Cart loaded from storage:', cartWithDates.length, 'items');
      }
    } catch (error) {
      console.error('Error loading cart from storage:', error);
      this.cartItemsSubject.next([]);
    }
  }

  /**
   * Save cart to localStorage
   */
  private saveCartToStorage(items: CartItem[]): void {
    try {
      localStorage.setItem(this.CART_STORAGE_KEY, JSON.stringify(items));
      console.log('💾 Cart saved to storage:', items.length, 'items');
    } catch (error) {
      console.error('Error saving cart to storage:', error);
    }
  }

  /**
   * Update cart and save to storage
   */
  private updateCart(items: CartItem[]): void {
    this.cartItemsSubject.next(items);
    this.saveCartToStorage(items);
  }
}
