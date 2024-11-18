import { X, Check } from 'lucide-react';
import { Spinner } from '../ui/spinner';

export function ToastDescription({
  validTicker,
  animationCreated,
  audioCreated,
  videoCreated,
  uploadedToSupabase,
}: {
  validTicker: boolean | null;
  animationCreated: boolean | null;
  audioCreated: boolean | null;
  videoCreated: boolean | null;
  uploadedToSupabase: boolean | null;
}) {
  return (
    <pre className='mt-2 w-[340px] rounded-md bg-slate-950 p-4'>
      <div className='w-full flex flex-col my-2'>
        <div className='flex flex-row items-center rounded-md border my-1 p-2'>
          <div className='mr-2'>
            {validTicker === null ? (
              <Spinner show={true} className='text-white' />
            ) : validTicker === false ? (
              <X color='#ff0000' />
            ) : (
              <Check color='#00ff00' />
            )}
          </div>
          <span className='text-white'>Valid Ticker</span>
        </div>

        <div className='flex flex-row items-center rounded-md border my-1 p-2'>
          <div className='mr-2'>
            {animationCreated === null ? (
              <Spinner show={true} className='text-white' />
            ) : animationCreated === false ? (
              <X color='#ff0000' />
            ) : (
              <Check color='#00ff00' />
            )}
          </div>
          <span className='text-white'>Animation Created</span>
        </div>
        <div className='flex flex-row items-center rounded-md border my-1 p-2'>
          <div className='mr-2'>
            {audioCreated === null ? (
              <Spinner show={true} className='text-white' />
            ) : audioCreated === false ? (
              <X color='#ff0000' />
            ) : (
              <Check color='#00ff00' />
            )}
          </div>
          <span className='text-white'>Audio Created</span>
        </div>
        <div className='flex flex-row items-center rounded-md border my-1 p-2'>
          <div className='mr-2'>
            {videoCreated === null ? (
              <Spinner show={true} className='text-white' />
            ) : videoCreated === false ? (
              <X color='#ff0000' />
            ) : (
              <Check color='#00ff00' />
            )}
          </div>
          <span className='text-white'>Video Created</span>
        </div>
        <div className='flex flex-row items-center rounded-md border my-1 p-2'>
          <div className='mr-2'>
            {uploadedToSupabase === null ? (
              <Spinner show={true} className='text-white' />
            ) : uploadedToSupabase === false ? (
              <X color='#ff0000' />
            ) : (
              <Check color='#00ff00' />
            )}
          </div>
          <span className='text-white'>Uploaded to Supabase</span>
        </div>
      </div>
    </pre>
  );
}
