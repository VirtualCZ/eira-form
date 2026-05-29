import * as yup from 'yup';
import { getFormVariant } from '@/config/formVariants';
import { getGasFormSchema, type GasFormData } from '@/schemas/formSchemaGas';
import { getIcukFormSchema, type IcukFormData } from '@/schemas/formSchemaIcuk';

export const getFormSchema = (t: (key: string) => string): yup.ObjectSchema<any> => {
  return getFormVariant() === 'icuk' ? getIcukFormSchema(t) : getGasFormSchema(t);
};

export type FormData = GasFormData | IcukFormData;
