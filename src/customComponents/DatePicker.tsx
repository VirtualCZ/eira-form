import { Button } from "@/components/ui/button"
import { Calendar } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { CalendarIcon } from "lucide-react"

import { format } from "date-fns"
import { cs, enUS } from "date-fns/locale"
import { cn } from '../lib/utils'
import { FormControl } from "@/components/ui/form"
import { useTranslation } from "react-i18next"
import { ControllerRenderProps } from "react-hook-form"
import { useState } from "react"
import { useMemo } from "react"

interface DatePickerProps {
    field: ControllerRenderProps<any, any>,
    className?: string;
    disabled?: (date: Date) => boolean;
    yearsBack?: number;
    yearsForward?: number;
}

const DatePicker = ({ field, className, disabled, yearsBack = 10, yearsForward = 0 }: DatePickerProps) => {
    const { t, i18n } = useTranslation();
    const [isOpen, setIsOpen] = useState(false);
    const [selectedYear, setSelectedYear] = useState<number | undefined>(field.value ? new Date(field.value).getFullYear() : undefined);

    // Get locale for date formatting
    const dateLocale = i18n.language === 'cs' ? cs : enUS;

    const years = useMemo(() => {
        const currentYear = new Date().getFullYear();
        const backYears = Array.from({ length: yearsBack + 1 }, (_, i) => currentYear - i);
        const forwardYears = yearsForward > 0 
            ? Array.from({ length: yearsForward }, (_, i) => currentYear + i + 1)
            : [];
        return [...forwardYears.reverse(), ...backYears];
    }, [yearsBack, yearsForward]);

    const [calendarMonth, setCalendarMonth] = useState<Date>(
        field.value ? new Date(field.value) : new Date()
    );

    const handleYearChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        const year = parseInt(e.target.value, 10);
        setSelectedYear(year);
        let newDate = field.value ? new Date(field.value) : new Date();
        newDate.setFullYear(year);
        field.onChange(newDate);
        setCalendarMonth(new Date(newDate));
    };

    return (
        <Popover open={isOpen} onOpenChange={setIsOpen}>
            <PopoverTrigger asChild>
                <FormControl>
                    <Button
                        variant={"outline"}
                        className={cn(
                            "pl-3 text-left font-normal",
                            !field.value && "text-muted-foreground",
                            className
                        )}
                    >
                        {field.value ? (
                            format(field.value, "PPP", { locale: dateLocale })
                        ) : (
                            <span>{t('form.messages.pickDate')}</span>
                        )}
                        <CalendarIcon />
                    </Button>
                </FormControl>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="start">
                <div className="flex flex-col gap-2 p-2">
                    {(yearsBack !== 0 || yearsForward > 0) && (
                        <select
                            className="border rounded px-2 py-1"
                            value={selectedYear ?? (field.value ? new Date(field.value).getFullYear() : new Date().getFullYear())}
                            onChange={handleYearChange}
                        >
                            {years.map(year => (
                                <option key={year} value={year}>{year}</option>
                            ))}
                        </select>
                    )}
                    <Calendar
                        mode="single"
                        selected={field.value}
                        onSelect={(date) => {
                            field.onChange(date);
                            setSelectedYear(date ? date.getFullYear() : undefined);
                            setCalendarMonth(date ? new Date(date) : new Date());
                            setIsOpen(false);
                        }}
                        disabled={disabled}
                        initialFocus
                        month={calendarMonth}
                        onMonthChange={setCalendarMonth}
                        locale={dateLocale}
                    />
                </div>
            </PopoverContent>
        </Popover>
    )
}
export default DatePicker;
