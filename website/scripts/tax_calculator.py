#!/usr/bin/env python3
"""
Tax Calculator Utility

This utility provides functions to calculate PAYG withholding tax amounts
based on the Australian Taxation Office (ATO) guidelines.

Reference: https://www.ato.gov.au/tax-rates-and-codes/payg-withholding-schedule-1-statement-of-formulas-for-calculating-amounts-to-be-withheld/
"""

import math
from typing import Dict, List, Literal, TypedDict, Union

# Type definitions
class TaxCoefficients(TypedDict):
    """
    Tax scale coefficients for different income ranges and tax scenarios
    These coefficients are used in the formula: tax = (a × x) - b
    where x is the weekly earnings
    """
    a: float  # Coefficient a
    b: float  # Coefficient b

class TaxBracket(TypedDict):
    """Tax bracket with upper limit and coefficients"""
    upperLimit: float
    coefficients: TaxCoefficients

# Tax brackets for employees who didn't claim the tax-free threshold
NO_TAX_FREE_THRESHOLD_BRACKETS: List[TaxBracket] = [
    {"upperLimit": 150, "coefficients": {"a": 0.1600, "b": 0.1600}},
    {"upperLimit": 371, "coefficients": {"a": 0.2117, "b": 7.7550}},
    {"upperLimit": 515, "coefficients": {"a": 0.1890, "b": -0.6702}},
    {"upperLimit": 932, "coefficients": {"a": 0.3227, "b": 68.2367}},
    {"upperLimit": 2246, "coefficients": {"a": 0.3200, "b": 65.7202}},
    {"upperLimit": 3303, "coefficients": {"a": 0.3900, "b": 222.9510}},
    {"upperLimit": float('inf'), "coefficients": {"a": 0.4700, "b": 487.2587}},
]

# Tax brackets for employees who claimed the tax-free threshold
TAX_FREE_THRESHOLD_BRACKETS: List[TaxBracket] = [
    {"upperLimit": 361, "coefficients": {"a": 0, "b": 0}},  # No tax for earnings below $361
    {"upperLimit": 500, "coefficients": {"a": 0.1600, "b": 57.8462}},
    {"upperLimit": 625, "coefficients": {"a": 0.2600, "b": 107.8462}},
    {"upperLimit": 721, "coefficients": {"a": 0.1800, "b": 57.8462}},
    {"upperLimit": 865, "coefficients": {"a": 0.1890, "b": 64.3365}},
    {"upperLimit": 1282, "coefficients": {"a": 0.3227, "b": 180.0385}},
    {"upperLimit": 2596, "coefficients": {"a": 0.3200, "b": 176.5769}},
    {"upperLimit": 3653, "coefficients": {"a": 0.3900, "b": 358.3077}},
    {"upperLimit": float('inf'), "coefficients": {"a": 0.4700, "b": 650.6154}},
]

# Tax rates for employees who didn't provide a TFN
NO_TFN_TAX_RATES = {
    "resident": 0.4700,
    "foreignResident": 0.4500,
}

def calculate_weekly_earnings(weekly_income: float, allowances: float = 0) -> float:
    """
    Calculate the weekly earnings for tax calculation purposes
    
    Args:
        weekly_income: The weekly income amount
        allowances: Any additional allowances subject to withholding
    
    Returns:
        The weekly earnings for tax calculation
    """
    # Step 1: Add income and allowances
    total_earnings = weekly_income + allowances
    
    # Step 2: Ignore cents (truncate to whole dollars)
    whole_earnings = math.floor(total_earnings)
    
    # Step 3: Add 99 cents
    weekly_earnings = whole_earnings + 0.99
    
    return weekly_earnings

def calculate_weekly_tax(
    weekly_earnings: float,
    claims_tax_free_threshold: bool = True,
    has_tfn: bool = True,
    is_foreign_resident: bool = False,
    tax_offset_amount: float = 0
) -> float:
    """
    Calculate the weekly tax withholding amount
    
    Args:
        weekly_earnings: The weekly earnings calculated using calculate_weekly_earnings
        claims_tax_free_threshold: Whether the employee claims the tax-free threshold
        has_tfn: Whether the employee has provided a Tax File Number
        is_foreign_resident: Whether the employee is a foreign resident
        tax_offset_amount: The amount of tax offset claimed (if any)
    
    Returns:
        The weekly tax withholding amount
    """
    # If no TFN is provided, apply the no-TFN withholding rate
    if not has_tfn:
        rate = NO_TFN_TAX_RATES["foreignResident"] if is_foreign_resident else NO_TFN_TAX_RATES["resident"]
        return math.floor(weekly_earnings * rate * 100) / 100
    
    # Select the appropriate tax brackets based on tax-free threshold claim
    brackets = TAX_FREE_THRESHOLD_BRACKETS if claims_tax_free_threshold else NO_TAX_FREE_THRESHOLD_BRACKETS
    
    # Find the applicable tax bracket
    bracket = next((b for b in brackets if weekly_earnings < b["upperLimit"]), None)
    
    if not bracket:
        # This should never happen due to the infinity upper limit, but just in case
        return 0
    
    # Apply the formula: tax = (a × x) - b
    a, b = bracket["coefficients"]["a"], bracket["coefficients"]["b"]
    tax = (a * weekly_earnings) - b
    
    # Apply tax offset if applicable (only for scales 2, 5, or 6)
    if claims_tax_free_threshold and tax_offset_amount > 0:
        # Weekly reduction is 1.9% of the total amount claimed
        tax_offset_reduction = tax_offset_amount * 0.019
        tax = max(0, tax - tax_offset_reduction)
    
    # Round down to the nearest cent
    return math.floor(tax * 100) / 100

