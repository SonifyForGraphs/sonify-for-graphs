'use client';
import { AppSidebar } from '@/components/app-sidebar';
import { Button } from '@/components/ui/button';
import { SidebarInset, SidebarProvider } from '@/components/ui/sidebar';
import { createClient } from '@/utils/supabase/client';
import { useEffect, useRef, useState } from 'react';
import { FileObject } from '@supabase/storage-js';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Plus } from 'lucide-react';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import * as z from 'zod';
import { Form, FormField, FormItem, FormMessage } from '@/components/ui/form';
import { LoadingButton } from '@/components/ui/loading-button';
import { FloatingLabelInput } from '@/components/ui/floating-label-input';
import { MathBreadcrumb } from '@/components/math/math-breadcrumb';
import { FormSchema } from './actions';
import { useToast } from '@/hooks/use-toast';
import { ToastDescription } from '@/components/math/toast-description';

export default function Page() {
  // video stuff
  const supabase = createClient();
  const [userId, setUserId] = useState('');
  const [videos, setVideos] = useState<FileObject[]>([]);

  // floating action button dialog
  const [openFAB, setOpenFAB] = useState(false);

  // submit button disabled
  const [submitButtonDisabled, setSubmitButtonDisabled] = useState(false);

  // progress/status state variables
  // valid function, create animation, create audio, merge and save video/audio, upload to supabase
  const [status, setStatus] = useState<{
    validFunction: boolean | null;
    animationCreated: boolean | null;
    audioCreated: boolean | null;
    videoCreated: boolean | null;
    uploadedToSupabase: boolean | null;
  }>({
    validFunction: null,
    animationCreated: null,
    audioCreated: null,
    videoCreated: null,
    uploadedToSupabase: null,
  });

  // toast stuff
  const { toast, dismiss } = useToast();
  const toastIDRef = useRef<string | null>(null);
  useEffect(() => {
    if (toastIDRef.current) {
      dismiss(toastIDRef.current);
      const { id } = toast({
        title: 'Sonification Progress',
        duration: 100000,
        description: <ToastDescription {...status} />,
      });
      toastIDRef.current = id;
    } else {
      // open the toast
      const { id } = toast({
        title: 'Sonification Progress',
        duration: 10000,
        description: <ToastDescription {...status} />,
      });
      toastIDRef.current = id;
    }
  }, [status, toast]);

  // form
  const form = useForm<z.infer<typeof FormSchema>>({
    defaultValues: { function: '' },
    resolver: zodResolver(FormSchema),
    mode: 'onTouched',
  });

  async function onSubmit(formData: z.infer<typeof FormSchema>) {
    // disable submit button to avoid multiple submissions
    setSubmitButtonDisabled(true);

    // open up the status toast
    toast({
      title: 'Sonification Progress',
      duration: 100000,
      description: <ToastDescription {...status} />,
    });

    // parse function to make sure it's valid
    try {
      const response = await fetch('http://localhost:8000/math/parse', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      const responseData = await response.json();
      console.log('parsing function:', responseData.status);
      if (responseData.status === 'fail') {
        // invalid function, set all statuses to false
        setStatus((prev) => ({
          ...prev,
          validFunction: false,
          animationCreated: false,
          audioCreated: false,
          videoCreated: false,
          uploadedToSupabase: false,
        }));
        return;
      }
    } catch (error) {
      console.log('Sup Error:', error);
    }
    // valid function
    setStatus((prev) => ({ ...prev, validFunction: true }));

    // now create animation
    try {
      const response = await fetch('http://localhost:8000/math/animation', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      const responseData = await response.json();
      console.log('creating animation:', responseData.status);
      if (responseData.status === 'fail') {
        // animation creation failed, set all statuses to false
        setStatus((prev) => ({
          ...prev,
          animationCreated: false,
          audioCreated: false,
          videoCreated: false,
          uploadedToSupabase: false,
        }));
        return;
      }
    } catch (error) {
      console.log('Sup Error:', error);
    }

    // animation created successfully
    setStatus((prev) => ({ ...prev, animationCreated: true }));

    // now create audio
    try {
      const response = await fetch('http://localhost:8000/math/audio', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      const responseData = await response.json();
      console.log('creating audio:', responseData.status);
      if (responseData.status === 'fail') {
        // audio creation failed, set all statuses to false
        setStatus((prev) => ({
          ...prev,
          audioCreated: false,
          videoCreated: false,
          uploadedToSupabase: false,
        }));
        return;
      }
    } catch (error) {
      console.log('Sup Error:', error);
    }

    // audio created successfully
    setStatus((prev) => ({ ...prev, audioCreated: true }));

    // now combine animation and audio
    try {
      const response = await fetch('http://localhost:8000/math/combine', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      const responseData = await response.json();
      console.log('creating video:', responseData.status);
      if (responseData.status === 'fail') {
        // combining failed, set all statuses to false
        setStatus((prev) => ({
          ...prev,
          videoCreated: false,
          uploadedToSupabase: false,
        }));
        return;
      }
    } catch (error) {
      console.log('Sup Error:', error);
    }

    // video created successfully
    setStatus((prev) => ({ ...prev, videoCreated: true }));

    // video was successfully created. time to upload to supabase.
    try {
      // pull file from folder
      const filePath = `/animations/${formData.function}.mp4`;
      const blob = await fetch(filePath).then((res) => res.blob());
      const file = new Blob([blob], { type: 'video/mp4' });

      const { data, error } = await supabase.storage
        .from('videos')
        .upload(`${userId}/${formData.function}_${Date.now()}.mp4`, file);

      if (error) {
        console.log('upload error:', error.message);
        return;
      } else {
        setStatus((prev) => ({ ...prev, uploadedToSupabase: true }));
        console.log('file uploaded successfully:', data);
      }

      // video was successfully uploaded, now we need to refresh the state
      const { data: updatedVideos } = await supabase.storage
        .from('videos')
        .list(userId + '/', {
          limit: 10,
          offset: 0,
          sortBy: {
            column: 'name',
            order: 'asc',
          },
        });

      if (updatedVideos) {
        setVideos(updatedVideos);
      }
    } catch (error) {
      console.log('File read or upload error:', error);
      return;
    }
    try {
    } catch {
      console.log('error getting videos');
    }

    // now that everything is finished, delete the intermediate files
    try {
      const response = await fetch('http://localhost:8000/math/delete', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      const responseData = await response.json();
      console.log('deleting files:', responseData.status);
    } catch {
      console.log('error did not delete files');
    }

    // re-enable submit button
    setSubmitButtonDisabled(false);
  }

  useEffect(() => {
    const getUserIDAndVideos = async () => {
      // get user id
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (user) {
        setUserId(user.id);

        // get videos
        const { data, error } = await supabase.storage
          .from('videos')
          .list(user.id + '/', {
            limit: 10,
            offset: 0,
            sortBy: { column: 'name', order: 'asc' },
          });

        if (data) {
          setVideos(data);
        } else {
          console.log('error getting videos', error);
        }
      }
    };

    getUserIDAndVideos();
  }, [supabase.auth, supabase.storage]);

  return (
    <SidebarProvider>
      <AppSidebar />
      <SidebarInset>
        <MathBreadcrumb />
        <div className='flex flex-1 flex-col gap-4 p-4 pt-0'></div>
        {/*<FloatingActionButton openFAB={openFAB} setOpenFAB={setOpenFAB} form={form} />*/}
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
                  onSubmit={form.handleSubmit(onSubmit)}
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
                  <LoadingButton disabled={submitButtonDisabled} type='submit'>
                    Sonify!
                  </LoadingButton>
                </form>
              </Form>
            </div>
          </DialogContent>
        </Dialog>
        <div className='grid auto-rows-min gap-4 md:grid-cols-3'>
          {videos
            .filter((v) => v.name.endsWith('.mp4'))
            .map((v, i) => {
              return (
                <div key={i}>
                  <video
                    controls
                    className='w-full h-auto rounded-md'
                    src={`${process.env.NEXT_PUBLIC_SUPABASE_URL}storage/v1/object/public/videos/${userId}/${v.name}`}
                  />
                </div>
              );
            })}
        </div>
        <div className='m-40 h-200 w-200'></div>
      </SidebarInset>
    </SidebarProvider>
  );
}

// code that worked originally. trying to refactor now.
/*
 {/*
          <Button
            onClick={async () => {
              try {
                const response = await fetch('http://localhost:8000/math', {
                  method: 'POST',
                  headers: {
                    'Content-Type': 'application/json',
                  },
                  body: JSON.stringify(config),
                });

                const data = await response.json();
                console.log('math:', data.result);
              } catch (error) {
                console.log('Sup Error:', error);
                return;
              }

              // video was successfully created. time to upload to supabase.
              try {
                // pull file from folder
                const filePath = `/animations/${config.function}.mp4`;
                const blob = await fetch(filePath).then((res) => res.blob());
                const file = new Blob([blob], { type: 'video/mp4' });

                const { data, error } = await supabase.storage
                  .from('videos')
                  .upload(
                    `${userId}/${config.function}_${Date.now()}.mp4`,
                    file
                  );

                if (error) {
                  console.log('upload error:', error.message);
                } else {
                  console.log('file uploaded successfully:', data);
                }

                // video was successfully uploaded, now we need to refresh the state
                const { data: updatedVideos } = await supabase.storage
                  .from('videos')
                  .list(userId + '/', {
                    limit: 10,
                    offset: 0,
                    sortBy: {
                      column: 'name',
                      order: 'asc',
                    },
                  });

                if (updatedVideos) {
                  setVideos(updatedVideos);
                }
              } catch (error) {
                console.log('File read or upload error:', error);
                return;
              }
              try {
              } catch {
                console.log('error getting videos');
              }
            }}
          >
            Test Math Sonify
          </Button>
          <div className='grid auto-rows-min gap-4 md:grid-cols-3'>
            {videos.map((v, i) => {
              return (
                <div key={i}>
                  <video
                    controls
                    className='w-full h-auto rounded-md'
                    src={`${process.env.NEXT_PUBLIC_SUPABASE_URL}storage/v1/object/public/videos/${userId}/${v.name}`}
                  />
                </div>
              );
            })}
          </div>
          <div className='min-h-[100vh] flex-1 rounded-xl bg-muted/50 md:min-h-min' />
          }






*/
