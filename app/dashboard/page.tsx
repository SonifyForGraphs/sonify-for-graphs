'use client';
import { Button } from '@/components/ui/button';
import { signOut } from '../login/actions';
import { createClient } from '@/utils/supabase/client';

export default async function Page() {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  console.log(user);
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
