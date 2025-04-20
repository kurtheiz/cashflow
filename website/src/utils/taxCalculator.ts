/**
 * Tax Calculator Utility
 * 
 * This utility provides functions to calculate PAYG withholding tax amounts
 * based on the Australian Taxation Office (ATO) guidelines.
 * 
 * Reference: https://www.ato.gov.au/tax-rates-and-codes/payg-withholding-schedule-1-statement-of-formulas-for-calculating-amounts-to-be-withheld/
 */

/**
 * Tax scale coefficients for different income ranges and tax scenarios
 * These coefficients are used in the formula: tax = (a × x) - b
 * where x is the weekly earnings
 */
interface TaxCoefficients {
  a: number; // Coefficient a
  b: number; // Coefficient b
}

/**
 * Tax brackets for employees who didn't claim the tax-free threshold
 */
const NO_TAX_FREE_THRESHOLD_BRACKETS: Array<{
  upperLimit: number;
  coefficients: TaxCoefficients;
}> = [
  { upperLimit: 150, coefficients: { a: 0.1600, b: 0.1600 } },
  { upperLimit: 371, coefficients: { a: 0.2117, b: 7.7550 } },
  { upperLimit: 515, coefficients: { a: 0.1890, b: -0.6702 } },
  { upperLimit: 932, coefficients: { a: 0.3227, b: 68.2367 } },
  { upperLimit: 2246, coefficients: { a: 0.3200, b: 65.7202 } },
  { upperLimit: 3303, coefficients: { a: 0.3900, b: 222.9510 } },
  { upperLimit: Infinity, coefficients: { a: 0.4700, b: 487.2587 } },
];

/**
 * Tax brackets for employees who claimed the tax-free threshold
 */
const TAX_FREE_THRESHOLD_BRACKETS: Array<{
  upperLimit: number;
  coefficients: TaxCoefficients;
}> = [
  { upperLimit: 361, coefficients: { a: 0, b: 0 } }, // No tax for earnings below $361
  { upperLimit: 500, coefficients: { a: 0.1600, b: 57.8462 } },
  { upperLimit: 625, coefficients: { a: 0.2600, b: 107.8462 } },
  { upperLimit: 721, coefficients: { a: 0.1800, b: 57.8462 } },
  { upperLimit: 865, coefficients: { a: 0.1890, b: 64.3365 } },
  { upperLimit: 1282, coefficients: { a: 0.3227, b: 180.0385 } },
  { upperLimit: 2596, coefficients: { a: 0.3200, b: 176.5769 } },
  { upperLimit: 3653, coefficients: { a: 0.3900, b: 358.3077 } },
  { upperLimit: Infinity, coefficients: { a: 0.4700, b: 650.6154 } },
];

/**
 * Tax rates for employees who didn't provide a TFN
 */
const NO_TFN_TAX_RATES = {
  resident: 0.4700,
  foreignResident: 0.4500,
};

/**
 * Calculate the weekly earnings for tax calculation purposes
 * @param weeklyIncome The weekly income amount
 * @param allowances Any additional allowances subject to withholding
 * @returns The weekly earnings for tax calculation
 */
export const calculateWeeklyEarnings = (
  weeklyIncome: number,
  allowances: number = 0
): number => {
  // Step 1: Add income and allowances
  const totalEarnings = weeklyIncome + allowances;
  
  // Step 2: Ignore cents (truncate to whole dollars)
  const wholeEarnings = Math.floor(totalEarnings);
  
  // Step 3: Add 99 cents
  const weeklyEarnings = wholeEarnings + 0.99;
  
  return weeklyEarnings;
};

/**
 * Calculate the weekly tax withholding amount
 * @param weeklyEarnings The weekly earnings calculated using calculateWeeklyEarnings
 * @param claimsTaxFreeThreshold Whether the employee claims the tax-free threshold
 * @param hasTFN Whether the employee has provided a Tax File Number
 * @param isForeignResident Whether the employee is a foreign resident
 * @param taxOffsetAmount The amount of tax offset claimed (if any)
 * @returns The weekly tax withholding amount
 */
