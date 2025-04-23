#!/usr/bin/env python3
"""
Calculate Pay Periods

This script aggregates pay period totals from pre-calculated shift data.
It reads data from:
- shiftspay.json: Contains processed shift information with pay details
- payperiods.json: Contains pay period information for each employer
- user.json: Contains user and employer information

The script updates the payperiods.json file with:
- Shifts that fall within each pay period
- Total hours worked in the pay period (sum of hoursWorked from shifts)
- Gross pay for the period (sum of grossPay from shifts)
- Tax (sum of tax from shifts)
- Net pay (sum of netPay from shifts)
- Hours worked in each pay category (sum of hours from shift pay categories)

The script also updates the user.json file with:
- Updated next pay dates for each employer

Usage:
    python calculate_pay_periods.py
"""

import json
import os
from typing import Dict, List, Any
from datetime import datetime, timedelta

# Import the tax calculator
from tax_calculator import calculate_tax

# Paths to data files
BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
DATA_DIR = os.path.join(BASE_DIR, "src", "api", "data")
SHIFTSPAY_FILE = os.path.join(DATA_DIR, "shiftspay.json")
PAYPERIODS_FILE = os.path.join(DATA_DIR, "payperiods.json")
USER_FILE = os.path.join(DATA_DIR, "user.json")

def load_json_file(file_path: str) -> Dict:
    """Load and parse a JSON file."""
    try:
        with open(file_path, 'r') as f:
            return json.load(f)
    except FileNotFoundError:
        # Return empty structure if file doesn't exist
        if file_path == PAYPERIODS_FILE:
            print(f"Creating new payperiods.json file")
            return {"payPeriods": []}
        raise

def save_json_file(file_path: str, data: Dict) -> None:
    """Save data to a JSON file with proper formatting."""
    # Create directory if it doesn't exist
    os.makedirs(os.path.dirname(file_path), exist_ok=True)
    
    # Save the file
    with open(file_path, 'w') as f:
        json.dump(data, f, indent=2)
    
    print(f"Saved data to {file_path}")

def get_next_pay_date(payday, days_to_add=0):
    """Calculate the next pay date based on today's date, payday, and optional days to add."""
    # Get today's date
    today = datetime.now().date()
    
    # Map day names to weekday numbers (0 = Monday, 6 = Sunday)
    day_map = {
        "Monday": 0, "Tuesday": 1, "Wednesday": 2, "Thursday": 3,
        "Friday": 4, "Saturday": 5, "Sunday": 6
    }
    
    # Get the target weekday number
    target_weekday = day_map[payday]
    
    # Calculate days until the next occurrence of payday
    days_until_payday = (target_weekday - today.weekday()) % 7
    
    # If today is the payday and we want to include today, use today
    if days_until_payday == 0:
        next_pay_date = today
    else:
        next_pay_date = today + timedelta(days=days_until_payday)
    
    # Add any additional days if needed
    if days_to_add > 0:
        next_pay_date += timedelta(days=days_to_add)
    
    return next_pay_date.strftime("%Y-%m-%d")

