import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useFieldArray, Control, FieldValues, ArrayPath, Path } from "react-hook-form";
import { FormField, FormItem, FormControl } from "@/components/ui/form";
import { useState } from "react";

interface Column<T> {
    name: keyof T;
    label: string;
    placeholder?: string;
    errorPath?: string;
}

interface FormTableProps<T extends FieldValues> {
    name: ArrayPath<T>;
    control: Control<T>;
    columns: Column<any>[];
    errors?: any[];
    label?: string;
    tableError?: string;
}

export function FormTable<T extends FieldValues>({
    name,
    control,
    columns,
    errors,
    label,
    tableError,
  }: FormTableProps<T>) {
    const { fields, append, remove } = useFieldArray({ control, name });
  
    const [newRow, setNewRow] = useState<Record<string, string>>(
      Object.fromEntries(columns.map((col) => [col.name as string, ""]))
    );
  
    const handleNewRowChange = (colName: string, value: string) => {
        const updated = { ...newRow, [colName]: value };
        setNewRow(updated);
      
        const hasData = Object.values(updated).some((val) => val.trim() !== "");
        if (hasData) {
          append(updated as any, { shouldFocus: false });
      
          setNewRow(Object.fromEntries(columns.map((col) => [col.name as string, ""])));
      
          setTimeout(() => {
            const newIndex = fields.length;
            const input = document.querySelector(
              `input[name="${name}.${newIndex}.${colName}"]`
            ) as HTMLInputElement;
      
            input?.focus();
            input?.setSelectionRange(value.length, value.length);
          }, 0);
        }
      };
  
    return (
      <div className="flex flex-col gap-2">
        {label && (
          <label className={`text-sm ${errors && errors.length > 0 ? "text-destructive" : ""}`}>
            {label}
          </label>
        )}
        <table className="w-full border">
          <thead>
            <tr>
              {columns.map((col) => (
                <th key={String(col.name)} className="px-2 py-1">{col.label}</th>
              ))}
              <th />
            </tr>
          </thead>
          <tbody>
            {fields.map((field, rowIdx) => (
              <tr key={field.id}>
                {columns.map((col) => (
                  <td key={String(col.name)} className="px-1 py-1">
                    <FormField
                      name={`${name}.${rowIdx}.${String(col.name)}` as Path<T>}
                      control={control}
                      render={({ field: rhfField }) => (
                        <FormItem>
                          <FormControl>
                            <Input {...rhfField} placeholder={col.placeholder} />
                          </FormControl>
                        </FormItem>
                      )}
                    />
                  </td>
                ))}
                <td>
                  <Button
                    type="button"
                    variant="destructive"
                    size="sm"
                    onClick={() => remove(rowIdx)}
                  >
                    Remove
                  </Button>
                </td>
              </tr>
            ))}
  
            <tr>
              {columns.map((col) => (
                <td key={String(col.name)} className="px-1 py-1">
                  <Input
                    placeholder={col.placeholder}
                    value={newRow[col.name as string]}
                    onChange={(e) => handleNewRowChange(col.name as string, e.target.value)}
                  />
                </td>
              ))}
              <td>
                <Button type="button" variant="destructive" size="sm" disabled>
                  Remove
                </Button>
              </td>
            </tr>
          </tbody>
        </table>
  
        {errors && errors.length > 0 && (
          <div className="text-sm text-destructive">
            {tableError || "Table isn't correctly filled out."}
          </div>
        )}
      </div>
    );
  }