import { ProductStatus } from './product.entity';

/**
 * Utility class for product-related operations
 */
export class ProductUtils {

  /**
   * Formats a price with currency symbol
   */
  static formatPrice(amount: number, currency: string): string {
    const currencySymbols: { [key: string]: string } = {
      'PEN': 'S/.',
      'USD': '$',
      'EUR': '€',
      'GBP': '£',
      'JPY': '¥',
      'CAD': 'C$',
      'AUD': 'A$',
      'CHF': 'CHF',
      'CNY': '¥',
      'MXN': '$'
    };

    const symbol = currencySymbols[currency.toUpperCase()] || currency;
    return `${symbol} ${amount.toFixed(2)}`;
  }

  /**
   * Gets a human-readable status label
   */
  static getStatusLabel(status: ProductStatus): string {
    const statusLabels: { [key in ProductStatus]: string } = {
      [ProductStatus.AVAILABLE]: 'Available',
      [ProductStatus.UNAVAILABLE]: 'Unavailable',
      [ProductStatus.OUT_OF_STOCK]: 'Out of Stock',
      [ProductStatus.DISCONTINUED]: 'Discontinued'
    };

    return statusLabels[status] || status;
  }

  /**
   * Gets CSS class for product status
   */
  static getStatusClass(status: ProductStatus): string {
    const statusClasses: { [key in ProductStatus]: string } = {
      [ProductStatus.AVAILABLE]: 'status-available',
      [ProductStatus.UNAVAILABLE]: 'status-unavailable',
      [ProductStatus.OUT_OF_STOCK]: 'status-out-of-stock',
      [ProductStatus.DISCONTINUED]: 'status-discontinued'
    };

    return statusClasses[status] || 'status-unknown';
  }

  /**
   * Checks if a product can be purchased
   */
  static canPurchase(status: ProductStatus): boolean {
    return status === ProductStatus.AVAILABLE;
  }

  /**
   * Generates a UUID v4
   */
  static generateUUID(): string {
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
      const r = Math.random() * 16 | 0;
      const v = c === 'x' ? r : (r & 0x3 | 0x8);
      return v.toString(16);
    });
  }

  /**
   * Validates if a string is a valid UUID
   */
  static isValidUUID(uuid: string): boolean {
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
    return uuidRegex.test(uuid);
  }

  /**
   * Validates if a currency code is supported
   */
  static isValidCurrency(currency: string): boolean {
    const supportedCurrencies = ['PEN', 'USD', 'EUR', 'GBP', 'JPY', 'CAD', 'AUD', 'CHF', 'CNY', 'MXN'];
    return supportedCurrencies.includes(currency.toUpperCase());
  }

  /**
   * Truncates text to a specified length
   */
  static truncateText(text: string, maxLength: number): string {
    if (text.length <= maxLength) {
      return text;
    }
    return text.substring(0, maxLength).trim() + '...';
  }

  /**
   * Formats a date to a human-readable string
   */
  static formatDate(date: Date | string): string {
    const dateObj = typeof date === 'string' ? new Date(date) : date;
    return dateObj.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  }

  /**
   * Formats a date and time to a human-readable string
   */
  static formatDateTime(date: Date | string): string {
    const dateObj = typeof date === 'string' ? new Date(date) : date;
    return dateObj.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  }

  /**
   * Gets time elapsed since a date
   */
  static getTimeElapsed(date: Date | string): string {
    const dateObj = typeof date === 'string' ? new Date(date) : date;
    const now = new Date();
    const diffInSeconds = Math.floor((now.getTime() - dateObj.getTime()) / 1000);

    if (diffInSeconds < 60) {
      return 'just now';
    } else if (diffInSeconds < 3600) {
      const minutes = Math.floor(diffInSeconds / 60);
      return `${minutes} minute${minutes > 1 ? 's' : ''} ago`;
    } else if (diffInSeconds < 86400) {
      const hours = Math.floor(diffInSeconds / 3600);
      return `${hours} hour${hours > 1 ? 's' : ''} ago`;
    } else {
      const days = Math.floor(diffInSeconds / 86400);
      return `${days} day${days > 1 ? 's' : ''} ago`;
    }
  }

  /**
   * Sorts products by different criteria
   */
  static sortProducts(products: any[], sortBy: 'name' | 'price' | 'date' | 'likes', order: 'asc' | 'desc' = 'asc'): any[] {
    return [...products].sort((a, b) => {
      let comparison = 0;

      switch (sortBy) {
        case 'name':
          comparison = a.projectTitle.localeCompare(b.projectTitle);
          break;
        case 'price':
          comparison = a.priceAmount - b.priceAmount;
          break;
        case 'date':
          comparison = new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
          break;
        case 'likes':
          comparison = a.likeCount - b.likeCount;
          break;
      }

      return order === 'desc' ? -comparison : comparison;
    });
  }

  /**
   * Filters products by search term
   */
  static filterProducts(products: any[], searchTerm: string): any[] {
    if (!searchTerm) return products;

    const term = searchTerm.toLowerCase();
    return products.filter(product =>
      product.projectTitle.toLowerCase().includes(term) ||
      product.priceCurrency.toLowerCase().includes(term) ||
      product.status.toLowerCase().includes(term)
    );
  }

  /**
   * Gets unique currencies from a list of products
   */
  static getUniqueCurrencies(products: any[]): string[] {
    const currencies = products.map(product => product.priceCurrency);
    return [...new Set(currencies)].sort();
  }

  /**
   * Gets price range from a list of products
   */
  static getPriceRange(products: any[]): { min: number, max: number } {
    if (products.length === 0) return { min: 0, max: 0 };

    const prices = products.map(product => product.priceAmount);
    return {
      min: Math.min(...prices),
      max: Math.max(...prices)
    };
  }
}
