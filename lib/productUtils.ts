
export interface DisplayPrice {
    price: number;
    cycle: string;
    label: string;
    billingCycle: string;
}

export function getProductDisplayPrice(product: any): DisplayPrice {
    const monthly = Number(product.monthlyPrice || 0);
    const quarterly = Number(product.quarterlyPrice || 0);
    const semiAnnual = Number(product.semiAnnualPrice || 0);
    const annual = Number(product.annualPrice || 0);
    const biennial = Number(product.biennialPrice || 0);
    const triennial = Number(product.triennialPrice || 0);

    // If monthly is available and > 0, use it
    if (monthly > 0) {
        return { price: monthly, cycle: "mo", label: "Monthly", billingCycle: "MONTHLY" };
    }

    // Otherwise, check others in order of preference (preferring yearly)
    if (annual > 0) {
        return { price: annual, cycle: "yr", label: "Annually", billingCycle: "ANNUALLY" };
    }

    // Domain specific fallback: many domains only have registrationPrice in domainProduct
    if (product.productType === 'DOMAIN' && product.domainProduct?.registrationPrice) {
        const regPrice = Number(product.domainProduct.registrationPrice);
        if (regPrice > 0) {
            return { price: regPrice, cycle: "yr", label: "Annually", billingCycle: "ANNUALLY" };
        }
    }

    if (quarterly > 0) {
        return { price: quarterly, cycle: "qtr", label: "Quarterly", billingCycle: "QUARTERLY" };
    }

    if (semiAnnual > 0) {
        return { price: semiAnnual, cycle: "6mo", label: "Semi-Annually", billingCycle: "SEMI_ANNUALLY" };
    }

    if (biennial > 0) {
        return { price: biennial, cycle: "2yr", label: "Biennially", billingCycle: "BIENNIALLY" };
    }

    if (triennial > 0) {
        return { price: triennial, cycle: "3yr", label: "Triennially", billingCycle: "TRIENNIALLY" };
    }

    // Fallback to generic price
    const generic = Number(product.price || 0);
    return { price: generic, cycle: "mo", label: "Monthly", billingCycle: "MONTHLY" };
}

export function calculateCartPrice(product: any, billingCycle: string): number {
    const cycle = billingCycle?.toUpperCase();

    // Domain specific price resolution
    if (product.productType === 'DOMAIN' && product.domainProduct?.registrationPrice) {
        const regPrice = Number(product.domainProduct.registrationPrice);
        if (regPrice > 0) {
            // For now, domains are usually treated as annual or multi-year.
            // If the user selected ANNUALLY and standard annualPrice is 0, use regPrice.
            if (cycle === 'ANNUALLY' && Number(product.annualPrice || 0) === 0) {
                return regPrice;
            }
            // If it's a domain and they have no other price, always return regPrice regardless of cycle string
            if (Number(product.monthlyPrice || 0) === 0 && Number(product.annualPrice || 0) === 0) {
                return regPrice;
            }
        }
    }

    switch (cycle) {
        case 'MONTHLY': return Number(product.monthlyPrice || product.price || 0);
        case 'QUARTERLY': return Number(product.quarterlyPrice || 0);
        case 'SEMI_ANNUALLY': return Number(product.semiAnnualPrice || 0);
        case 'ANNUALLY': return Number(product.annualPrice || 0);
        case 'BIENNIALLY': return Number(product.biennialPrice || 0);
        case 'TRIENNIALLY': return Number(product.triennialPrice || 0);
        default: return Number(product.monthlyPrice || product.price || 0);
    }
}
