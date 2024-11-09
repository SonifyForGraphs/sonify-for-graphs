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
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import {
  SidebarInset,
  SidebarProvider,
  SidebarTrigger,
} from '@/components/ui/sidebar';
import { createClient } from '@/utils/supabase/client';
import { useEffect, useState } from 'react';
import { FileObject } from '@supabase/storage-js';


export default function Page() {
  const supabase = createClient();
  const [userId, setUserId] = useState('');
  const [videos, setVideos] = useState<FileObject[]>([]);
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
          console.log('error getting videos');
        }
      }
    };

    getUserIDAndVideos();
  }, [supabase.auth, supabase.storage]);

  return (
    <SidebarProvider>
      <AppSidebar />
      <SidebarInset>
        <header className='flex h-16 shrink-0 items-center gap-2 transition-[width,height] ease-linear group-has-[[data-collapsible=icon]]/sidebar-wrapper:h-12'>
          <div className='flex items-center gap-2 px-4'>
            <SidebarTrigger className='-ml-1' />
            <Separator orientation='vertical' className='mr-2 h-4' />
            <Breadcrumb>
              <BreadcrumbList>
                <BreadcrumbItem className='hidden md:block'>
                  <BreadcrumbLink href='#'>
                    Building Your Application
                  </BreadcrumbLink>
                </BreadcrumbItem>
                <BreadcrumbSeparator className='hidden md:block' />
                <BreadcrumbItem>
                  <BreadcrumbPage>Data Fetching</BreadcrumbPage>
                </BreadcrumbItem>
              </BreadcrumbList>
            </Breadcrumb>
          </div>
        </header>
        <div className='flex flex-1 flex-col gap-4 p-4 pt-0'>
          <Button
            onClick={async () => {
              const config = {
                function: 'x**2',
              };
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
                const file = new Blob([blob], { type: 'video/mp4'});

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
                  {`${process.env.NEXT_PUBLIC_SUPABASE_URL}storage/v1/object/public/videos/${userId}/${v.name}`}
                  <video
                    controls
                    className='w-full h-auto rounded-md'
                    src={`${process.env.NEXT_PUBLIC_SUPABASE_URL}storage/v1/object/public/videos/${userId}/${v.name}`}
                  />
                </div>
              );
            })}
            <div className='aspect-video rounded-xl bg-muted/50' />
          </div>
          <div className='min-h-[100vh] flex-1 rounded-xl bg-muted/50 md:min-h-min' />
        </div>
      </SidebarInset>
    </SidebarProvider>
  );
}