def generate_pay_periods(employer, start_date_str, end_date_str):
    """Generate pay periods for an employer between start and end dates."""
    # Convert string dates to datetime objects
    start_date = datetime.strptime(start_date_str, "%Y-%m-%d")
    end_date = datetime.strptime(end_date_str, "%Y-%m-%d")
    
    # Get employer pay cycle info
    pay_cycle = employer.get("paycycle", "weekly")
    pay_period_start_day = employer.get("payPeriodStart", "Monday")
    pay_period_days = employer.get("payPeriodDays", 7)
    payday = employer.get("payday", "Wednesday")
    
    # Map day names to weekday numbers (0=Monday, 6=Sunday)
    day_map = {"Monday": 0, "Tuesday": 1, "Wednesday": 2, "Thursday": 3, 
              "Friday": 4, "Saturday": 5, "Sunday": 6}
    
    # Get the weekday number for the pay period start day
    start_weekday = day_map.get(pay_period_start_day, 0)  # Default to Monday
    
    # Find the first pay period start date on or before the overall start date
    days_to_subtract = (start_date.weekday() - start_weekday) % 7
    first_period_start = start_date - timedelta(days=days_to_subtract)
    
    # Generate periods
    periods = []
    current_start = first_period_start
    
    while current_start <= end_date:
        # Calculate end date based on pay period length
        current_end = current_start + timedelta(days=pay_period_days - 1)
        
        # Calculate pay date (usually a few days after the period ends)
        # For weekly, typically 3 days after period end
        # For fortnightly, typically 4 days after period end
        days_after_end = 3 if pay_cycle == "weekly" else 4
        pay_date = current_end + timedelta(days=days_after_end)
        
        # Adjust pay date to fall on the specified payday if needed
        target_weekday = day_map.get(payday, 2)  # Default to Wednesday
        days_to_adjust = (target_weekday - pay_date.weekday()) % 7
        if days_to_adjust > 0:
            pay_date += timedelta(days=days_to_adjust)
        
        # Create the period
        period = {
            "startDate": current_start.strftime("%Y-%m-%d"),
            "endDate": current_end.strftime("%Y-%m-%d"),
            "payDate": pay_date.strftime("%Y-%m-%d"),
            "shifts": [],
            "totalHours": 0,
            "grossPay": 0,
            "tax": 0,
            "netPay": 0,
            "payCategories": [
                {
                    "category": "ordinary",
                    "hours": 0,
                    "rate": 32.06,
                    "description": "Regular hours (Monday to Friday during day)"
                },
                {
                    "category": "evening_mon_fri",
                    "hours": 0,
                    "rate": 38.48,
                    "description": "Monday to Friday after 6pm"
                },
                {
                    "category": "saturday",
                    "hours": 0,
                    "rate": 38.48,
                    "description": "Saturday (higher rate)"
                },
                {
                    "category": "sunday",
                    "hours": 0,
                    "rate": 44.89,
                    "description": "Sunday (higher rate)"
                },
                {
                    "category": "public_holiday",
                    "hours": 0,
                    "rate": 64.13,
                    "description": "Public holiday (double pay)"
                }
            ],
            "allowanceTotal": 0,
            "allowances": [],
            "totalGrossPay": 0
        }
        
        periods.append(period)
        
        # Move to the next period
        current_start = current_end + timedelta(days=1)
    
    return periods

