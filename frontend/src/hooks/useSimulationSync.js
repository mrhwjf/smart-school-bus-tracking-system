import { useState, useEffect, useCallback } from 'react';

/**
 * Hook để đồng bộ trạng thái simulation giữa các tab/trang
 * Sử dụng localStorage và storage event để real-time sync
 */
export function useSimulationSync() {
  const [isRunning, setIsRunning] = useState(() => {
    const stored = localStorage.getItem('simulation_running');
    return stored === 'true';
  });

  const [activeCount, setActiveCount] = useState(() => {
    const stored = localStorage.getItem('simulation_count');
    return stored ? parseInt(stored, 10) : 0;
  });

  // Lắng nghe thay đổi từ tab khác
  useEffect(() => {
    const handleStorageChange = (e) => {
      if (e.key === 'simulation_running') {
        setIsRunning(e.newValue === 'true');
      } else if (e.key === 'simulation_count') {
        setActiveCount(e.newValue ? parseInt(e.newValue, 10) : 0);
      }
    };

    window.addEventListener('storage', handleStorageChange);
    
    // Custom event để sync trong cùng tab
    const handleCustomSync = (e) => {
      if (e.detail.type === 'simulation_state') {
        setIsRunning(e.detail.isRunning);
        setActiveCount(e.detail.count);
      }
    };
    
    window.addEventListener('simulationSync', handleCustomSync);

    return () => {
      window.removeEventListener('storage', handleStorageChange);
      window.removeEventListener('simulationSync', handleCustomSync);
    };
  }, []);

  const updateSimulationState = useCallback((running, count = 0) => {
    localStorage.setItem('simulation_running', running.toString());
    localStorage.setItem('simulation_count', count.toString());
    
    // Dispatch custom event cho cùng tab
    window.dispatchEvent(new CustomEvent('simulationSync', {
      detail: { type: 'simulation_state', isRunning: running, count }
    }));
    
    setIsRunning(running);
    setActiveCount(count);
  }, []);

  const startSimulation = useCallback((count = 0) => {
    updateSimulationState(true, count);
  }, [updateSimulationState]);

  const stopSimulation = useCallback(() => {
    updateSimulationState(false, 0);
  }, [updateSimulationState]);

  return {
    isRunning,
    activeCount,
    startSimulation,
    stopSimulation,
  };
}
