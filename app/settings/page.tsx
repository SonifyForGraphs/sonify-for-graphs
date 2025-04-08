'use client';
import { AppSidebar } from '@/components/app-sidebar';
import { Button } from '@/components/ui/button';
import { SidebarInset, SidebarProvider } from '@/components/ui/sidebar';
import { useEffect, useRef, useState } from 'react';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
  CardFooter,
} from '@/components/ui/card';
import {
  Form,
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  FormDescription,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { SettingsBreadcrumb } from '@/components/settings/settings-breadcrumb';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import * as z from 'zod';
import { useToast } from '@/hooks/use-toast';

const FormSchema = z.object({
  audioSource: z.enum(['tones', 'surge-local', 'surge-remote']),
  surgePath: z.string().optional(),
  remoteUrl: z.string().url().optional(),
});

export default function Settings() {
  const { toast } = useToast();
  const [initialValues, setInitialValues] = useState({
    audioSource: 'tones',
    surgePath: '',
    remoteUrl: 'http://localhost:8888',
  });

  const form = useForm<z.infer<typeof FormSchema>>({
    resolver: zodResolver(FormSchema),
    defaultValues: initialValues,
  });

  // Load saved settings from localStorage on component mount
const [formReady, setFormReady] = useState(false);

// Then, update the useEffect
    useEffect(() => {
      const savedSettings = localStorage.getItem('sonificationSettings');
      console.log("Loading saved settings:", savedSettings);
      
      if (savedSettings) {
        try {
          const parsedSettings = JSON.parse(savedSettings);
          console.log("Applying settings to form:", parsedSettings);
          form.setValue('audioSource', parsedSettings.audioSource);
          
          if (parsedSettings.surgePath) {
            form.setValue('surgePath', parsedSettings.surgePath);
          }
          
          if (parsedSettings.remoteUrl) {
            form.setValue('remoteUrl', parsedSettings.remoteUrl);
          }
          
          // Update initialValues to match
          setInitialValues(parsedSettings);
          
        } catch (error) {
          console.error("Error parsing settings:", error);
        }
      }
      
      setFormReady(true);
    }, [form]);

  // Watch for changes to audioSource to conditionally show fields
  const audioSource = form.watch('audioSource');
  console.log("Current audioSource:", audioSource);

  function onSubmit(data: z.infer<typeof FormSchema>) {
    // Save settings to localStorage
    localStorage.setItem('sonificationSettings', JSON.stringify(data));

    // Show success notification
    toast({
      title: 'Settings saved',
      description: 'Your audio processing settings have been updated.',
    });
  }

  return (
    <SidebarProvider>
      <AppSidebar />
      <SidebarInset>
        <SettingsBreadcrumb />
        <div className='flex flex-1 flex-col gap-4 p-4 pt-0'>
          <Card className='w-full max-w-3xl mx-auto'>
            <CardHeader>
              <CardTitle>Audio Processing Settings</CardTitle>
              <CardDescription>
                Configure how audio is processed for sonifications
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className='space-y-6'>
                  <FormField
                    control={form.control}
                    name='audioSource'
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Audio Processing Source</FormLabel>
                        <Select
                          onValueChange={field.onChange}
                          value={field.value}
                          defaultValue={field.value}
                        >
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder='Select audio source' />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value='tones'>Tones.py (Local)</SelectItem>
                            <SelectItem value='surge-local'>Surge Synthesizer (Local)</SelectItem>
                            <SelectItem value='surge-remote'>Surge Synthesizer (Remote)</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormDescription>
                          Choose how audio will be processed for sonifications
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  {audioSource === 'surge-local' && (
                    <FormField
                      control={form.control}
                      name='surgePath'
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Surge Python Path</FormLabel>
                          <FormControl>
                            <Input placeholder='/path/to/surge-python' {...field} />
                          </FormControl>
                          <FormDescription>
                            Enter the full path to your Surge Python bindings installation
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  )}

                  {audioSource === 'surge-remote' && (
                    <FormField
                      control={form.control}
                      name='remoteUrl'
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Remote Surge API URL</FormLabel>
                          <FormControl>
                            <Input 
                              placeholder='http://192.168.1.100:8888' 
                              {...field} 
                            />
                          </FormControl>
                          <FormDescription>
                            Enter the URL of the remote Surge API (e.g., Raspberry Pi)
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  )}

                  <Button type='submit'>Save Settings</Button>
                </form>
              </Form>
            </CardContent>
          </Card>
        </div>
      </SidebarInset>
    </SidebarProvider>
  );
}