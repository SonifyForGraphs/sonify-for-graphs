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
                    <h1 className="text-2xl font-bold">Function Input Guide</h1>
                    <p>To create your sonification, enter a valid mathematical function using <strong>only</strong> the variable <code>x</code>. Follow these guidelines:</p>

                    <h2 className="text-xl font-semibold mt-4">✅ Valid Examples:</h2>
                    <ul className="list-disc list-inside">
                        <li><code>x</code></li>
                        <li><code>x**2</code></li>
                        <li><code>sin(x)</code></li>
                        <li><code>floor(x)</code></li>
                    </ul>

                    <h2 className="text-xl font-semibold mt-4">🚫 Avoid:</h2>
                    <ul className="list-disc list-inside text-red-600">
                        <li><code>x^2</code> (use <code>x**2</code> instead)</li>
                        <li><code>cot(x)</code> (as it can involve division by zero)</li>
                        <li>Additional variables like <code>y, t, z</code></li>
                    </ul>

                    <h1 className="text-2xl font-bold mt-6">Configuration Fields</h1>
                    <ul className="list-disc list-inside">
                        <li><strong>Function:</strong> Define the mathematical expression in terms of <code>x</code>. This will be used to generate the graph and corresponding sound.</li>
                        <li><strong>Title:</strong> The name of your graph.</li>
                        <li><strong>Y-axis Label:</strong> A custom label for the vertical axis.</li>
                        <li><strong>X-axis Label:</strong> A custom label for the horizontal axis.</li>
                        <li><strong>Graph Color:</strong> Select a color to style your graph.</li>
                    </ul>

                    <h1 className="text-2xl font-bold mt-6">Generating Your Sonification</h1>
                    <p>Once all required fields are filled, click <strong>Sonify!</strong> to visualize your function as a graph and convert it into sound.</p>
                </div>
            </SidebarInset>
        </SidebarProvider>
    );
}
