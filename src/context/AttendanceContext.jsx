import React, { createContext, useContext, useState } from 'react';
import { ATTENDANCE_HISTORY, STUDENTS } from '../data/mockData.js';

const AttendanceContext = createContext(null);

export function AttendanceProvider({ children }) {
  const [history, setHistory] = useState(ATTENDANCE_HISTORY);

  const saveAttendance = (date, subject, records) => {
    setHistory(prev => ({
      ...prev,
      [date]: {
        ...(prev[date] || {}),
        [subject]: records,
      }
    }));
  };

  const getRecords = (date, subject) => {
    return (history[date] || {})[subject] || {};
  };

  const getStudentHistory = (studentId, className) => {
    const result = [];
    Object.entries(history)
      .sort(([a], [b]) => b.localeCompare(a))
      .slice(0, 20)
      .forEach(([date, dayData]) => {
        Object.entries(dayData).forEach(([subject, subData]) => {
          const status = subData[studentId];
          if (status) result.push({ date, subject, status });
        });
      });
    return result;
  };

  return (
    <AttendanceContext.Provider value={{ history, saveAttendance, getRecords, getStudentHistory }}>
      {children}
    </AttendanceContext.Provider>
  );
}

export function useAttendance() {
  return useContext(AttendanceContext);
}
