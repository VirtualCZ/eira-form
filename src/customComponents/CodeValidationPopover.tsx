import { Button } from "@/components/ui/button";
import { Control } from "react-hook-form";
import { useTranslation } from "react-i18next";
import FormInput from "./FormInput";
import { FormData } from "@/schemas/formSchema";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { useFormContext } from 'react-hook-form';

interface CodeValidationPopoverProps {
    control: Control<FormData>;
    showCodePopover: boolean;
    setShowCodePopover: (show: boolean) => void;
}

export const CodeValidationPopover = ({
    showCodePopover,
    setShowCodePopover,
    control
}: CodeValidationPopoverProps) => {
    const { t } = useTranslation();
    const { trigger } = useFormContext();
    
    return (
        <Dialog open={showCodePopover} onOpenChange={setShowCodePopover}>
            <DialogContent className="w-96 p-4">
                <DialogHeader>
                    <DialogTitle>{t('form.labels.givenCode')}</DialogTitle>
                    <DialogDescription>
                        {t('form.modal.givenCodeDescription')}
                    </DialogDescription>
                </DialogHeader>
                <div className="space-y-4">
                    <FormInput
                        name="givenCode"
                        formControl={control}
                        formLabel={t('form.labels.givenCode')}
                        formPlaceholder="XXXXX"
                    />
                    <Button
                        className="w-full"
                        onClick={() => {
                            trigger('givenCode').then((isValid: boolean) => {
                                if (isValid) setShowCodePopover(false);
                            })
                        }}
                    >
                        {t('form.buttons.submitCode')}
                    </Button>
                </div>
            </DialogContent>
        </Dialog>
    );
};