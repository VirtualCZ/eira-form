import { useController, Control, FieldValues, Path } from "react-hook-form"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"

interface FormPhotoUploadProps<T extends FieldValues> {
  name: Path<T>;
  formControl: Control<T>;
  label: string;
}

export default function FormPhotoUpload<T extends FieldValues>({
  name,
  formControl,
  label
}: FormPhotoUploadProps<T>) {
  const { field } = useController({
    name: name,
    control: formControl
  });
  
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || [])
    field.onChange([...(field.value || []), ...files])
  }

  return (
    <div className="space-y-2">
      <label className="block text-sm">{label}</label>
      <Input
        type="file"
        multiple
        accept="image/*"
        capture="environment"
        onChange={handleFileChange}
      />
      <div className="flex gap-2 flex-wrap">
        {(field.value || []).map((file: File, index: number) => (
          <div key={index} className="relative">
            <img 
              src={URL.createObjectURL(file)}
              className="h-20 w-20 object-cover rounded"
              alt={`Upload ${index + 1}`}
            />
            <Button
              type="button"
              variant="destructive"
              size="sm"
              className="absolute top-0 right-0 p-1 h-6 w-6"
              onClick={() => field.onChange(
                field.value.filter((_: File, i: number) => i !== index)
              )}
            >
              ×
            </Button>
          </div>
        ))}
      </div>
    </div>
  )
}