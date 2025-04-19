import React, { useState } from 'react';
import { TimeEntry } from '../components/TimeEntry';
import { format } from 'date-fns';

const employers = [
  { id: '1', name: 'Petbarn', level: 'retail_employee_level_1' as const, state: "VIC" as 'VIC' },
  { id: '2', name: 'EQ Saddlery', level: 'retail_employee_level_1' as const, state: "VIC" as 'VIC' },
];

const today = new Date();
const startDate = format(today, 'yyyy-MM-dd');

const Home: React.FC = () => {
  const [entries, setEntries] = useState<Record<string, { start: string; end: string }>>({});
  return (
    <div style={{ 
      maxWidth: '100%', 
      margin: '0 auto', 
      padding: window.innerWidth < 768 ? '0' : '16px',
      height: '100vh',
      display: 'flex',
      flexDirection: 'column'
    }}>
      <TimeEntry
        employers={employers}
        entries={entries}
        onChange={setEntries}
        startDate={startDate}
      />
    </div>
  );
};

export default Home;
