import { useState, useEffect } from 'react';
import { api, ApiResponse } from '../api/mockApi';

/**
 * A generic hook for fetching data from the API
 * @param fetchFunction - The API function to call
 * @param dependencies - Dependencies that should trigger a refetch
 * @returns Object containing data, loading state, error, and refetch function
 */
export function useApiData<T>(
  fetchFunction: () => Promise<ApiResponse<T>>,
  dependencies: any[] = []
) {
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<Error | null>(null);

  const fetchData = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await fetchFunction();
      
      if (response.status >= 200 && response.status < 300) {
        setData(response.data);
      } else {
        throw new Error(response.message || 'An error occurred');
      }
    } catch (err) {
      setError(err instanceof Error ? err : new Error('An unknown error occurred'));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, dependencies);

  return { data, loading, error, refetch: fetchData };
}

/**
 * Hook for fetching the current user
 */
export function useCurrentUser() {
  return useApiData(() => api.getCurrentUser());
}

/**
 * Hook for fetching user employers
 */
export function useEmployers() {
  return useApiData(() => api.getUserEmployers());
}

/**
 * Hook for fetching shifts
 * @param startDate - Optional start date filter
 * @param endDate - Optional end date filter
 */
export function useShifts(startDate?: string, endDate?: string) {
  return useApiData(
    () => api.getShifts(startDate, endDate),
    [startDate, endDate]
  );
}

/**
 * Hook for fetching shifts by employer
 * @param employerId - The employer ID
 */
export function useEmployerShifts(employerId: string) {
  return useApiData(
    () => api.getShiftsByEmployer(employerId),
    [employerId]
  );
}

/**
 * Hook for fetching pay rates
 * @param employeeLevel - The employee level
 */
export function usePayRates(employeeLevel: string) {
  return useApiData(
    () => api.getPayRates(employeeLevel),
    [employeeLevel]
  );
}

/**
 * Hook for calculating shift pay
 * @param shiftId - The shift ID
 */
export function useShiftPayCalculation(shiftId: string) {
  return useApiData(
    () => api.calculateShiftPay(shiftId),
    [shiftId]
  );
}

/**
 * Hook for calculating pay period
 * @param employerId - The employer ID
 * @param startDate - The pay period start date
 * @param endDate - The pay period end date
 */
export function usePayPeriodCalculation(
  employerId: string,
  startDate: string,
  endDate: string
) {
  return useApiData(
    () => api.calculatePayPeriod(employerId, startDate, endDate),
    [employerId, startDate, endDate]
  );
}
