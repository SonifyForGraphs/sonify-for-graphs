import React from 'react';
import { AudioWaveform } from 'lucide-react';

const WebsiteIcon = () => {
  return (
    <div className='flex aspect-square size-8 items-center justify-center rounded-lg bg-sidebar-primary text-sidebar-primary-foreground'>
      <AudioWaveform className='size-4' />
    </div>
  );
};

export default WebsiteIcon;
