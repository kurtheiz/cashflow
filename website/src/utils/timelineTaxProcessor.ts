/**
 * Timeline Tax Processor
 * 
 * This utility provides functions to process timeline data and apply tax calculations
 * to pay dates before they are displayed in the Timeline component.
 */

import { TimelineData, PayDate, Employer } from './shiftCalculator';
import { calculateTax } from './taxCalculator';

/**
 * Process timeline data and apply tax calculations to pay dates
 * 
 * @param timelineData The timeline data from shiftCalculator
 * @param employers List of employers with tax settings
 * @returns The processed timeline data with tax calculations applied
 */
export const applyTaxesToTimeline = (
  timelineData: TimelineData,
  employers: Employer[]
): TimelineData => {
  // Create a new copy of the timeline data to avoid modifying the original
  const processedData: TimelineData = {
    shifts: [...timelineData.shifts],
    payDates: timelineData.payDates.map(payDate => ({...payDate}))
  };
  
  // Apply tax calculations to each pay date
  processedData.payDates.forEach(payDate => {
    // Skip processing if the amount is zero
    if (payDate.amount === 0) {
      payDate.tax = 0;
      payDate.netPay = 0;
      return;
    }
    
    // Find the employer for this pay date
    const employer = employers.find(emp => emp.id === payDate.employerId);
    if (!employer) {
      console.warn(`Employer not found for pay date: ${payDate.date} (${payDate.employerId})`);
      payDate.tax = 0;
      payDate.netPay = payDate.amount;
      return;
    }
    
    // Determine pay period type based on employer settings
    const payPeriod = employer.paycycle === 'weekly' ? 'weekly' :
                     employer.paycycle === 'fortnightly' ? 'fortnightly' : 'monthly';
    
    // Get tax-free threshold setting from employer or default to true
    const claimsTaxFreeThreshold = employer.taxFreeThreshold !== undefined 
      ? employer.taxFreeThreshold 
      : true;
    
    // Calculate tax
    payDate.tax = calculateTax(
      payDate.amount,
      payPeriod,
      claimsTaxFreeThreshold,
      true, // Assuming TFN is provided
      false, // Assuming not a foreign resident
      0 // Assuming no tax offset
    );
    
    // Calculate net pay after tax
    payDate.netPay = payDate.amount - payDate.tax;
  });
  
  return processedData;
};

/**
 * Calculate and format tax summary information for display
 * 
 * @param payDate The pay date to generate a tax summary for
 * @returns Formatted tax summary information
 */
export const getTaxSummary = (payDate: PayDate): {
  grossPay: string;
  tax: string;
  netPay: string;
  taxPercentage: string;
} => {
  // Default values if payDate is undefined or amount is zero
  if (!payDate || payDate.amount === 0) {
    return {
      grossPay: '$0.00',
      tax: '$0.00',
      netPay: '$0.00',
      taxPercentage: '0%'
    };
  }
  
  // Format currency values with commas
  const formatCurrency = (value: number) => {
    return `$${value.toLocaleString('en-US', { 
      minimumFractionDigits: 2, 
      maximumFractionDigits: 2 
    })}`;
  };
  
  // Calculate tax percentage
  const taxPercentage = payDate.amount > 0 
    ? (payDate.tax / payDate.amount) * 100 
    : 0;
  
  return {
    grossPay: formatCurrency(payDate.amount),
    tax: formatCurrency(payDate.tax),
    netPay: formatCurrency(payDate.netPay),
    taxPercentage: `${taxPercentage.toFixed(1)}%`
  };
};
