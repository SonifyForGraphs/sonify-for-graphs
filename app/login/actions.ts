'use server';

import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';

import { createClient } from '@/utils/supabase/server';
import { Provider } from '@supabase/supabase-js';

export async function emailLogin(formData: FormData) {
  const supabase = createClient();

  // type-casting here for convenience
  // in practice, you should validate your inputs
  const data = {
    email: formData.get('email') as string,
    password: formData.get('password') as string,
  };

  const { error } = await supabase.auth.signInWithPassword(data);

  if (error) {
    redirect('/login?message=Could not authenticate user');
  }

  revalidatePath('/', 'layout');
  redirect('/todos');
}

export async function signup(formData: FormData) {
  const supabase = createClient();

  // type-casting here for convenience
  // in practice, you should validate your inputs
  const data = {
    email: formData.get('email') as string,
    password: formData.get('password') as string,
  };

  const { error } = await supabase.auth.signUp(data);

  if (error) {
    redirect('/login?message=Error signing up');
  }

  revalidatePath('/', 'layout');
  redirect('/login');
}

export async function signOut() {
  const supabase = createClient();
  const { error } = await supabase.auth.signOut();
  if (error) {
    console.log(error);
  }
  return redirect('/login');
}

export async function oAuthSignIn({
  provider,
  origin,
}: {
  provider: Provider;
  origin: string;
}) {
  if (!provider) {
    return redirect('/login?message=No provider selected');
  }

  const supabase = createClient();
  /*
   * DO THIS FOR AUTHENTICATION FOR DEPLOYING
   * origin is location.origin from the react component side
   *  onClick={async () => {
            await oAuthSignIn({provider: provider.name, origin: location.origin});
          }}
   * then in redirect URLS in supabase dashboard, we have
   * https://<project_name>.vercel.app/auth/callback   
   * https://<project_name>.vercel.app/**
   * This is for the development Vervel deployment branch
   */
  const redirectUrl = origin + '/auth/callback';
  const { data, error } = await supabase.auth.signInWithOAuth({
    provider,
    options: {
      redirectTo: redirectUrl,
    },
  });

  if (error) {
    redirect('/login?message=Could not authenticate user');
  }

  return redirect(data.url);
}
