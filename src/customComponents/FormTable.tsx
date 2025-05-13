import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useFieldArray, Control, ArrayPath, Path } from "react-hook-form";
import { FormField, FormItem, FormControl } from "@/components/ui/form";
import { useRef, useState } from "react";
import { Select, SelectTrigger, SelectContent, SelectItem, SelectValue } from "@/components/ui/select";
import { useTranslation } from 'react-i18next';  // Replace i18next import
import { Trash2 } from "lucide-react";
import { FormData } from "@/schemas/formSchema";

interface Column<T> {
  name: keyof T;
  label: string;
  placeholder?: string;
  errorPath?: string;
  type?: "select" | "text";
  options?: { value: string; label: string }[];
}

interface FormTableProps {
  name: ArrayPath<FormData>;
  formControl: Control<FormData>; // Changed from 'control'
  columns: Column<any>[];
  errors?: any[];
  label?: string;
  tableError?: string;
}

export function FormTable({
  name,
  formControl: control, // Destructure with alias
  columns,
  errors,
  label,
  tableError,
}: FormTableProps) {
  const { t } = useTranslation(); // Add this line
  const { fields, append, remove } = useFieldArray({ control, name });

  const [newRow, setNewRow] = useState<Record<string, string>>(
    Object.fromEntries(columns.map((col) => [col.name as string, ""]))
  );

  const timeoutRef = useRef<NodeJS.Timeout | undefined>(undefined);
  const isSubmitting = useRef(false);

  const handleNewRowChange = (colName: string, value: string) => {
    if (isSubmitting.current) return;

    const updated = { ...newRow, [colName]: value };
    setNewRow(updated);

    // Clear any existing timeout
    if (timeoutRef.current) clearTimeout(timeoutRef.current);

    timeoutRef.current = setTimeout(() => {
      const hasData = Object.values(updated).some((val) => val.trim() !== "");
      if (hasData) {
        isSubmitting.current = true;
        append(updated as any, { shouldFocus: false });
        setNewRow(Object.fromEntries(columns.map((col) => [col.name as string, ""])));

        setTimeout(() => {
          isSubmitting.current = false;
          const newIndex = fields.length;
          const input = document.querySelector(
            `input[name="${name}.${newIndex}.${colName}"]`
          ) as HTMLInputElement;
          input?.focus();
          input?.setSelectionRange(value.length, value.length);
        }, 100);
      }
    }, 300); // Adjust debounce time as needed (300ms)
  };

  return (
    <div className="flex flex-col gap-2">
      <label className={`text-sm ${errors && errors.length > 0 ? "text-destructive" : ""}`}>
        {label}
      </label>
      <div className="overflow-x-auto border rounded-md">
        <table className="w-full">
          <thead>
            <tr>
              {columns.map((col) => (
                <th
                  key={String(col.name)}
                  className="px-2 py-1 text-left"  // Removed min-width
                >
                  {col.label}
                </th>
              ))}
              <th className="sticky right-0 bg-white w-[40px]"></th>
            </tr>
          </thead>
          <tbody>
            {fields.map((field, rowIdx) => (
              <tr key={field.id}>
                {columns.map((col) => (
                  <td
                    key={String(col.name)}
                    className="px-1 py-1"  // Removed min-width
                  >
                    {col.type === "select" && col.options ? (
                      <FormField
                        name={`${name}.${rowIdx}.${String(col.name)}` as Path<FormData>}
                        control={control}
                        render={({ field: rhfField }) => (
                          <Select value={String(rhfField.value)} onValueChange={rhfField.onChange}>
                            <SelectTrigger className="w-[100%]">
                              <SelectValue placeholder={col.placeholder || col.label} />
                            </SelectTrigger>
                            <SelectContent>
                              {col.options?.map(opt => (
                                <SelectItem key={opt.value} value={opt.value}>
                                  {opt.label}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        )}
                      />
                    ) : (
                      <FormField
                        name={`${name}.${rowIdx}.${String(col.name)}` as Path<FormData>}
                        control={control}
                        render={({ field: rhfField }) => (
                          <FormItem>
                            <FormControl>
                              <Input {...rhfField} value={String(rhfField.value)} placeholder={col.placeholder} />
                            </FormControl>
                          </FormItem>
                        )}
                      />
                    )}
                  </td>
                ))}
                <td className="sticky right-0 bg-white w-[40px]">
                  <Button
                    type="button"
                    variant="destructive"
                    size="sm"
                    className="p-2 h-8 w-8"
                    onClick={() => remove(rowIdx)}
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </td>
              </tr>
            ))}

            <tr>
              {columns.map((col) => (
                <td key={String(col.name)} className="px-1 py-1">
                  {col.type === "select" && col.options ? (
                    <Select
                      value={newRow[col.name as string]}
                      onValueChange={(value) => handleNewRowChange(col.name as string, value)}
                    >
                      <SelectTrigger className="w-[100%]">
                        <SelectValue placeholder={col.placeholder || col.label} />
                      </SelectTrigger>
                      <SelectContent>
                        {col.options.map(opt => (
                          <SelectItem key={opt.value} value={opt.value}>
                            {opt.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  ) : (
                    <Input
                      placeholder={col.placeholder}
                      value={newRow[col.name as string]}
                      onChange={(e) => handleNewRowChange(col.name as string, e.target.value)}
                    />
                  )}
                </td>
              ))}
              <td className="sticky right-0 bg-white w-[40px]">
                <Button
                  type="button"
                  variant="destructive"
                  size="sm"
                  className="p-2 h-8 w-8"
                  disabled
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      {errors && errors.length > 0 && (
        <div className="text-sm text-destructive">
          {tableError || t('form.errors.tableIncomplete')}
          <ul className="mt-1 list-disc list-inside">
            {errors.map((rowError, rowIdx) =>
              rowError
                ? Object.entries(rowError).map(([colName, colError]: [string, any]) =>
                    colError && colError.message ? (
                      <li key={`${rowIdx}-${colName}`}>
                        {t(`form.labels.${colName}`) || colName} ({rowIdx + 1}): {colError.message}
                      </li>
                    ) : null
                  )
                : null
            )}
          </ul>
        </div>
      )}
    </div>
  );
}