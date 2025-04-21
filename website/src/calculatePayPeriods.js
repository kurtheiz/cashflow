// Script to calculate pay period totals from shift data
import { readFileSync, writeFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, resolve } from 'path';

// Get current directory
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Read the data files
const shiftspayData = JSON.parse(readFileSync(resolve(__dirname, './api/data/shiftspay.json'), 'utf8'));
const payperiodsData = JSON.parse(readFileSync(resolve(__dirname, './api/data/payperiods.json'), 'utf8'));

// Process each employer's pay periods
payperiodsData.payPeriods.forEach(employerData => {
  const employerId = employerData.employerId;
  
  // Get all shifts for this employer
  const employerShifts = shiftspayData.shifts.filter(shift => shift.employerId === employerId);
  
  // Process each pay period
  employerData.periods.forEach(period => {
    const startDate = period.startDate;
    const endDate = period.endDate;
    
    // Find shifts that fall within this pay period
    const periodShifts = employerShifts.filter(shift => 
      shift.date >= startDate && shift.date <= endDate
    );
    
    // Store just the dates of each shift in the period
    period.shifts = periodShifts.map(shift => shift.date);
    
    // Calculate totals
    let totalHours = 0;
    let totalGrossPay = 0;
    
    // Reset pay categories hours
    period.payCategories.forEach(category => {
      category.hours = 0;
    });
    
    // Process each shift
    periodShifts.forEach(shift => {
      // Add hours worked
      totalHours += shift.hoursWorked;
      
      // Add gross pay
      totalGrossPay += shift.grossPay;
      
      // Add hours to each pay category
      shift.payCategories.forEach(shiftCategory => {
        // Find matching category in period
        const periodCategory = period.payCategories.find(
          cat => cat.category === shiftCategory.category
        );
        
        if (periodCategory) {
          periodCategory.hours += shiftCategory.hours;
        }
      });
    });
    
    // Update period totals
    period.totalHours = parseFloat(totalHours.toFixed(2));
    period.grossPay = parseFloat(totalGrossPay.toFixed(2));
    
    // Simple tax estimate (20% of gross pay)
    period.tax = parseFloat((totalGrossPay * 0.2).toFixed(2));
    period.netPay = parseFloat((totalGrossPay - period.tax).toFixed(2));
  });
});

// Write the updated data back to the file
writeFileSync(resolve(__dirname, './api/data/payperiods.json'), JSON.stringify(payperiodsData, null, 2));

console.log('Pay periods updated successfully!');
