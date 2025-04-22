import { api, ApiResponse } from '../api/mockApi';
import { useQuery, UseQueryOptions } from '@tanstack/react-query';

// --- TanStack Query hooks for API data ---

export function useCurrentUser(options?: UseQueryOptions<ApiResponse<any>, Error>) {
  return useQuery<ApiResponse<any>, Error>({
    queryKey: ['currentUser'],
    queryFn: () => api.getCurrentUser(),
    ...options,
  });
}

export function useEmployers(options?: UseQueryOptions<ApiResponse<any>, Error>) {
  return useQuery<ApiResponse<any>, Error>({
    queryKey: ['employers'],
    queryFn: () => api.getUserEmployers(),
    ...options,
  });
}

export function useShifts(startDate?: string, endDate?: string, options?: UseQueryOptions<ApiResponse<any>, Error>) {
  return useQuery<ApiResponse<any>, Error>({
    queryKey: ['shifts', startDate, endDate],
    queryFn: async () => {
      const response = await api.getShifts(startDate, endDate);
      console.log('useShifts API response:', response);
      return response;
    },
    ...options,
  });
}

export function useEmployerShifts(employerId: string, options?: UseQueryOptions<ApiResponse<any>, Error>) {
  return useQuery<ApiResponse<any>, Error>({
    queryKey: ['employerShifts', employerId],
    queryFn: () => api.getShiftsByEmployer(employerId),
    enabled: !!employerId,
    ...options,
  });
}

export function usePayRates(employeeLevel: string, options?: UseQueryOptions<ApiResponse<any>, Error>) {
  return useQuery<ApiResponse<any>, Error>({
    queryKey: ['payRates', employeeLevel],
    queryFn: () => api.getPayRates(employeeLevel),
    enabled: !!employeeLevel,
    ...options,
  });
}

export function useShiftPayCalculation(shiftId: string, options?: UseQueryOptions<ApiResponse<any>, Error>) {
  return useQuery<ApiResponse<any>, Error>({
    queryKey: ['shiftPayCalculation', shiftId],
    queryFn: () => api.calculateShiftPay(shiftId),
    enabled: !!shiftId,
    ...options,
  });
}

export function usePayPeriodCalculation(
  employerId: string,
  startDate: string,
  endDate: string,
  options?: UseQueryOptions<ApiResponse<any>, Error>
) {
  return useQuery<ApiResponse<any>, Error>({
    queryKey: ['payPeriodCalculation', employerId, startDate, endDate],
    queryFn: () => api.calculatePayPeriod(employerId, startDate, endDate),
    enabled: !!employerId && !!startDate && !!endDate,
    ...options,
  });
}

/**
 * Hook for fetching pay periods data
 * @param startDate - Optional start date filter
 * @param endDate - Optional end date filter
 * @param employerId - Optional employer ID filter
 */
export function usePayPeriods(
  startDate?: string,
  endDate?: string,
  employerId?: string,
  options?: UseQueryOptions<ApiResponse<any>, Error>
) {
  return useQuery<ApiResponse<any>, Error>({
    queryKey: ['payPeriods', startDate, endDate, employerId],
    queryFn: () => api.getPayPeriods(startDate, endDate, employerId),
    ...options,
  });
}


/**
 * Hook for fetching public holidays data
 * @param states - Array of state codes to fetch holidays for
 * @param year - Optional year to fetch holidays for (defaults to current year)
 */
export function usePublicHolidays(
  states: string[],
  year?: string,
  options?: UseQueryOptions<ApiResponse<any>, Error>
) {
  return useQuery<ApiResponse<any>, Error>({
    queryKey: ['publicHolidays', states, year],
    queryFn: () => api.getPublicHolidays(states, year),
    enabled: states.length > 0,
    ...options,
  });
}
