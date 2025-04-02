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

                    {/* Stock Ticker Guide */}
                    <h1 className="text-2xl font-bold mt-6">Stock Ticker Guide</h1>
                    <p>You can also enter a valid stock ticker to generate a sonification of stock market trends. We fetch real-time stock data from <strong>Yahoo Finance</strong>.</p>

                    <h2 className="text-xl font-semibold mt-4">✅ Valid Examples:</h2>
                    <ul className="list-disc list-inside">
                        <li><code>META</code> (Meta)</li>
                        <li><code>SNOW</code> (Snowflake)</li>
                        <li><code>BLK</code> (BlackRock)</li>
                        <li><code>AAPL</code> (Apple)</li>
                    </ul>

                    <h2 className="text-xl font-semibold mt-4">🚫 Avoid:</h2>
                    <ul className="list-disc list-inside text-red-600">
                        <li><code>$AAPL</code> (Do not include the <code>$</code> prefix)</li>
                        <li>Invalid or non-existent stock tickers</li>
                    </ul>

                    {/* Configuration Fields */}
                    <h1 className="text-2xl font-bold mt-6">Configuration Fields</h1>
                    <ul className="list-disc list-inside">
                        <li><strong>Stock Ticker:</strong> Enter a valid stock ticker to visualize real-time stock data.</li>
                        <li><strong>Title:</strong> The name of your graph.</li>
                        <li><strong>Y-axis Label:</strong> A custom label for the vertical axis.</li>
                        <li><strong>X-axis Label:</strong> A custom label for the horizontal axis.</li>
                        <li><strong>Graph Color:</strong> Select a color to style your graph.</li>
                    </ul>

                    {/* Generating Sonification */}
                    <h1 className="text-2xl font-bold mt-6">Generating Your Sonification</h1>
                    <p>Once all required fields are filled, click <strong>Sonify!</strong> to visualize your function or stock data as a graph and convert it into sound.</p>

                </div>
            </SidebarInset>
        </SidebarProvider>
    );
}
