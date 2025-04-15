import { FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Control, FieldPath, FieldValues, useController } from "react-hook-form";
import * as React from "react";
import { format } from "date-fns";
import { Calendar as CalendarIcon } from "lucide-react";
import { DateRange } from "react-day-picker";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";

interface FormDateFromToProps<T extends FieldValues> {
  nameFrom: FieldPath<T>;
  nameTo: FieldPath<T>;
  formLabel: string;
  formControl: Control<T>;
  formItemClass?: string;
  formFieldClass?: string;
  formMessage?: boolean;
}

const FormDateFromTo = <T extends FieldValues>({
  nameFrom,
  nameTo,
  formLabel,
  formControl,
  formItemClass,
  formFieldClass,
  formMessage = true
}: FormDateFromToProps<T>) => {
  // Use controllers to get and set values for both fields
  const { field: fromField } = useController({
    name: nameFrom,
    control: formControl
  });
  
  const { field: toField } = useController({
    name: nameTo,
    control: formControl
  });

  // Create a date range from the individual dates
  const dateRange: DateRange | undefined = React.useMemo(() => {
    if (fromField.value || toField.value) {
      return {
        from: fromField.value,
        to: toField.value
      };
    }
    return undefined;
  }, [fromField.value, toField.value]);

  // Handle date range changes
  const handleDateRangeChange = (range: DateRange | undefined) => {
    if (range?.from) {
      fromField.onChange(range.from);
    } else {
      fromField.onChange(undefined);
    }
    
    if (range?.to) {
      toField.onChange(range.to);
    } else {
      toField.onChange(undefined);
    }
  };

  return (
    <FormItem className={formItemClass}>
      <FormLabel>{formLabel}</FormLabel>
      <FormControl>
        <DatePickerWithRange 
          value={dateRange} 
          onChange={handleDateRangeChange}
          className={formFieldClass}
        />
      </FormControl>
      {formMessage && (
        <div>
          <FormField
            control={formControl}
            name={nameFrom}
            render={({ formState }) => (
              <FormMessage>{formState.errors[nameFrom]?.message}</FormMessage>
            )}
          />
          <FormField
            control={formControl}
            name={nameTo}
            render={({ formState }) => (
              <FormMessage>{formState.errors[nameTo]?.message}</FormMessage>
            )}
          />
        </div>
      )}
    </FormItem>
  );
};

interface DatePickerWithRangeProps extends React.HTMLAttributes<HTMLDivElement> {
  value?: DateRange;
  onChange?: (date: DateRange | undefined) => void;
}

function DatePickerWithRange({
  className,
  value,
  onChange,
}: DatePickerWithRangeProps) {
  const [date, setDate] = React.useState<DateRange | undefined>(value);

  // Update internal state when props change
  React.useEffect(() => {
    setDate(value);
  }, [value]);

  const handleSelect = (selectedDate: DateRange | undefined) => {
    setDate(selectedDate);
    if (onChange) {
      onChange(selectedDate);
    }
  };

  return (
    <div className={cn("grid gap-2", className)}>
      <Popover>
        <PopoverTrigger asChild>
          <Button
            id="date"
            variant={"outline"}
            className={cn(
              "w-full justify-start text-left font-normal",
              !date && "text-muted-foreground"
            )}
          >
            <CalendarIcon className="mr-2 h-4 w-4" />
            {date?.from ? (
              date.to ? (
                <>
                  {format(date.from, "LLL dd, y")} -{" "}
                  {format(date.to, "LLL dd, y")}
                </>
              ) : (
                format(date.from, "LLL dd, y")
              )
            ) : (
              <span>Pick a date range</span>
            )}
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-auto p-0" align="start">
          <Calendar
            initialFocus
            mode="range"
            defaultMonth={date?.from}
            selected={date}
            onSelect={handleSelect}
            numberOfMonths={2}
          />
        </PopoverContent>
      </Popover>
    </div>
  );
}

export default FormDateFromTo;