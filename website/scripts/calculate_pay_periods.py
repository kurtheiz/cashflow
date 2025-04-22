#!/usr/bin/env python3
"""
Calculate Pay Periods

This script aggregates pay period totals from pre-calculated shift data.
It reads data from:
- shiftspay.json: Contains processed shift information with pay details
- payperiods.json: Contains pay period information for each employer

The script updates the payperiods.json file with:
- Shifts that fall within each pay period
- Total hours worked in the pay period (sum of hoursWorked from shifts)
- Gross pay for the period (sum of grossPay from shifts)
- Tax (sum of tax from shifts)
- Net pay (sum of netPay from shifts)
- Hours worked in each pay category (sum of hours from shift pay categories)

Usage:
    python calculate_pay_periods.py
"""

import json
import os
from typing import Dict, List, Any

# Paths to data files
BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
DATA_DIR = os.path.join(BASE_DIR, "src", "api", "data")
SHIFTSPAY_FILE = os.path.join(DATA_DIR, "shiftspay.json")
PAYPERIODS_FILE = os.path.join(DATA_DIR, "payperiods.json")

def load_json_file(file_path: str) -> Dict:
    """Load and parse a JSON file."""
    with open(file_path, 'r') as f:
        return json.load(f)

def save_json_file(file_path: str, data: Dict) -> None:
    """Save data to a JSON file with proper formatting."""
    with open(file_path, 'w') as f:
        json.dump(data, f, indent=2)

def calculate_pay_periods():
    """Aggregate pay period totals from pre-calculated shift data."""
    # Read the data files
    shiftspay_data = load_json_file(SHIFTSPAY_FILE)
    payperiods_data = load_json_file(PAYPERIODS_FILE)
    
    # Process each employer's pay periods
    for employer_data in payperiods_data["payPeriods"]:
        employer_id = employer_data["employerId"]
        
        # Get all shifts for this employer
        employer_shifts = [shift for shift in shiftspay_data["shifts"] 
                          if shift["employerId"] == employer_id]
        
        # Process each pay period
        for period in employer_data["periods"]:
            start_date = period["startDate"]
            end_date = period["endDate"]
            
            # Find shifts that fall within this pay period
            period_shifts = [shift for shift in employer_shifts 
                            if start_date <= shift["date"] <= end_date]
            
            # Store just the dates of each shift in the period
            period["shifts"] = [shift["date"] for shift in period_shifts]
            
            # Calculate totals - simply sum up values from shifts
            total_hours = 0
            total_gross_pay = 0
            total_tax = 0
            total_net_pay = 0
            total_allowances = 0
            
            # Dictionary to track allowances by name
            allowances_by_name = {}
            
            # Reset pay categories hours
            for category in period["payCategories"]:
                category["hours"] = 0
            
            # Process each shift
            for shift in period_shifts:
                # Add hours worked
                total_hours += shift["hoursWorked"]
                
                # Add gross pay
                total_gross_pay += shift["grossPay"]
                
                # Add tax
                total_tax += shift["tax"]
                
                # Add net pay
                total_net_pay += shift["netPay"]
                
                # Process allowances if present
                if "allowances" in shift and shift["allowances"]:
                    # Add to total allowances
                    if "allowanceTotal" in shift:
                        total_allowances += shift["allowanceTotal"]
                    else:
                        # Calculate from individual allowances if allowanceTotal not present
                        shift_allowance_total = sum(allowance["amount"] for allowance in shift["allowances"])
                        total_allowances += shift_allowance_total
                    
                    # Group allowances by name
                    for allowance in shift["allowances"]:
                        allowance_name = allowance["name"]
                        allowance_amount = allowance["amount"]
                        
                        if allowance_name in allowances_by_name:
                            allowances_by_name[allowance_name]["amount"] += allowance_amount
                        else:
                            allowances_by_name[allowance_name] = {
                                "name": allowance_name,
                                "amount": allowance_amount,
                                "type": allowance.get("type", ""),
                                "notes": allowance.get("notes", "")
                            }
                
                # Add hours to each pay category
                for shift_category in shift["payCategories"]:
                    # Find matching category in period
                    period_category = next(
                        (cat for cat in period["payCategories"] 
                         if cat["category"] == shift_category["category"]), 
                        None
                    )
                    
                    if period_category:
                        period_category["hours"] += shift_category["hours"]
            
            # Update period totals - use rounded values for display
            period["totalHours"] = round(total_hours, 2)
            period["grossPay"] = round(total_gross_pay, 2)
            period["tax"] = round(total_tax, 2)
            period["allowanceTotal"] = round(total_allowances, 2)
            
            # Add totalGrossPay field (base pay + allowances) for clarity
            period["totalGrossPay"] = round(total_gross_pay + total_allowances, 2)
            
            # Calculate net pay as grossPay + allowances - tax
            # This is more explicit than summing individual netPay values
            # and ensures consistency with the displayed values
            period["netPay"] = round(total_gross_pay + total_allowances - total_tax, 2)
            
            # Add allowances to the period
            period["allowances"] = list(allowances_by_name.values())
            
            # Round all allowance amounts
            for allowance in period["allowances"]:
                allowance["amount"] = round(allowance["amount"], 2)
    
    # Write the updated data back to the file
    save_json_file(PAYPERIODS_FILE, payperiods_data)
    
    print("Pay periods updated successfully!")

if __name__ == "__main__":
    calculate_pay_periods()
