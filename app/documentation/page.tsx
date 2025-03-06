'use client';
import { AppSidebar } from '@/components/app-sidebar';
import { Separator } from '@/components/ui/separator';
import {
  SidebarInset,
  SidebarProvider,
} from '@/components/ui/sidebar';
import { Card, CardContent, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { DocumentationBreadcrumb } from '@/components/documentation-breadcrumb';

export default function Documentation() {
  return (
    <SidebarProvider>
      <AppSidebar />
      <SidebarInset>
        <DocumentationBreadcrumb />
        <div className='flex flex-1 flex-col gap-4 p-4 pt-0'>
        </div>
      </SidebarInset>
    </SidebarProvider>
  );
}
