import { toast } from '@/hooks/use-toast';
import { ToastDescription } from '@/components/math/toast-description';
import * as z from 'zod';

export const FormSchema = z.object({
  function: z.string().min(1, {
    message: 'Function must be at least 1 character.',
  }),
});

// need to pass in toast from useToast hook
/*
export function callToast({
  validFunction,
  animationCreated,
  audioCreated,
  uploadedToSupabase,
}: {
  validFunction: boolean | null;
  animationCreated: boolean | null;
  audioCreated: boolean | null;
  uploadedToSupabase: boolean | null;
}) {
  toast({
    title: 'Sonification Progress',
    duration: 10000,
    description: (
      <ToastDescription validFunction={validFunction} animationCreated={animationCreated} audioCreated={audioCreated} suploadedToSupabase={uploadedToSupabase} />
    
    ),
  });
}
  */
