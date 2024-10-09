'use client';
import { Button } from '@/components/ui/button';
import { signOut } from '../login/actions';

export default function Page() {
  return (
    <Button
      onClick={() => {
        signOut();
      }}
    >
      Sign Out
    </Button>
  );
}
