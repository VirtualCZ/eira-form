import { useController, Control, FieldValues, Path } from "react-hook-form"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"

interface FormPhotoUploadProps<T extends FieldValues> {
  name: Path<T>;
  formControl: Control<T>;
  label: string;
  required?: boolean;
}

export default function FormPhotoUpload<T extends FieldValues>({
  name,
  formControl,
  label,
  required = false
}: FormPhotoUploadProps<T>) {
  const { field, fieldState } = useController({
    name: name,
    control: formControl
  });

  // Helper to convert File to base64 string
  const fileToBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  };

  // Handles both File and base64 string arrays
  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    // Convert all files to base64
    const base64Files = await Promise.all(files.map(fileToBase64));
    // Merge with existing base64 strings (if any)
    field.onChange([...(field.value || []), ...base64Files]);
  };

  // Handles removal by index
  const handleRemove = (index: number) => {
    field.onChange((field.value || []).filter((_: any, i: number) => i !== index));
  };

  return (
    <div className="space-y-2">
      <label
        className={`block text-sm ${fieldState.error ? 'text-destructive' : ''}`}
        data-error={!!fieldState.error}
      >
        {label}
        {required && <span className="text-destructive ml-1">*</span>}
      </label>
      <Input
        type="file"
        multiple
        accept="image/*"
        onChange={handleFileChange}
        className={fieldState.error ? "border-destructive" : ""}
      />
      {fieldState.error && (
        <p className="text-[0.8rem] font-medium text-destructive">
          {fieldState.error.message}
        </p>
      )}
      <div className="flex gap-2 flex-wrap">
        {(field.value || []).map((item: any, index: number) => (
          <div key={index} className="relative">
            <img
              src={typeof item === "string" ? item : URL.createObjectURL(item)}
              className="h-20 w-20 object-cover rounded"
              alt={`Upload ${index + 1}`}
            />
            <Button
              type="button"
              variant="destructive"
              size="sm"
              className="absolute top-0 right-0 p-1 h-6 w-6"
              onClick={() => handleRemove(index)}
            >
              ×
            </Button>
          </div>
        ))}
      </div>
    </div>
  );
}