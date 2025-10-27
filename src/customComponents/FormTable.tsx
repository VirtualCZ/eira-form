import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useFieldArray, Control, ArrayPath, Path, useFormContext } from "react-hook-form";
import { FormField, FormControl, FormLabel } from "@/components/ui/form";
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
  label?: string;
  tableError?: string;
}

export function FormTable({
  name,
  formControl: control, // Destructure with alias
  columns,
  label,
  tableError,
}: FormTableProps) {
  const { t } = useTranslation();
  const { fields, append, remove } = useFieldArray({ control, name });
  const formErrors = control._formState.errors;
  const { trigger } = useFormContext();


  const [newRow, setNewRow] = useState<Record<string, string>>(
    Object.fromEntries(columns.map((col) => {
      // For select fields, use the first option if it's "none", otherwise empty string
      if (col.type === "select" && col.options?.[0]?.value === "none") {
        return [col.name as string, "none"];
      }
      return [col.name as string, ""];
    }))
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
    <div className="space-y-2">
      <FormLabel className={formErrors[name as keyof typeof formErrors] ? "text-red-600" : ""}>
        {label}
      </FormLabel>
      <div className="overflow-x-auto border border-gray-200 rounded-md bg-white">
        <table className="w-full">
          <thead>
            <tr className="border-b border-gray-200">
              {columns.map((col) => (
                <th
                  key={String(col.name)}
                  className="px-3 py-2 text-left text-sm font-medium text-gray-700"
                >
                  {col.label}
                </th>
              ))}
              <th className="sticky right-0 bg-white w-10 px-2"></th>
            </tr>
          </thead>
          <tbody>
            {fields.map((field, rowIdx) => (
              <tr key={field.id} className="border-b border-gray-100">
                {columns.map((col) => (
                  <td
                    key={String(col.name)}
                    className="px-3 py-2 align-top"
                  >
                    {col.type === "select" && col.options ? (
                      <FormField
                        name={`${name}.${rowIdx}.${String(col.name)}` as Path<FormData>}
                        control={control}
                        render={({ field: rhfField, fieldState }) => (
                          <Select value={String(rhfField.value || "none")} onValueChange={async (value) => {
                            rhfField.onChange(value);
                            // Trigger validation for exam type when proficiency changes
                            if (String(col.name) === "languageProficiency") {
                              await trigger(`${name}.${rowIdx}.languageExamType`);
                            }
                          }}>
                            <SelectTrigger 
                              className="h-9"
                              aria-invalid={!!fieldState.error}
                            >
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
                        render={({ field: rhfField, fieldState }) => (
                          <FormControl>
                            <Input 
                              {...rhfField} 
                              value={String(rhfField.value)} 
                              placeholder={col.placeholder}
                              className="h-9"
                              aria-invalid={!!fieldState.error}
                            />
                          </FormControl>
                        )}
                      />
                    )}
                  </td>
                ))}
                <td className="sticky right-0 bg-white w-10 px-2 py-2">
                  <Button
                    type="button"
                    variant="destructive"
                    size="sm"
                    className="h-8 w-8 p-0"
                    onClick={() => remove(rowIdx)}
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </td>
              </tr>
            ))}

            <tr className="bg-gray-50/50">
              {columns.map((col) => (
                <td key={String(col.name)} className="px-3 py-2 align-top">
                  {col.type === "select" && col.options ? (
                    <Select
                      value={newRow[col.name as string]}
                      onValueChange={(value) => handleNewRowChange(col.name as string, value)}
                    >
                      <SelectTrigger className="h-9">
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
                      className="h-9"
                    />
                  )}
                </td>
              ))}
              <td className="sticky right-0 bg-gray-50/50 w-10 px-2 py-2">
                <Button
                  type="button"
                  variant="destructive"
                  size="sm"
                  className="h-8 w-8 p-0"
                  disabled
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      {formErrors[name as keyof typeof formErrors] && (
        <div className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-md p-2">
          <div className="font-medium mb-1">
            {tableError || t('form.errors.tableIncomplete')}
          </div>
          <ul className="space-y-1">
            {Array.isArray(formErrors[name as keyof typeof formErrors]) && 
             (formErrors[name as keyof typeof formErrors] as any[]).map((rowError: any, rowIdx: number) =>
              rowError
                ? Object.entries(rowError).map(([colName, colError]: [string, any]) =>
                    colError && colError.message ? (
                      <li key={`${rowIdx}-${colName}`} className="text-sm">
                        <span className="font-medium">{t(`form.labels.${colName}`) || colName}</span> (řádek {rowIdx + 1}): {colError.message}
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