import React from 'react';

interface DateSeparatorProps {
  date: string;
}

const DateSeparator: React.FC<DateSeparatorProps> = ({ date }) => {
  return (
    <div className="flex items-center justify-center my-4">
      <div className="px-3 py-1 bg-muted/80 rounded-full">
        <span className="text-xs font-medium text-muted-foreground">
          {date}
        </span>
      </div>
    </div>
  );
};

export default DateSeparator;
