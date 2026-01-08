// Configuration constants for Indian Tax System
export const GST_CONFIG = {
  GST_RATE: 0.18, // 18% standard rate for eyewear
  SELLER_STATE: 'Telangana', // Seller's registered state
  SELLER_GSTIN: '36ABCDE1234F1Z5',
  HSN_CODE: '9003', // HSN for Spectacles/Frames
  PAN: 'ABCDE1234F'
};

export interface TaxBreakdown {
  taxableAmount: number;
  gstAmount: number;
  totalAmount: number;
  cgst: number;
  sgst: number;
  igst: number;
  isInterState: boolean;
  rate: number;
}

/**
 * Calculates GST breakdown based on buyer's state.
 * Returns amounts rounded to 2 decimal places.
 */
export const calculateGST = (totalAmount: number, buyerState: string = ''): TaxBreakdown => {
  // Extract base amount from inclusive total: Total = Base * (1 + Rate)
  const taxableAmount = totalAmount / (1 + GST_CONFIG.GST_RATE);
  const gstAmount = totalAmount - taxableAmount;
  
  // Determine if Inter-state or Intra-state
  // Simple string check - in prod use state codes
  const isInterState = buyerState.toLowerCase().trim() !== GST_CONFIG.SELLER_STATE.toLowerCase().trim();

  let cgst = 0, sgst = 0, igst = 0;

  if (isInterState) {
    igst = gstAmount;
  } else {
    cgst = gstAmount / 2;
    sgst = gstAmount / 2;
  }

  return {
    taxableAmount: Number(taxableAmount.toFixed(2)),
    gstAmount: Number(gstAmount.toFixed(2)),
    totalAmount: Number(totalAmount.toFixed(2)), // Should match input
    cgst: Number(cgst.toFixed(2)),
    sgst: Number(sgst.toFixed(2)),
    igst: Number(igst.toFixed(2)),
    isInterState,
    rate: GST_CONFIG.GST_RATE * 100
  };
};

export const formatCurrency = (amount: number) => {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    minimumFractionDigits: 2
  }).format(amount);
};
