#!/usr/bin/env python3
"""
Shift Pay Calculator

This script calculates pay for shifts based on award rules and updates the shiftspay.json file.
It reads data from:
- shifts.json: Contains shift information
- user.json: Contains employee level and employer information
- config.json: Contains pay rates and award rules

Usage:
    python calculate_shift_pay.py
"""

import json
import os
from datetime import datetime, time, timedelta
from typing import Dict, List, Any, Optional, Tuple

# Paths to data files
BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
DATA_DIR = os.path.join(BASE_DIR, "src", "api", "data")
SHIFTS_FILE = os.path.join(DATA_DIR, "shifts.json")
USER_FILE = os.path.join(DATA_DIR, "user.json")
CONFIG_FILE = os.path.join(DATA_DIR, "config.json")
SHIFTSPAY_FILE = os.path.join(DATA_DIR, "shiftspay.json")

def load_json_file(file_path: str) -> Dict:
    """Load and parse a JSON file."""
    with open(file_path, 'r') as f:
        return json.load(f)

def save_json_file(file_path: str, data: Dict) -> None:
    """Save data to a JSON file with proper formatting."""
    with open(file_path, 'w') as f:
        json.dump(data, f, indent=4)

def parse_time(time_str: str) -> time:
    """Parse a time string in format HH:MM to datetime.time object."""
    hours, minutes = map(int, time_str.split(':'))
    return time(hours, minutes)

def is_public_holiday(date_str: str, state: str, config: Dict) -> bool:
    """Check if a date is a public holiday in the given state."""
    date_obj = datetime.strptime(date_str, "%Y-%m-%d")
    year = date_obj.year
    
    # If the year isn't in the config, return False
    if str(year) not in config["publicHolidays"]:
        return False
    
    holidays = config["publicHolidays"][str(year)]
    
    # Check national holidays
    for holiday in holidays.get("national", []):
        if holiday["date"] == date_str:
            return True
    
    # Check state-specific holidays
    for holiday in holidays.get(state, []):
        if holiday["date"] == date_str:
            # Skip regional holidays unless we want to implement regional checking
            if "regional" in holiday and isinstance(holiday["regional"], bool) and holiday["regional"]:
                continue
            return True
    
    return False

def calculate_hours_in_categories(date_str: str, start_time: str, end_time: str, 
                                 is_holiday: bool, state: str) -> Dict[str, float]:
    """
    Calculate hours worked in different pay categories.
    Returns a dictionary with categories as keys and hours as values.
    """
    start = parse_time(start_time)
    end = parse_time(end_time)
    
    # Create datetime objects for easier calculation
    date_obj = datetime.strptime(date_str, "%Y-%m-%d")
    start_dt = datetime.combine(date_obj, start)
    end_dt = datetime.combine(date_obj, end)
    
    # If end time is before start time, it means the shift ends on the next day
    if end_dt < start_dt:
        end_dt = end_dt + timedelta(days=1)
    
    # Get day of week (0 = Monday, 6 = Sunday)
    day_of_week = date_obj.weekday()
    
    # Initialize categories
    categories = {
        "ordinary": 0,
        "evening_mon_fri": 0,
        "saturday": 0,
        "sunday": 0,
        "public_holiday": 0
    }
    
    # If it's a public holiday, all hours go to public_holiday
    if is_holiday:
        total_hours = (end_dt - start_dt).total_seconds() / 3600
        categories["public_holiday"] = total_hours
        return categories
    
    # Process based on day of week
    if day_of_week == 5:  # Saturday
        total_hours = (end_dt - start_dt).total_seconds() / 3600
        categories["saturday"] = total_hours
    elif day_of_week == 6:  # Sunday
        total_hours = (end_dt - start_dt).total_seconds() / 3600
        categories["sunday"] = total_hours
    else:  # Monday to Friday
        # Evening rate applies after 6pm
        evening_start = datetime.combine(date_obj, time(18, 0))
        
        if start_dt >= evening_start:
            # Shift starts after 6pm, all hours at evening rate
            categories["evening_mon_fri"] = (end_dt - start_dt).total_seconds() / 3600
        elif end_dt <= evening_start:
            # Shift ends before 6pm, all hours at ordinary rate
            categories["ordinary"] = (end_dt - start_dt).total_seconds() / 3600
        else:
            # Shift spans 6pm, split between ordinary and evening
            categories["ordinary"] = (evening_start - start_dt).total_seconds() / 3600
            categories["evening_mon_fri"] = (end_dt - evening_start).total_seconds() / 3600
    
    return categories

