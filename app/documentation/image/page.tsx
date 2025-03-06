'use client';
import { AppSidebar } from '@/components/app-sidebar';
import {
    SidebarInset,
    SidebarProvider,
} from '@/components/ui/sidebar';
import { DocumentationBreadcrumb } from '@/components/documentation-breadcrumb';

export default function Documentation() {
    return (
        <SidebarProvider>
            <AppSidebar />
            <SidebarInset>
                <DocumentationBreadcrumb />
                <div className='flex flex-1 flex-col gap-4 p-4 pt-0'>

                    {/* Image Upload Guide */}
                    <h1 className="text-2xl font-bold mt-6">Image Upload Guide</h1>
                    <p>You can upload an image file to generate a sonification based on its visual characteristics. Ensure your image follows these guidelines:</p>

                    <h2 className="text-xl font-semibold mt-4">✅ Supported Formats:</h2>
                    <ul className="list-disc list-inside">
                        <li><code>.jpeg</code></li>
                        <li><code>.jpg</code></li>
                        <li><code>.png</code></li>
                    </ul>

                    <h2 className="text-xl font-semibold mt-4">🚫 Unsupported Formats:</h2>
                    <ul className="list-disc list-inside text-red-600">
                        <li><code>.gif</code></li>
                        <li><code>.bmp</code></li>
                        <li><code>.svg</code></li>
                        <li><code>.webp</code></li>
                    </ul>

                </div>
            </SidebarInset>
        </SidebarProvider>
    );
}
