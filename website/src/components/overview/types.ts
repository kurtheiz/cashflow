// Types for the Overview components
import { PayPeriod } from '../../api/mockApi';

export interface EmployerEarnings {
  employerId: string;
  employer: string;
  grossTotal: number;
  taxTotal: number;
  afterTaxTotal: number;
  superTotal: number;
  shiftsCount: number;
}

export interface MonthlyData {
  [monthYear: string]: {
    [employerId: string]: EmployerEarnings;
  };
}

export interface PayDateCardProps {
  payDate: {
    date: string;
    employerId: string;
    employer: string;
    amount: number;
    periodStart: string;
    periodEnd: string;
    hours: number;
    payRate: number;
    tax: number;
    employeeLevel: number;
    awardDescription: string;
    sgcPercentage: number;
    payCategories: any[];
    shiftDates: string[];
    shifts: any[];
  };
  color: string;
}

export interface ShiftWithDateTime extends Record<string, any> {
  startDateTime: Date;
}

export interface UpcomingPayDates {
  [employerId: string]: PayPeriod;
}
