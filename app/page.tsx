import Link from 'next/link';
import Image from 'next/image';

export default function Home() {
  return (
    <main className="flex flex-col min-h-screen">
      {/* header */}
      <header className="w-full bg-gradient-to-r from-blue-500 to-purple-500 text-white p-6 shadow-md">
        <div className="container mx-auto flex justify-between items-center">
          <h1 className="text-2xl font-bold">Sonify for Graphs</h1>
          <nav className="space-x-4">
            <Link href="/auth/login" className="px-4 py-2 bg-white text-blue-600 rounded hover:bg-gray-200">
              Sign In
            </Link>
            <Link href="/auth/signup" className="px-4 py-2 bg-white text-blue-600 rounded hover:bg-gray-200">
              Sign Up
            </Link>
          </nav>
        </div>
      </header>

      {/* hero */}
      <section className="flex flex-col items-center justify-center bg-gray-100 py-20">
        <div className="text-center max-w-2xl">
          <h2 className="text-4xl font-extrabold mb-4">Convert Data Into Sound with Sonify for Graphs</h2>
          <p className="text-gray-700 text-lg mb-6">
            Upload your graphs or data, choose your sonification preferences, and experience data like never before.
          </p>
          <Link href="/dashboard" className="px-8 py-3 bg-blue-600 text-white text-lg rounded shadow hover:bg-blue-700">
            Get Started
          </Link>
        </div>
        <div className="mt-12">
          <Image src="/images/sonification-example.png" alt="Sonification Example" width={600} height={400} />
        </div>
      </section>

      {/* features */}
      <section className="container mx-auto py-16 grid grid-cols-1 md:grid-cols-3 gap-8">
        <div className="bg-white p-6 rounded shadow text-center">
          <h3 className="text-2xl font-bold mb-4">Upload Your Data</h3>
          <p className="text-gray-600">
            Easily upload your graph images or datasets. We support multiple formats for flexibility.
          </p>
        </div>
        <div className="bg-white p-6 rounded shadow text-center">
          <h3 className="text-2xl font-bold mb-4">Choose Sonification Style</h3>
          <p className="text-gray-600">
            Select from a variety of sonification styles, including "Left to Right", "Expanding Circles", and more.
          </p>
        </div>
        <div className="bg-white p-6 rounded shadow text-center">
          <h3 className="text-2xl font-bold mb-4">Download & Share</h3>
          <p className="text-gray-600">
            After sonifying your data, download the audio file or share it directly from your dashboard.
          </p>
        </div>
      </section>

      {/* footer */}
      <footer className="bg-gray-800 text-white py-4 text-center">
        <p>&copy; {new Date().getFullYear()} Sonify for Graphs. All rights reserved.</p>
      </footer>
    </main>
  );
}
