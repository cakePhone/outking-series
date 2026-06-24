import { createAuthClient } from 'better-auth/svelte';

export const authClient = createAuthClient();

export const { signIn, signUp, signOut, useSession } = authClient;

/** Pre-subscribed session store — created once, shared globally */
export const session = useSession();