def calculate_fortnightly_tax(
    fortnightly_earnings: float,
    claims_tax_free_threshold: bool = True,
    has_tfn: bool = True,
    is_foreign_resident: bool = False,
    tax_offset_amount: float = 0
) -> float:
    """
    Calculate the fortnightly tax withholding amount
    
    Args:
        fortnightly_earnings: The fortnightly earnings
        claims_tax_free_threshold: Whether the employee claims the tax-free threshold
        has_tfn: Whether the employee has provided a Tax File Number
        is_foreign_resident: Whether the employee is a foreign resident
        tax_offset_amount: The amount of tax offset claimed (if any)
    
    Returns:
        The fortnightly tax withholding amount
    """
    # Convert fortnightly earnings to weekly
    weekly_earnings = calculate_weekly_earnings(fortnightly_earnings / 2)
    
    # Calculate weekly tax
    weekly_tax = calculate_weekly_tax(
        weekly_earnings,
        claims_tax_free_threshold,
        has_tfn,
        is_foreign_resident,
        tax_offset_amount
    )
    
    # Double the weekly tax to get fortnightly tax
    return weekly_tax * 2

def calculate_monthly_tax(
    monthly_earnings: float,
    claims_tax_free_threshold: bool = True,
    has_tfn: bool = True,
    is_foreign_resident: bool = False,
    tax_offset_amount: float = 0
) -> float:
    """
    Calculate the monthly tax withholding amount
    
    Args:
        monthly_earnings: The monthly earnings
        claims_tax_free_threshold: Whether the employee claims the tax-free threshold
        has_tfn: Whether the employee has provided a Tax File Number
        is_foreign_resident: Whether the employee is a foreign resident
        tax_offset_amount: The amount of tax offset claimed (if any)
    
    Returns:
        The monthly tax withholding amount
    """
    # Convert monthly earnings to weekly (divide by 52 and multiply by 12)
    weekly_earnings = calculate_weekly_earnings(monthly_earnings * 12 / 52)
    
    # Calculate weekly tax
    weekly_tax = calculate_weekly_tax(
        weekly_earnings,
        claims_tax_free_threshold,
        has_tfn,
        is_foreign_resident,
        tax_offset_amount
    )
    
    # Multiply weekly tax by 52 and divide by 12 to get monthly tax
    return weekly_tax * 52 / 12

def calculate_tax(
    earnings: float,
    pay_period: Literal['weekly', 'fortnightly', 'monthly'],
    claims_tax_free_threshold: bool = True,
    has_tfn: bool = True,
    is_foreign_resident: bool = False,
    tax_offset_amount: float = 0
) -> float:
    """
    Calculate the tax for a specific pay period
    
    Args:
        earnings: The earnings for the pay period
        pay_period: The pay period type ('weekly', 'fortnightly', 'monthly')
        claims_tax_free_threshold: Whether the employee claims the tax-free threshold
        has_tfn: Whether the employee has provided a Tax File Number
        is_foreign_resident: Whether the employee is a foreign resident
        tax_offset_amount: The amount of tax offset claimed (if any)
    
    Returns:
        The tax withholding amount for the specified pay period
    """
    if pay_period == 'weekly':
        return calculate_weekly_tax(
            calculate_weekly_earnings(earnings),
            claims_tax_free_threshold,
            has_tfn,
            is_foreign_resident,
            tax_offset_amount
        )
    elif pay_period == 'fortnightly':
        return calculate_fortnightly_tax(
            earnings,
            claims_tax_free_threshold,
            has_tfn,
            is_foreign_resident,
            tax_offset_amount
        )
    elif pay_period == 'monthly':
        return calculate_monthly_tax(
            earnings,
            claims_tax_free_threshold,
            has_tfn,
            is_foreign_resident,
            tax_offset_amount
        )
    else:
        raise ValueError(f"Unsupported pay period: {pay_period}")

if __name__ == "__main__":
    # Example usage
    print("Weekly tax on $1000 (with tax-free threshold):", 
          calculate_tax(1000, 'weekly', True))
    
    print("Weekly tax on $1000 (without tax-free threshold):", 
          calculate_tax(1000, 'weekly', False))
    
    print("Fortnightly tax on $2000 (with tax-free threshold):", 
          calculate_tax(2000, 'fortnightly', True))
    
    print("Monthly tax on $4333 (with tax-free threshold):", 
          calculate_tax(4333, 'monthly', True))