def calculate_break_minutes(hours_worked: float, config: Dict) -> int:
    """Calculate unpaid break minutes based on hours worked."""
    break_schedule = config["breaks"]["breakSchedule"]
    
    for schedule in break_schedule:
        min_hours, max_hours = schedule["hoursRange"]
        if max_hours is None:  # For "10 or more hours" case
            if hours_worked >= min_hours:
                meal_breaks = schedule["mealBreaks"]
                return meal_breaks * config["breaks"]["mealBreak"]["minDuration"]
        elif min_hours <= hours_worked <= max_hours:
            meal_breaks = schedule["mealBreaks"]
            return meal_breaks * config["breaks"]["mealBreak"]["minDuration"]
    
    return 0

def calculate_shift_pay(shift: Dict, user_data: Dict, config_data: Dict) -> Dict:
    """Calculate pay details for a single shift."""
    # Get employer info
    employer_id = shift["employerId"]
    employer_info = next((emp for emp in user_data["employers"] if emp["id"] == employer_id), None)
    
    if not employer_info:
        raise ValueError(f"Employer {employer_id} not found in user data")
    
    # Get employee level and state
    level = employer_info["level"]
    state = employer_info["state"]
    
    # Check if public holiday
    is_holiday = is_public_holiday(shift["date"], state, config_data)
    
    # Calculate hours in different categories
    hours_by_category = calculate_hours_in_categories(
        shift["date"], shift["start"], shift["end"], is_holiday, state
    )
    
    # Get pay rates for the level
    pay_rates = config_data["casual"][level]["rates"]
    
    # Calculate pay for each category
    pay_categories = []
    total_pay = 0
    total_hours = 0
    
    for category, hours in hours_by_category.items():
        if hours > 0:
            rate = pay_rates[category]
            amount = hours * rate
            total_pay += amount
            total_hours += hours
            
            # Add category details
            category_desc = config_data["timeCategories"].get(category, category)
            pay_categories.append({
                "category": category,
                "hours": round(hours, 2),
                "rate": rate,
                "description": category_desc
            })
    
    # Calculate weighted average pay rate
    avg_pay_rate = round(total_pay / total_hours, 2) if total_hours > 0 else 0
    
    # Calculate unpaid break minutes
    unpaid_break_minutes = calculate_break_minutes(total_hours, config_data)
    
    # Create the result
    result = shift.copy()
    result.update({
        "hoursWorked": round(total_hours, 2),
        "isPublicHoliday": is_holiday,
        "payCategories": pay_categories,
        "payRate": avg_pay_rate,
        "grossPay": round(total_pay, 2),
        "unpaidBreakMinutes": unpaid_break_minutes
    })
    
    return result

def main():
    """Main function to process all shifts and update shiftspay.json."""
    print("Loading data files...")
    shifts_data = load_json_file(SHIFTS_FILE)
    user_data = load_json_file(USER_FILE)
    config_data = load_json_file(CONFIG_FILE)
    
    print(f"Processing {len(shifts_data['shifts'])} shifts...")
    
    # Calculate pay for each shift
    processed_shifts = []
    for shift in shifts_data["shifts"]:
        try:
            processed_shift = calculate_shift_pay(shift, user_data, config_data)
            processed_shifts.append(processed_shift)
            print(f"Processed shift on {shift['date']} for {shift['employer']}")
        except Exception as e:
            print(f"Error processing shift on {shift['date']}: {e}")
    
    # Create the output data structure
    output_data = {"shifts": processed_shifts}
    
    # Save to shiftspay.json
    save_json_file(SHIFTSPAY_FILE, output_data)
    print(f"Updated {SHIFTSPAY_FILE} with {len(processed_shifts)} processed shifts")

if __name__ == "__main__":
    main()
