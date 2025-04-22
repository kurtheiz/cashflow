import userData from './data/user.json';
import shiftspayData from './data/shiftspay.json';
import payperiodsData from './data/payperiods.json';
import configData from './data/config.json';

// Helper function to simulate network delay
const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

// Types
export interface User {
  user: string;
  name: string;
  employers: Employer[];
}

export interface Employer {
  id: string;
  name: string;
  level: string;
  state: string;
  taxFreeThreshold?: boolean;
  paycycle: string;
  payday: string;
  superRate?: number;
  payPeriodStart: string;
  payPeriodDays: number;
  nextPayDate: string;
  color?: string;
}

export interface Shift {
  id?: string;
  date: string;
  employerId: string;
  employer: string;
  start: string;
  end: string;
  hoursWorked?: number;
  isPublicHoliday?: boolean;
  payRate?: number;
  grossPay?: number;
  unpaidBreakMinutes?: number;
  payCategories?: PayCategory[];
}

export interface PayCategory {
  category: string;
  hours: number;
  rate: number;
  description: string;
}

export interface PayRate {
  hourly_rate: number;
  rates: {
    ordinary: number;
    evening_mon_fri: number;
    saturday: number;
    sunday: number;
    public_holiday: number;
  };
}

export interface PayCategory {
  category: string;
  hours: number;
  rate: number;
  description: string;
}

export interface PayPeriod {
  startDate: string;
  endDate: string;
  payDate: string;
  shifts: string[];
  totalHours: number;
  grossPay: number;
  tax: number;
  netPay: number;
  payCategories: PayCategory[];
  allowances?: {
    name: string;
    amount: number;
    type?: string;
    notes?: string;
  }[];
  allowanceTotal?: number;
  totalGrossPay?: number;
}

export interface PublicHoliday {
  date: string;
  name: string;
  regional?: string | boolean;
  state?: string;
}

export interface EmployerPayPeriods {
  employerId: string;
  employer: string;
  periods: PayPeriod[];
}

export interface ApiResponse<T> {
  data: T;
  status: number;
  message: string;
}

// Mock API class
class MockApi {
  // User endpoints
  async getCurrentUser(): Promise<ApiResponse<User>> {
    // Simulate network delay
    await delay(300);
    
    return {
      data: userData as User,
      status: 200,
      message: 'Success'
    };
  }
  
  async getUserEmployers(): Promise<ApiResponse<Employer[]>> {
    await delay(200);
    
    return {
      data: (userData as User).employers,
      status: 200,
      message: 'Success'
    };
  }
  
  // Shifts endpoints
  async getShifts(startDate?: string, endDate?: string): Promise<ApiResponse<Shift[]>> {
    await delay(400);
    
    // Load data from shiftspay.json instead of shifts.json
    // Make sure we're accessing the shifts array properly
    const shiftsData = shiftspayData as any;
    let shifts = Array.isArray(shiftsData.shifts) ? shiftsData.shifts : [];
    
    // Add unique IDs to shifts if they don't have them
    shifts = shifts.map((shift: Shift, index: number) => ({
      ...shift,
      id: shift.id || `shift-${index}`
    }));
    
    // Filter by date range if provided
    if (startDate && endDate) {
      shifts = shifts.filter((shift: Shift) => 
        shift.date >= startDate && shift.date <= endDate
      );
    }
    
    console.log('API getShifts returning:', shifts.length, 'shifts');
    
    return {
      data: shifts,
      status: 200,
      message: 'Success'
    };
  }
  
  async getShiftsByEmployer(employerId: string): Promise<ApiResponse<Shift[]>> {
    await delay(300);
    
    // Use shiftspay.json data for consistency with getShifts
    const shifts = (shiftspayData as any).shifts as Shift[];
    const filteredShifts = shifts
      .filter(shift => shift.employerId === employerId)
      .map((shift, index) => ({
        ...shift,
        id: shift.id || `shift-${employerId}-${index}`
      }));
    
    return {
      data: filteredShifts,
      status: 200,
      message: 'Success'
    };
  }
  
  async createShift(shift: Omit<Shift, 'id'>): Promise<ApiResponse<Shift>> {
    await delay(500);
    
    // Generate a unique ID
    const newShift: Shift = {
      ...shift,
      id: `shift-${Date.now()}`
    };
    
    // In a real implementation, this would add to the database
    // For mock, we just return the new shift
    
    return {
      data: newShift,
      status: 201,
      message: 'Shift created successfully'
    };
  }
  
  async updateShift(_id: string, shift: Partial<Shift>): Promise<ApiResponse<Shift>> {
    await delay(400);
    
    // In a real implementation, this would update the database
    // For mock, we just return the updated shift
    
    return {
      data: {
        id: _id,
        ...shift
      } as Shift,
      status: 200,
      message: 'Shift updated successfully'
    };
  }
  
