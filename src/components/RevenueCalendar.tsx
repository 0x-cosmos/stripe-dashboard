'use client';

import { DayPicker } from 'react-day-picker';

interface RevenueCalendarProps {
  data: { [key: string]: number };
}

export default function RevenueCalendar({ data }: RevenueCalendarProps) {
    const revenueValues = Object.values(data);
    const top20Percentile = revenueValues.sort((a, b) => b - a)[Math.floor(revenueValues.length * 0.2)];

    const modifiers = {
        highlighted: (date: Date) => {
            const dateString = date.toISOString().split('T')[0];
            return data[dateString] >= top20Percentile && data[dateString] > 0;
        }
    };

    const formatDay = (day: Date) => {
        const dateString = day.toISOString().split('T')[0];
        const revenue = data[dateString];
        return (
            <div className="flex flex-col items-center justify-center h-full">
                <span>{day.getDate()}</span>
                {revenue && (
                    <span className="text-xs text-green-700">
                        ${revenue.toFixed(2)}
                    </span>
                )}
            </div>
        );
    };

  return (
    <div className="bg-white p-6 rounded-lg shadow-md">
        <h2 className="text-lg font-semibold mb-4">Projected Revenue Calendar</h2>
        <DayPicker
            modifiers={modifiers}
            components={{
                DayContent: (props) => formatDay(props.date)
            }}
            classNames={{
                root: 'w-full',
                months: 'flex flex-col sm:flex-row space-y-4 sm:space-x-4 sm:space-y-0',
                month: 'space-y-4',
                caption: 'flex justify-center pt-1 relative items-center',
                caption_label: 'text-sm font-medium',
                nav: 'space-x-1 flex items-center',
                nav_button: 'h-7 w-7 bg-transparent p-0 opacity-50 hover:opacity-100',
                table: 'w-full border-collapse space-y-1',
                head_row: 'flex',
                head_cell: 'text-gray-500 rounded-md w-9 font-normal text-[0.8rem]',
                row: 'flex w-full mt-2',
                cell: 'h-9 w-9 text-center text-sm p-0 relative [&:has([aria-selected])]:bg-gray-100 first:[&:has([aria-selected])]:rounded-l-md last:[&:has([aria-selected])]:rounded-r-md focus-within:relative focus-within:z-20',
                day: 'h-9 w-9 p-0 font-normal aria-selected:opacity-100',
                day_selected: 'bg-gray-900 text-white hover:bg-gray-900 hover:text-white focus:bg-gray-900 focus:text-white',
                day_today: 'bg-gray-200 text-gray-900',
                day_outside: 'text-gray-500 opacity-50',
                day_disabled: 'text-gray-500 opacity-50',
                day_range_middle: 'aria-selected:bg-gray-100 aria-selected:text-gray-900',
                day_hidden: 'invisible',
                ...({}),
                modifier_highlighted: 'bg-green-200 text-green-800 rounded-md',
            }}
        />
    </div>
  );
}
