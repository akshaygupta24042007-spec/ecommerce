export function createWhatsAppLink(
  phoneNumber: string,
  message: string
): string {
  // Ensure the phone number is E.164 formatted by stripping non-numeric characters (except leading +)
  let cleanNumber = phoneNumber.replace(/[^\d+]/g, '');
  if (!cleanNumber.startsWith('+')) {
    cleanNumber = '+' + cleanNumber;
  }
  
  // Remove the + for the wa.me link
  const waNumber = cleanNumber.replace('+', '');
  
  const encodedMessage = encodeURIComponent(message);
  return `https://wa.me/${waNumber}?text=${encodedMessage}`;
}

export function createInstagramLink(username: string): string {
  const isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);
  if (isMobile) {
    return `instagram://user?username=${username}`;
  }
  return `https://www.instagram.com/${username}`;
}

export function generateOrderMessage(
  productName: string,
  productUrl: string,
  variant?: string,
  prefix?: string,
  suffix?: string
): string {
  const parts = [];
  
  if (prefix) parts.push(prefix, '\n');
  else parts.push('Hello, I would like to place an order:\n\n');
  
  parts.push(`Product: ${productName}\n`);
  if (variant) parts.push(`Variant: ${variant}\n`);
  parts.push(`Quantity: 1\n`);
  parts.push(`Link: ${productUrl}\n\n`);
  
  if (suffix) parts.push(suffix);
  else parts.push('Please confirm availability and share payment/delivery details. Thank you!');

  return parts.join('');
}

import type { CartItem } from '../lib/store';

export function generateCartOrderMessage(
  cartItems: CartItem[],
  prefix?: string,
  suffix?: string
): string {
  const parts = [];
  
  if (prefix) parts.push(prefix, '\n');
  else parts.push('Hello, I would like to place an order from your store:\n\n');
  
  cartItems.forEach((item, index) => {
    parts.push(`${index + 1}. ${item.product.name}`);
    if (item.variant) parts.push(` - ${item.variant.variant_group}: ${item.variant.name}`);
    parts.push(`\n   ${item.quantity}x\n`);
    const shopUrl = window.location.origin + `/product/${item.product.slug || item.product.id}`;
    parts.push(`   Link: ${shopUrl}\n\n`);
  });

  if (suffix) parts.push('\n' + suffix);
  else parts.push('\nPlease confirm availability and share payment/delivery details. Thank you!');

  return parts.join('');
}
