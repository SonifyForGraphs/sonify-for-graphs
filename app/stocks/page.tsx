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
import { Plus, Trash } from 'lucide-react';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import * as z from 'zod';
import {
  Form,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { LoadingButton } from '@/components/ui/loading-button';
import { FloatingLabelInput } from '@/components/ui/floating-label-input';
import { StocksBreadCrumb } from '@/components/stocks/stocks-breadcrumb';
import { FormSchema } from './actions';
import { useToast } from '@/hooks/use-toast';
import { ToastDescription } from '@/components/stocks/toast-description-stocks';
import { GraphColorComboBox } from '@/components/stocks/graph-color-combo-box-stocks';
import { Card, CardContent, CardFooter } from '@/components/ui/card';

export default function Page() {
  // video stuff
  const supabase = createClient();
  const [userId, setUserId] = useState('');
  const [videos, setVideos] = useState<FileObject[]>([]);

  // audio processing settings
  const [audioSettings, setAudioSettings] = useState({
    audioSource: 'tones',
    surgePath: '',
    remoteUrl: 'http://localhost:8888',
  });

  // floating action button dialog
  const [openFAB, setOpenFAB] = useState(false);

  // submit button disabled
  const [submitButtonDisabled, setSubmitButtonDisabled] = useState(false);

  // progress/status state variables
  // valid function, create animation, create audio, merge and save video/audio, upload to supabase
  const [status, setStatus] = useState<{
    validTicker: boolean | null;
    animationCreated: boolean | null;
    audioCreated: boolean | null;
    videoCreated: boolean | null;
    uploadedToSupabase: boolean | null;
  }>({
    validTicker: null,
    animationCreated: null,
    audioCreated: null,
    videoCreated: null,
    uploadedToSupabase: null,
  });

  // Load audio settings from localStorage
  useEffect(() => {
    const savedSettings = localStorage.getItem('sonificationSettings');
    if (savedSettings) {
      try {
        const parsedSettings = JSON.parse(savedSettings);
        setAudioSettings(parsedSettings);
        console.log("Loaded audio settings:", parsedSettings);
      } catch (error) {
        console.error("Error parsing settings:", error);
      }
    }
  }, []);

  // toast stuff
  const { toast, dismiss } = useToast();
  const toastIDRef = useRef<string | null>(null);
  const dismissRef = useRef(dismiss);

  useEffect(() => {
    dismissRef.current = dismiss;
  }, [dismiss]);

  useEffect(() => {
    if (toastIDRef.current) {
      //dismiss(toastIDRef.current);
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

  // form
  const form = useForm<z.infer<typeof FormSchema>>({
    defaultValues: {
      ticker: '',
      title: '',
      y_label: '',
      x_label: '',
      graph_color: 'navy',
    },
    resolver: zodResolver(FormSchema),
    mode: 'onTouched',
  });

  // callback to handle switching colors in the child component
  const handleGraphColorSelector = (color: string) => {
    form.setValue('graph_color', color);
  };

  async function onSubmit(formData: z.infer<typeof FormSchema>) {
    // disable submit button to avoid multiple submissions
    setSubmitButtonDisabled(true);

    // open up the status toast
    toast({
      title: 'Sonification Progress',
      duration: 100000,
      description: <ToastDescription {...status} />,
    });

    // Add audio processing settings to the form data
    const dataWithSettings = {
      ...formData,
      audioProcessing: audioSettings.audioSource,
      surgePath: audioSettings.surgePath,
      remoteURL: audioSettings.remoteUrl,
    };

    console.log("Sending request with audio settings:", dataWithSettings);

    // make sure ticker is valid
    try {
      const response = await fetch('http://localhost:8000/stocks/ticker', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(dataWithSettings),
      });

      const responseData = await response.json();
      console.log('parsing ticker:', responseData.status);
      if (responseData.status === 'fail') {
        // invalid ticker, set all statuses to false
        setStatus((prev) => ({
          ...prev,
          validTicker: false,
          animationCreated: false,
          audioCreated: false,
          videoCreated: false,
          uploadedToSupabase: false,
        }));
        return;
      }
    } catch (error) {
      console.log('Ticker Error:', error);
    }
    // valid ticker
    setStatus((prev) => ({ ...prev, validTicker: true }));

    // now create animation
    try {
      const response = await fetch('http://localhost:8000/stocks/animation', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(dataWithSettings),
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
      console.log('Animation Error:', error);
    }

    // animation created successfully
    setStatus((prev) => ({ ...prev, animationCreated: true }));

    // now create audio
    try {
      const response = await fetch('http://localhost:8000/stocks/audio', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(dataWithSettings),
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
      console.log('Audio Error:', error);
    }

    // audio created successfully
    setStatus((prev) => ({ ...prev, audioCreated: true }));

    // now combine animation and audio
    try {
      const response = await fetch('http://localhost:8000/stocks/combine', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(dataWithSettings),
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
      console.log('Combine Error:', error);
    }

    // video created successfully
    setStatus((prev) => ({ ...prev, videoCreated: true }));

    // video was successfully created. time to upload to supabase.
    try {
      // pull file from folder
      const filePath = `/animations/${formData.ticker}.mp4`;
      const blob = await fetch(filePath).then((res) => res.blob());
      const file = new Blob([blob], { type: 'video/mp4' });

      const { data, error } = await supabase.storage
        .from('videos')
        .upload(`${userId}/stocks/${formData.ticker}_${Date.now()}.mp4`, file);

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
        .list(userId + '/stocks/', {
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
      const response = await fetch('http://localhost:8000/stocks/delete', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(dataWithSettings),
      });

      const responseData = await response.json();
      console.log('deleting files:', responseData.status);
    } catch {
      console.log('error did not delete files');
    }

    // re-enable submit button
    setSubmitButtonDisabled(false);

    // dismiss toast
    dismiss();
    // reset status variables
    setStatus((prev) => {
      return {
        ...prev,
        validTicker: null,
        animationCreated: null,
        audioCreated: null,
        videoCreated: null,
        uploadedToSupabase: null,
      };
    });
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
          .list(user.id + '/stocks/', {
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
        <StocksBreadCrumb />
        <div className='flex flex-1 flex-col gap-4 p-4 pt-0'>
          <Dialog open={openFAB} onOpenChange={setOpenFAB}>
            <DialogTrigger asChild>
              <Button
                className='fixed w-16 h-16 bottom-16 right-16 p-4 rounded-full shadow-lg bg-sky-900 text-white hover:bg-sky-600'
                aria-label='open dialog'
                aria-expanded={openFAB}
              >
                <Plus color='#ffffff' />
              </Button>
            </DialogTrigger>
            <DialogContent aria-labelledby='dialog-title'>
              <DialogHeader>
                <DialogTitle id='dialog-title'>
                  Enter Configuration Details
                </DialogTitle>
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
                    {/* stock ticker */}
                    <FormField
                      control={form.control}
                      name='ticker'
                      render={({ field }) => (
                        <FormItem>
                          <FloatingLabelInput
                            {...field}
                            id='ticker'
                            label='ticker'
                            aria-label='Enter a stock ticker'
                          />
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    {/* title field */}
                    <FormField
                      control={form.control}
                      name='title'
                      render={({ field }) => (
                        <FormItem>
                          <FloatingLabelInput
                            {...field}
                            id='title'
                            label='title'
                            aria-label='Enter a title'
                          />
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    {/* y-axis field */}
                    <FormField
                      control={form.control}
                      name='y_label'
                      render={({ field }) => (
                        <FormItem>
                          <FloatingLabelInput
                            {...field}
                            id='y_label'
                            label='y-axis label'
                            aria-label='Enter a y-axis label'
                          />
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    {/* x-axis field */}
                    <FormField
                      control={form.control}
                      name='x_label'
                      render={({ field }) => (
                        <FormItem>
                          <FloatingLabelInput
                            {...field}
                            id='x_label'
                            label='x-axis label'
                            aria-label='Enter a x-axis label'
                          />
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    {/* graph color */}
                    <FormField
                      control={form.control}
                      name='graph_color'
                      render={({ field }) => (
                        <FormItem className='flex flex-col'>
                          <FormLabel>Graph Color</FormLabel>
                          <GraphColorComboBox
                            field={field}
                            onSelectColor={handleGraphColorSelector}
                            aria-label='Select a graph color'
                          />
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <LoadingButton
                      disabled={submitButtonDisabled}
                      type='submit'
                      aria-label='Submit configuration details and begin sonifying'
                    >
                      Sonify!
                    </LoadingButton>
                  </form>
                </Form>
              </div>
            </DialogContent>
          </Dialog>
          <div className='grid auto-rows-min gap-4 md:grid-cols-3 p-8'>
            {videos
              .filter((v) => v.name.endsWith('.mp4'))
              .map((v, i) => {
                return (
                  <Card key={i} className='shadow-md'>
                    <CardContent>
                      <video
                        controls
                        className='w-full h-auto rounded-md'
                        src={`${process.env.NEXT_PUBLIC_SUPABASE_URL}storage/v1/object/public/videos/${userId}/stocks/${v.name}`}
                        aria-label={`Video ${i + 1}: ${v.name}`}
                      />
                      <CardFooter className='justify-end'>
                        <Button
                          className='mt-4 mb-[calc(-24px)] w-24'
                          onClick={async () => {
                            const { data, error } = await supabase.storage
                              .from('videos')
                              .remove([`${userId}/stocks/${v.name}`]);
                            if (error) {
                              console.log(error);
                            }
                          }}
                          aria-label={`Delete video ${i + 1} with name ${
                            v.name
                          }`}
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
          <div className='m-40 h-200 w-200'></div>
        </div>
      </SidebarInset>
    </SidebarProvider>
  );
}