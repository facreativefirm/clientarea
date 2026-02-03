import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface CartItem {
    cartId?: string; // Truly unique ID for this instance in cart
    id: string;      // Product ID or 'dom-...' identifying the type
    name: string;
    type: 'HOSTING' | 'DOMAIN' | 'SSL' | 'OTHER';
    price: number;
    setupFee?: number;
    billingCycle: string;
    domainName?: string;
    quantity: number;
    config?: Record<string, any>;
    // Optional pricing details for cycle switching
    monthlyPrice?: number;
    annualPrice?: number;
}

interface PromoDetails {
    code: string;
    type: 'percentage' | 'fixed';
    value: number;
    recurrence?: number;
}

interface CartState {
    items: CartItem[];
    promoDetails: PromoDetails | null;
    promoCode: string | null; // Keep for backward compat access if needed
    addItem: (item: CartItem) => void;
    removeItem: (cartId: string) => void;
    updateItem: (cartId: string, updates: Partial<CartItem>) => void;
    updateDomainName: (cartId: string, domainName: string) => void;
    clearCart: () => void;
    applyPromo: (details: PromoDetails | null) => void;
    setPromoCode: (code: string | null) => void; // Deprecated, wraps applyPromo
    total: () => number;
}

export const useCartStore = create<CartState>()(
    persist(
        (set, get) => ({
            items: [],
            promoDetails: null,
            promoCode: null,
            addItem: (item: CartItem) => set((state) => ({
                items: [...state.items, {
                    ...item,
                    cartId: `${item.id}-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`,
                    price: typeof item.price === 'string' ? parseFloat(item.price) : item.price,
                    quantity: item.quantity || 1
                }]
            })),
            removeItem: (cartId) => set((state) => ({ items: state.items.filter((i) => i.cartId !== cartId) })),
            updateItem: (cartId, updates) => set((state) => ({
                items: state.items.map((i) => {
                    if (i.cartId === cartId) {
                        const updated = { ...i, ...updates };
                        // Ensure price is number if updated
                        if (updates.price) {
                            updated.price = typeof updates.price === 'string' ? parseFloat(updates.price as string) : updates.price;
                        }
                        return updated;
                    }
                    return i;
                })
            })),
            updateDomainName: (cartId: string, domainName: string) => set((state) => ({
                items: state.items.map(i => i.cartId === cartId ? { ...i, domainName } : i)
            })),
            clearCart: () => set({ items: [], promoDetails: null, promoCode: null }),
            applyPromo: (details) => set({ promoDetails: details, promoCode: details?.code || null }),
            setPromoCode: (code) => {
                // Legacy support - try to clear if null
                if (!code) set({ promoDetails: null, promoCode: null });
            },
            total: () => {
                let subtotal = get().items.reduce((acc, item) => {
                    const price = typeof item.price === 'string' ? parseFloat(item.price) : (item.price || 0);
                    const setupFee = typeof item.setupFee === 'string' ? parseFloat(item.setupFee) : (item.setupFee || 0);
                    return acc + (price * (item.quantity || 1)) + setupFee;
                }, 0);

                const promo = get().promoDetails;
                if (promo) {
                    if (promo.type === 'percentage') {
                        subtotal = subtotal * (1 - (promo.value / 100));
                    } else if (promo.type === 'fixed') {
                        subtotal = Math.max(0, subtotal - promo.value);
                    }
                }

                return subtotal;
            },
        }),
        {
            name: 'whmcs-cart',
        }
    )
);
