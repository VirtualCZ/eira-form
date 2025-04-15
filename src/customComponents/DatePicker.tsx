import { Button } from "@/components/ui/button"
import { Calendar } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { CalendarIcon } from "lucide-react"

import { format } from "date-fns"
import { cn } from '../lib/utils'
import { FormControl } from "@/components/ui/form"
import { useTranslation } from "react-i18next"
import { ControllerRenderProps } from "react-hook-form"

interface DatePickerProps {
    field: ControllerRenderProps<any, any>
}

const DatePicker = ({ field }: DatePickerProps) => {
    const { t } = useTranslation();

    return (
        <Popover>
            <PopoverTrigger asChild>
                <FormControl>
                    <Button
                        variant={"outline"}
                        className={cn(
                            "pl-3 text-left font-normal",
                            !field.value && "text-muted-foreground"
                        )}
                    >
                        {field.value ? (
                            format(field.value, "PPP")
                        ) : (
                            <span>{t('form.pickDate')}</span>
                        )}
                        <CalendarIcon />
                    </Button>
                </FormControl>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="start">
                <Calendar
                    mode="single"
                    selected={field.value}
                    onSelect={field.onChange}
                    // set a limit to selectable dates
                    // disabled={(date) =>
                    //     date > new Date() || date < new Date("1900-01-01")
                    // }
                    initialFocus
                />
            </PopoverContent>
        </Popover>
    )
}
export default DatePicker;
