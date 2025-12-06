"use client";

import { DayPicker } from "react-day-picker";

interface RevenueCalendarProps {
  data: { [key: string]: number };
  churnData: { [key: string]: number };
}

export default function RevenueCalendar({ data, churnData }: RevenueCalendarProps) {
  const revenueValues = Object.values(data);
  const top20Percentile = revenueValues.sort((a, b) => b - a)[Math.floor(revenueValues.length * 0.4)] || 0;

  const modifiers = {
    highlighted: (date: Date) => {
      const dateString = date.toISOString().split("T")[0];
      return (data[dateString] || 0) >= top20Percentile && (data[dateString] || 0) > 0;
    },
  };

  const formatDay = (props: { date: Date }) => {
    const { date } = props;
    const dateString = date.toISOString().split("T")[0];
    const revenue = data[dateString];
    const churn = churnData[dateString];

    const highRevenueWatermark = revenue - (churnData[dateString] || 0) >= top20Percentile;
    const profitableMark = revenue - (churnData[dateString] || 0) > 0;

    const isInFuture = date > new Date();

    const today = new Date();
    const isToday = date.getDate() === today.getDate() && date.getMonth() === today.getMonth() && date.getFullYear() === today.getFullYear();

    return (
      <div className={`
      flex flex-col items-center justify-start h-full w-full min-h-[4rem] 
      ${highRevenueWatermark ? "bg-green-100" : ""} 
      ${profitableMark ? "bg-blue-50" : "bg-red-50"} 
      ${isToday ? "border border-b-6 border-gray-200" : ""} 
      ${isInFuture ? "opacity-50" : ""}
      `}>
        <span className="text-sm font-medium mb-1">{date.getDate()}</span>
        {revenue !== undefined && <span className={`text-xs font-bold ${isInFuture ? "text-blue-700" : "text-green-500"}`}>${revenue.toFixed(0)}</span>}
        {churn !== undefined && <span className={`text-xs font-bold ${isInFuture ? "text-red-700" : "text-red-600"}`}>-${churn.toFixed(0)}</span>}
      </div>
    );
  };

  return (
    <div className="bg-white p-6 rounded-lg shadow-md w-full">
      <h2 className="text-lg font-semibold mb-4 text-gray-500">Projected Revenue Calendar</h2>
      <DayPicker
        timeZone="America/Los_Angeles"
        modifiers={modifiers}
        components={{
          Day: (props) => formatDay({ date: props.day.date }),
        }}
        classNames={{
          root: "w-full text-gray-500 bg-white",
          months: "flex flex-col sm:flex-row space-y-4 sm:space-x-4 sm:space-y-0 w-full",
          month: "space-y-4 w-full",
          caption: "flex justify-center pt-1 relative items-center mb-4",
          caption_label: "text-lg font-semibold text-gray-700",
          nav: "space-x-1 flex items-center absolute right-0",
          nav_button: "h-7 w-7 bg-transparent p-0 opacity-50 hover:opacity-100",
          table: "w-full border-collapse space-y-1 table-fixed",
          head_row: "w-full items-center justify-center",
          head_cell: "text-gray-500 rounded-md font-normal text-[0.8rem] text-center pb-2",
          row: "w-full mt-2 border-b border-gray-100 last:border-0",
          cell: "h-auto w-auto text-center text-sm p-0 relative [&:has([aria-selected])]:bg-gray-100 first:[&:has([aria-selected])]:rounded-l-md last:[&:has([aria-selected])]:rounded-r-md focus-within:relative focus-within:z-20 align-top",
          day: "h-auto w-full p-1 font-normal aria-selected:opacity-100 flex flex-col items-center justify-start hover:bg-gray-50 rounded-md transition-colors selection:bg-none min-h-[4rem]",
          day_today: "bg-gray-100 text-gray-900 font-bold",
          day_outside: "text-gray-300 opacity-50",
          day_disabled: "text-gray-300 opacity-50",
          day_range_middle: "aria-selected:bg-gray-100 aria-selected:text-gray-900",
          day_hidden: "invisible",
          week: "w-full flex",
          weeks: "w-full items-center",
          weekday: "w-full",

        }}
        modifiersClassNames={{
          highlighted: "bg-green-50/50",
        }}
      />
    </div>
  );
}
