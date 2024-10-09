'use client';
import { Button } from '@/components/ui/button';
import { Provider } from '@supabase/supabase-js';
import { Github } from 'lucide-react';
import { oAuthSignIn } from './actions';

type OAuthProvider = {
  name: Provider;
  displayName: string;
  icon?: JSX.Element;
  key: string;
};

export function OAuthButtons() {
  const oAuthProviders: OAuthProvider[] = [
    {
      name: 'github',
      displayName: 'GitHub',
      icon: <Github className='size-5' />,
      key: '1',
    },
    /*
    {
      name: 'google',
      displayName: 'Google',
      icon: <Github className='size-5' />,
      key: '2',
    },*/
  ];

  return (
    <>
      {oAuthProviders.map((provider) => (
        <Button
          key={provider.key}
          className='flex w-full items-center justify-center gap-2'
          variant='outline'
          onClick={async () => {
            await oAuthSignIn({
              provider: provider.name,
              origin: location.origin,
            });
          }}
        >
          {provider.icon}
          Login with {provider.displayName}
        </Button>
      ))}
    </>
  );
}
