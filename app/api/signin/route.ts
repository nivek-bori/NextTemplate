import { NextResponse } from 'next/server';

import { createClient } from '@/lib/supabase/server';
import { parseError } from '@/lib/utils';

/* 
	reference types.ts for the sign in args and ret structures
*/

export async function POST(request: Request) {
	// No auth reuqired

	const body = await request.json();
	const email = body.email;
	const password = body.password;

	if (!email || !password) {
		return NextResponse.json({ status: 'error', message: 'Please provide all required information' }, { status: 400 });
	}
	if (typeof email !== 'string' || typeof password !== 'string') {
		return NextResponse.json({ status: 'error', message: 'Please provide information if correct data type' }, { status: 400 });
	}

	try {
		// Auth sign in
		const supabase = await createClient();
		const { data: auth_data, error: auth_error } = await supabase.auth.signInWithPassword({
			email: email,
			password: password,
		});

		// Auth errors
		if (auth_error) {
			return NextResponse.json({ status: 'error', message: parseError(auth_error.message) }, { status: 400 });
		}
		if (!auth_data.user) {
			return NextResponse.json({ status: 'error', message: 'Please confirm your email' }, { status: 202 });
		}

		return NextResponse.json({ status: 'success', message: 'Sign in successful!', redirectUrl: '/' }, { status: 200 });
	} catch (error: any) {
		console.log('Route: /api/signin error', error);

		return NextResponse.json({ status: 'error', message: 'Server error. Please refresh or try again later' }, { status: 500 });
	}
}
