import { Plus } from 'lucide-react';
import { Form, useForm, UseFormReturn } from 'react-hook-form';
import { Button } from '../ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '../ui/dialog';
import { FloatingLabelInput } from '../ui/floating-label-input';
import { FormField, FormItem, FormMessage } from '../ui/form';
import { LoadingButton } from '../ui/loading-button';
import { Dispatch, SetStateAction } from 'react';
import { FormSchema } from '@/app/math/actions';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';


export function FloatingActionButton({
  openFAB,
  setOpenFAB,
  form
}: {
  openFAB: boolean;
  setOpenFAB: Dispatch<SetStateAction<boolean>>;
  form: UseFormReturn<{
    function: string;
}, any, undefined>
}) {
  

  return (
    <Dialog open={openFAB} onOpenChange={setOpenFAB}>
      <DialogTrigger asChild>
        <Button
          className='fixed w-16 h-16 bottom-16 right-16 p-4 rounded-full shadow-lg bg-sky-900 text-white hover:bg-sky-600'
          aria-label='open dialog'
        >
          <Plus color='#ffffff' />
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Enter Configuration Details</DialogTitle>
          <DialogDescription>
            Customize and create your sonfication!
          </DialogDescription>
        </DialogHeader>
        <div className='space-y-4 py-4'>
          <Form {...form}>
            <form
              //onSubmit={form.handleSubmit(onSubmit)}
              className='w-2/3 space-y-6'
            >
              <FormField
                control={form.control}
                name='function'
                render={({ field }) => (
                  <FormItem>
                    <FloatingLabelInput
                      {...field}
                      id='function'
                      label='function'
                    />
                    <FormMessage />
                  </FormItem>
                )}
              />
              <LoadingButton type='submit'>Sonify!</LoadingButton>
            </form>
          </Form>
        </div>
      </DialogContent>
    </Dialog>
  );
}