export const calculateWeeklyTax = (
  weeklyEarnings: number,
  claimsTaxFreeThreshold: boolean = true,
  hasTFN: boolean = true,
  isForeignResident: boolean = false,
  taxOffsetAmount: number = 0
): number => {
  // If no TFN is provided, apply the no-TFN withholding rate
  if (!hasTFN) {
    const rate = isForeignResident 
      ? NO_TFN_TAX_RATES.foreignResident 
      : NO_TFN_TAX_RATES.resident;
    return Math.floor(weeklyEarnings * rate * 100) / 100;
  }

  // Select the appropriate tax brackets based on tax-free threshold claim
  const brackets = claimsTaxFreeThreshold
    ? TAX_FREE_THRESHOLD_BRACKETS
    : NO_TAX_FREE_THRESHOLD_BRACKETS;

  // Find the applicable tax bracket
  const bracket = brackets.find(b => weeklyEarnings < b.upperLimit);
  
  if (!bracket) {
    // This should never happen due to the Infinity upper limit, but just in case
    return 0;
  }

  // Apply the formula: tax = (a × x) - b
  const { a, b } = bracket.coefficients;
  let tax = (a * weeklyEarnings) - b;
  
  // Apply tax offset if applicable (only for scales 2, 5, or 6)
  if (claimsTaxFreeThreshold && taxOffsetAmount > 0) {
    // Weekly reduction is 1.9% of the total amount claimed
    const taxOffsetReduction = taxOffsetAmount * 0.019;
    tax = Math.max(0, tax - taxOffsetReduction);
  }
  
  // Round down to the nearest cent
  return Math.floor(tax * 100) / 100;
};

/**
 * Calculate the fortnightly tax withholding amount
 * @param fortnightlyEarnings The fortnightly earnings
 * @param claimsTaxFreeThreshold Whether the employee claims the tax-free threshold
 * @param hasTFN Whether the employee has provided a Tax File Number
 * @param isForeignResident Whether the employee is a foreign resident
 * @param taxOffsetAmount The amount of tax offset claimed (if any)
 * @returns The fortnightly tax withholding amount
 */
export const calculateFortnightlyTax = (
  fortnightlyEarnings: number,
  claimsTaxFreeThreshold: boolean = true,
  hasTFN: boolean = true,
  isForeignResident: boolean = false,
  taxOffsetAmount: number = 0
): number => {
  // Convert fortnightly earnings to weekly
  const weeklyEarnings = calculateWeeklyEarnings(fortnightlyEarnings / 2);
  
  // Calculate weekly tax
  const weeklyTax = calculateWeeklyTax(
    weeklyEarnings,
    claimsTaxFreeThreshold,
    hasTFN,
    isForeignResident,
    taxOffsetAmount
  );
  
  // Double the weekly tax to get fortnightly tax
  return weeklyTax * 2;
};

/**
 * Calculate the monthly tax withholding amount
 * @param monthlyEarnings The monthly earnings
 * @param claimsTaxFreeThreshold Whether the employee claims the tax-free threshold
 * @param hasTFN Whether the employee has provided a Tax File Number
 * @param isForeignResident Whether the employee is a foreign resident
 * @param taxOffsetAmount The amount of tax offset claimed (if any)
 * @returns The monthly tax withholding amount
 */
export const calculateMonthlyTax = (
  monthlyEarnings: number,
  claimsTaxFreeThreshold: boolean = true,
  hasTFN: boolean = true,
  isForeignResident: boolean = false,
  taxOffsetAmount: number = 0
): number => {
  // Convert monthly earnings to weekly (divide by 52 and multiply by 12)
  const weeklyEarnings = calculateWeeklyEarnings(monthlyEarnings * 12 / 52);
  
  // Calculate weekly tax
  const weeklyTax = calculateWeeklyTax(
    weeklyEarnings,
    claimsTaxFreeThreshold,
    hasTFN,
    isForeignResident,
    taxOffsetAmount
  );
  
  // Multiply weekly tax by 52 and divide by 12 to get monthly tax
  return weeklyTax * 52 / 12;
};

/**
 * Calculate the tax for a specific pay period
 * @param earnings The earnings for the pay period
 * @param payPeriod The pay period type ('weekly', 'fortnightly', 'monthly')
 * @param claimsTaxFreeThreshold Whether the employee claims the tax-free threshold
 * @param hasTFN Whether the employee has provided a Tax File Number
 * @param isForeignResident Whether the employee is a foreign resident
 * @param taxOffsetAmount The amount of tax offset claimed (if any)
 * @returns The tax withholding amount for the specified pay period
 */
export const calculateTax = (
  earnings: number,
  payPeriod: 'weekly' | 'fortnightly' | 'monthly',
  claimsTaxFreeThreshold: boolean = true,
  hasTFN: boolean = true,
  isForeignResident: boolean = false,
  taxOffsetAmount: number = 0
): number => {
  switch (payPeriod) {
    case 'weekly':
      return calculateWeeklyTax(
        calculateWeeklyEarnings(earnings),
        claimsTaxFreeThreshold,
        hasTFN,
        isForeignResident,
        taxOffsetAmount
      );
    case 'fortnightly':
      return calculateFortnightlyTax(
        earnings,
        claimsTaxFreeThreshold,
        hasTFN,
        isForeignResident,
        taxOffsetAmount
      );
    case 'monthly':
      return calculateMonthlyTax(
        earnings,
        claimsTaxFreeThreshold,
        hasTFN,
        isForeignResident,
        taxOffsetAmount
      );
    default:
      throw new Error(`Unsupported pay period: ${payPeriod}`);
  }
};