def calculate_pay_periods():
    """Main function to calculate pay periods."""
    # Load data
    shiftspay_data = load_json_file(SHIFTSPAY_FILE)
    
    # Load user data
    user_data = load_json_file(USER_FILE)
    
    # Create a fresh payperiods data structure
    payperiods_data = {"payPeriods": []}
    
    # Initialize payperiods data if empty
    if not payperiods_data["payPeriods"]:
        print("Initializing pay periods data structure")
        for employer in user_data["employers"]:
            payperiods_data["payPeriods"].append({
                "employerId": employer["id"],
                "employer": employer["name"],
                "periods": []
            })
    
    # Generate pay periods if none exist
    for employer_data in payperiods_data["payPeriods"]:
        if not employer_data["periods"]:
            employer_id = employer_data["employerId"]
            # Find employer in user data
            employer = next((emp for emp in user_data["employers"] if emp["id"] == employer_id), None)
            
            if employer:
                print(f"Generating pay periods for {employer_data['employer']}")
                # Get min and max dates from shifts to determine period range
                employer_shifts = [shift for shift in shiftspay_data["shifts"] 
                                  if shift["employerId"] == employer_id]
                
                if employer_shifts:
                    # Get date range from shifts
                    shift_dates = [shift["date"] for shift in employer_shifts]
                    min_date = min(shift_dates)
                    max_date = max(shift_dates)
                    
                    # Generate periods for this date range
                    periods = generate_pay_periods(employer, min_date, max_date)
                    employer_data["periods"] = periods
                else:
                    # No shifts, use current month
                    today = datetime.now()
                    start_of_month = datetime(today.year, today.month, 1)
                    end_of_month = datetime(today.year, today.month + 1, 1) - timedelta(days=1)
                    start_date = start_of_month.strftime("%Y-%m-%d")
                    end_date = end_of_month.strftime("%Y-%m-%d")
                    
                    periods = generate_pay_periods(employer, start_date, end_date)
                    employer_data["periods"] = periods
    
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
                
                # Tax and net pay now calculated at pay period level
                
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
            
            # Get employer info for tax calculation
            employer_info = next((emp for emp in user_data["employers"] if emp["id"] == employer_id), None)
            
            if not employer_info:
                print(f"Warning: Employer {employer_id} not found in user data")
                continue
                
            # Get tax settings from employer
            pay_cycle = employer_info.get("paycycle", "weekly")
            claims_tax_free_threshold = employer_info.get("taxFreeThreshold", True)
            
            # Calculate total gross pay for the period
            total_gross_amount = total_gross_pay + total_allowances
            rounded_gross = round(total_gross_amount, 2)
            
            # Determine the effective pay period length
            start_date = datetime.strptime(period["startDate"], "%Y-%m-%d")
            end_date = datetime.strptime(period["endDate"], "%Y-%m-%d")
            period_days = (end_date - start_date).days + 1  # Include both start and end dates
            
            # Adjust calculation based on period length if needed
            # For example, if a weekly pay cycle spans more than 7 days, adjust the calculation
            period_adjustment = 1.0
            if pay_cycle == "weekly" and period_days > 7:
                # If period is longer than a week, adjust the calculation
                period_adjustment = period_days / 7.0
                print(f"Adjusting weekly pay cycle for period of {period_days} days: factor {period_adjustment}")
            elif pay_cycle == "fortnightly" and period_days > 14:
                # If period is longer than a fortnight, adjust the calculation
                period_adjustment = period_days / 14.0
                print(f"Adjusting fortnightly pay cycle for period of {period_days} days: factor {period_adjustment}")
            
            # Debug output
            print(f"\nTax calculation for {employer_info['name']} pay period {period['startDate']} to {period['endDate']}:")
            print(f"  Total gross amount: ${rounded_gross:.2f}")
            print(f"  Pay cycle: {pay_cycle}")
            print(f"  Claims tax-free threshold: {claims_tax_free_threshold}")
            print(f"  Period days: {period_days} (adjustment factor: {period_adjustment:.2f})")
            
            # Calculate tax for the entire pay period
            tax = calculate_tax(
                rounded_gross,  # Use the rounded gross pay including allowances
                pay_cycle,     # 'weekly', 'fortnightly', or 'monthly'
                claims_tax_free_threshold,  # Whether employee claims tax-free threshold
                True,          # Assuming employee has provided TFN
                False,         # Assuming employee is not a foreign resident
                0              # Assuming no tax offset amount
            )
            
            # Apply period adjustment if needed
            if period_adjustment != 1.0 and pay_cycle != "monthly":
                # For monthly pay cycles, the calculation already accounts for varying month lengths
                # For weekly/fortnightly, we need to adjust based on the actual period length
                tax = tax * period_adjustment
                print(f"  Adjusted tax: ${tax:.2f} (after period adjustment)")
            else:
                print(f"  Calculated tax: ${tax:.2f}")
            
            # Calculate net pay
            net_pay = total_gross_amount - tax
            
            # Update period totals - use rounded values for display
            period["totalHours"] = round(total_hours, 2)
            period["grossPay"] = round(total_gross_pay, 2)
            period["allowanceTotal"] = round(total_allowances, 2)
            period["totalGrossPay"] = round(total_gross_amount, 2)
            period["tax"] = round(tax, 2)
            period["netPay"] = round(net_pay, 2)
            
            # Add allowances to the period
            period["allowances"] = list(allowances_by_name.values())
            
            # Round all allowance amounts
            for allowance in period["allowances"]:
                allowance["amount"] = round(allowance["amount"], 2)
    
    # Write the data to the payperiods.json file
    save_json_file(PAYPERIODS_FILE, payperiods_data)
    
    # Update next pay dates in user.json based on today's date
    for employer_data in payperiods_data["payPeriods"]:
        employer_id = employer_data["employerId"]
        
        # Find the employer in user data
        employer_info = next((emp for emp in user_data["employers"] if emp["id"] == employer_id), None)
        
        if employer_info:
            # Get the payday from employer info
            payday = employer_info["payday"]
            
            # Get today's date as a string
            today_str = datetime.now().date().strftime("%Y-%m-%d")
            
            # If today is the employer's payday, use today's date
            today_weekday = datetime.now().date().weekday()
            day_map = {
                "Monday": 0, "Tuesday": 1, "Wednesday": 2, "Thursday": 3,
                "Friday": 4, "Saturday": 5, "Sunday": 6
            }
            payday_weekday = day_map[payday]
            
            if today_weekday == payday_weekday:
                # Today is the payday, use today's date
                next_pay_date = today_str
            else:
                # Find the next occurrence of the payday
                next_pay_date = get_next_pay_date(payday)
            
            # Update the employer's next pay date
            employer_info["nextPayDate"] = next_pay_date
    
    # Write the user data back to the file
    save_json_file(USER_FILE, user_data)
    
    print("Pay periods created and next pay dates updated successfully!")

if __name__ == "__main__":
    calculate_pay_periods()
