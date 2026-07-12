import { useMutation } from '@tanstack/react-query';
import { uploadFile } from './uploads.api';

export const useUploadFile = () =>
  useMutation({ mutationFn: (file: File) => uploadFile(file) });
