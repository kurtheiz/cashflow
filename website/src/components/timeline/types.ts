import { Shift, PayDate, Employer } from '../../utils/shiftCalculator';

export interface TimelineProps {
  shifts: Shift[];
  payDates?: PayDate[];
  selectedDate: Date;
  employers: Employer[];
  onPayPeriodSelect: (start: Date | null, end: Date | null, employerId: string | null) => void;
}

export interface EmployerSummary {
  name: string;
  color: string;
  shifts: number;
  hours: number;
  pay: number;
  tax: number;
  netPay: number;
}

export interface MonthlySummary {
  month: string;
  year: number;
  employers: Record<string, EmployerSummary>;
  totalShifts: number;
  totalHours: number;
  totalPay: number;
  totalTax: number;
  totalNetPay: number;
}

export interface ShiftItemProps {
  shift: Shift;
  getEmployerColor: (employerId: string) => string;
  formatDate: (dateString: string) => string;
  formatTime: (timeString: string) => string;
}

export interface PayDateItemProps {
  payDate: PayDate;
  getEmployerColor: (employerId: string) => string;
  formatDate: (dateString: string) => string;
}

export interface MonthlySummariesProps {
  summaries: MonthlySummary[];
}