  async deleteShift(_id: string): Promise<ApiResponse<void>> {
    await delay(300);
    
    // In a real implementation, this would delete from the database
    // For mock, we just return success
    
    return {
      data: undefined,
      status: 200,
      message: 'Shift deleted successfully'
    };
  }
  
  // Pay rates endpoints
  async getPayRates(employeeLevel: string): Promise<ApiResponse<PayRate>> {
    await delay(200);
    
    const casualRates = (configData as any).casual;
    const payRate = casualRates[employeeLevel];
    
    if (!payRate) {
      return {
        data: {} as PayRate,
        status: 404,
        message: 'Pay rate not found'
      };
    }
    
    return {
      data: payRate as PayRate,
      status: 200,
      message: 'Success'
    };
  }
  
  // Pay calculation endpoints
  async calculateShiftPay(_shiftId: string): Promise<ApiResponse<{
    hours: number;
    payRate: number;
    grossPay: number;
    tax: number;
    netPay: number;
  }>> {
    await delay(600);
    
    // In a real implementation, this would calculate based on the shift
    // For mock, we return a simple calculation
    
    return {
      data: {
        hours: 7.5,
        payRate: 32.06,
        grossPay: 240.45,
        tax: 48.09,
        netPay: 192.36
      },
      status: 200,
      message: 'Success'
    };
  }
  
  async calculatePayPeriod(_employerId: string, _startDate: string, _endDate: string): Promise<ApiResponse<{
    totalHours: number;
    averagePayRate: number;
    grossPay: number;
    tax: number;
    netPay: number;
    shifts: string[];
  }>> {
    await delay(700);
    
    // In a real implementation, this would calculate based on the pay period
    // For mock, we return a simple calculation
    
    return {
      data: {
        totalHours: 30,
        averagePayRate: 32.06,
        grossPay: 961.80,
        tax: 192.36,
        netPay: 769.44,
        shifts: ['shift-1', 'shift-2', 'shift-3', 'shift-4']
      },
      status: 200,
      message: 'Success'
    };
  }

  // Pay periods endpoints
  async getPayPeriods(startDate?: string, endDate?: string, employerId?: string): Promise<ApiResponse<EmployerPayPeriods[]>> {
    await delay(500);
    
    // Get pay periods data
    let payPeriods = (payperiodsData as any).payPeriods as EmployerPayPeriods[];
    
    // Filter by employer if provided
    if (employerId) {
      payPeriods = payPeriods.filter(employer => employer.employerId === employerId);
    }
    
    // Filter by date range if provided
    if (startDate && endDate) {
      payPeriods = payPeriods.map(employer => {
        // Create a copy of the employer data
        const filteredEmployer = { ...employer };
        
        // Filter periods that fall within the date range
        // A period is included if its pay date OR any part of the period falls within the range
        filteredEmployer.periods = employer.periods.filter(period => 
          (period.payDate >= startDate && period.payDate <= endDate) || // Pay date in range
          (period.startDate <= endDate && period.endDate >= startDate)  // Period overlaps with range
        );
        
        return filteredEmployer;
      });
    }
    
    return {
      data: payPeriods,
      status: 200,
      message: 'Success'
    };
  }
  
  // Public holidays endpoint
  async getPublicHolidays(states: string[], year?: string): Promise<ApiResponse<PublicHoliday[]>> {
    await delay(300);
    
    // Default to current year if not provided
    const targetYear = year || new Date().getFullYear().toString();
    
    // Get public holidays data from config
    const publicHolidaysData = (configData as any).publicHolidays;
    const yearData = publicHolidaysData[targetYear];
    
    if (!yearData) {
      return {
        data: [],
        status: 404,
        message: `No public holiday data available for ${targetYear}`
      };
    }
    
    // Start with national holidays
    let holidays: PublicHoliday[] = [...yearData.national].map(holiday => ({
      ...holiday,
      state: 'National'
    }));
    
    // Add state-specific holidays for the requested states
    states.forEach(state => {
      if (yearData[state]) {
        const stateHolidays = yearData[state].map((holiday: PublicHoliday) => ({
          ...holiday,
          state
        }));
        holidays = [...holidays, ...stateHolidays];
      }
    });
    
    // Sort by date
    holidays.sort((a, b) => a.date.localeCompare(b.date));
    
    return {
      data: holidays,
      status: 200,
      message: 'Success'
    };
  }
}

// Create and export a singleton instance
export const api = new MockApi();

// Export a hook for using the API
export function useApi() {
  return api;
}
