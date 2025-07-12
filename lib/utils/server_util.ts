'use server'

import { redirect } from 'next/navigation';
import { cookies } from 'next/headers';

// Parsing backend errors for front end presentation
export async function parseError(message: string, code?: string): Promise<string> {
	if (typeof message !== 'string') {
		throw new Error('Parse error must receive a string');
	}

	let retMessage = message;

	// supabase
	if (message === 'email_not_confirmed') retMessage = 'Please confirm your email';
	if (message === 'Auth session missing!') retMessage = 'Please sign in first';
	if (code === 'weak_password') retMessage = 'Password must contain: lower and upper case letters, at least 1 number, and at least 1 special character';
	if (code === 'user_not_found') {
		const cookie = await cookies();
		cookie.delete('sb-access-token');
		cookie.delete('sb-refresh-token');
		retMessage = 'Please clear you cookies and sign in again'
	}

	// prisma
	if (code === 'P2002') retMessage = 'An account with that email already exists';

	console.log('ParseError:', code, message.slice(0, 100));
	return retMessage;
}
