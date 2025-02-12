'use client';
import { AppSidebar } from '@/components/app-sidebar';
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from '@/components/ui/breadcrumb';
import { Separator } from '@/components/ui/separator';
import {
  SidebarInset,
  SidebarProvider,
  SidebarTrigger,
} from '@/components/ui/sidebar';
import { FileObject } from '@supabase/storage-js';
import { createClient } from '@/utils/supabase/client';
import { ChangeEventHandler, useEffect, useRef, useState } from 'react';
import { useToast } from '@/hooks/use-toast';
import { ToastDescription } from '@/components/translation-toast-description';
import { FieldValues, SubmitHandler, useForm } from 'react-hook-form';
import { Card, CardContent, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { WaveTranslationBreadcrumb } from '@/components/wave-translation-breadcrumb';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Plus, Trash } from 'lucide-react';

export default function Translation() {
  // video stuff
  const supabase = createClient();
  const [userId, setUserId] = useState('');
  const [videos, setVideos] = useState<FileObject[]>([]);

  // floating action button dialog
  const [openFAB, setOpenFAB] = useState(false);

  // submit button disabled
  const [submitButtonDisabled, setSubmitButtonDisabled] = useState(false);

  // progress/status state variables
  // everything created, upload to supabase
  const [status, setStatus] = useState<{
    animationCreated: boolean | null;
    uploadedToSupabase: boolean | null;
  }>({
    animationCreated: null,
    uploadedToSupabase: null,
  });

  // toast stuff
  const { toast, dismiss } = useToast();
  const toastIDRef = useRef<string | null>(null);
  const dismissRef = useRef(dismiss);

  useEffect(() => {
    dismissRef.current = dismiss;
  }, [dismiss]);

  useEffect(() => {
    if (toastIDRef.current) {
      dismissRef.current(toastIDRef.current);
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

  const { handleSubmit, setValue } = useForm();
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const [uploading, setUploading] = useState(false);
  const handleFileChange = (event: any) => {
    const file = event.target.files?.[0];
    if (file) {
      setValue('file', file);
    }
  };

  const onSubmit = async (data: any) => {
    if (!data.file) return;

    const formData = new FormData();
    formData.append('file', data.file);

    setUploading(true);
    try {
      const response = await fetch('http://localhost:8000/image/translation/', {
        method: 'POST',
        body: formData,
      });

      const responseData = await response.json();
      if (responseData.status === 'fail') {
        // failed
        setStatus((prev) => ({
          ...prev,
          animationCreated: false,
          uploadedToSupabase: false,
        }));
        return;
      }

      const result = await response.json();
      console.log('Upload Success:', result);
      // video created successfully
      setStatus((prev) => ({ ...prev, animationCreated: true }));
      // video successfully created, time to upload to supabase
      try {
        // pull file from folder
        const filePath = `/animations/translation_sonify.mp4`;
        const blob = await fetch(filePath).then((res) => res.blob());
        const file = new Blob([blob], { type: 'video/mp4' });

        const { data, error } = await supabase.storage
          .from('videos')
          .upload(
            `${userId}/translation/translation_image_${Date.now()}.mp4`,
            file
          );

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
          .list(userId + '/math/', {
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
    } catch (error) {
      console.error('Error:', error);
    } finally {
      // now that everything is finished, delete the intermediate files
      /*
      try {
        const response = await fetch('http://localhost:8000/image/delete', {
          method: 'POST',
        });

        const responseData = await response.json();
        console.log('deleting files:', responseData.status);
      } catch {
        console.log('error did not delete files');
      }
      */
      // dismiss toast
      dismiss();
      // reset status variables
      setStatus((prev) => {
        return {
          ...prev,

          animationCreated: null,
          uploadedToSupabase: null,
        };
      });
      setUploading(false);
    }
  };

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
          .list(user.id + '/translation/', {
            limit: 20,
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
        <WaveTranslationBreadcrumb />
        <div className='flex flex-1 flex-col gap-4 p-4 pt-0'>
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
                <DialogTitle>Wave Translation Sonification</DialogTitle>
                <DialogDescription>Upload your image!</DialogDescription>
              </DialogHeader>
              <Card className='w-full max-w-md p-4'>
                <CardContent className='flex flex-col gap-4'>
                  <input
                    type='file'
                    accept='image/*'
                    onChange={handleFileChange}
                    ref={fileInputRef}
                    className='hidden'
                  />

                  <Button onClick={() => fileInputRef.current?.click()}>
                    Choose Image
                  </Button>

                  <Button onClick={handleSubmit(onSubmit)} disabled={uploading}>
                    {uploading ? 'Uploading...' : 'Submit'}
                  </Button>
                </CardContent>
              </Card>
            </DialogContent>
          </Dialog>
          <div className='grid auto-rows-min gap-4 md:grid-cols-3 p-8'>
            {videos
              .filter((v) => v.name.endsWith('.mp4'))
              .map((v, i) => {
                return (
                  <Card key={i} className='shadow-md'>
                    <CardContent className=''>
                      <video
                        controls
                        className='w-full h-auto rounded-md'
                        src={`${process.env.NEXT_PUBLIC_SUPABASE_URL}storage/v1/object/public/videos/${userId}/translation/${v.name}`}
                      />
                      <CardFooter className='justify-end'>
                        <Button
                          className='mt-4 mb-[calc(-24px)] w-24'
                          onClick={async () => {
                            const { data, error } = await supabase.storage
                              .from('videos')
                              .remove([`${userId}/translation/${v.name}`]);
                            if (error) {
                              console.log(error);
                            }
                          }}
                        >
                          <div className='flex flex-row justify-center items-center text-center'>
                            <Trash color='red' strokeWidth={3} />
                            <span className='ml-2'>Delete</span>
                          </div>
                        </Button>
                      </CardFooter>
                    </CardContent>
                  </Card>
                );
              })}
          </div>
        </div>
      </SidebarInset>
    </SidebarProvider>
  );
}
