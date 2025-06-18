import { NextResponse } from 'next/server';

import { createClient } from '@/lib/supabase/server';
import { parseError } from '@/lib/utils';
import { SignInRet } from '@/app/types';

/* 
	reference types.ts for the sign in args and ret structures
*/

export async function POST(request: Request) {
	// No auth reuqired

	const body = await request.json();
	const email = body.email;
	const password = body.password;

	if (!email || !password) {
		const retBody: SignInRet = { status: 'error', message: 'Please provide all required information' };
		return NextResponse.json(retBody, { status: 400 });
	}
	if (typeof email !== 'string' || typeof password !== 'string') {
		const retBody: SignInRet = { status: 'error', message: 'Please provide information if correct data type' };
		return NextResponse.json(retBody, { status:  400});
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
			const retBody: SignInRet = { status: 'error', message: parseError(auth_error.message, auth_error.code) }
			return NextResponse.json(retBody, { status: 400 });
		}
		if (!auth_data.user) {
			const retBody: SignInRet = { status: 'error', message: 'Please confirm your email' }
			return NextResponse.json(retBody, { status: 202 });
		}

		const retBody: SignInRet = { status: 'success', message: 'Sign in successful!', redirectUrl: '/' };
		return NextResponse.json(retBody, { status: 200 });
	} catch (error: any) {
		console.log('Route: /api/signin error', error);

		const retBody: SignInRet = { status: 'error', message: 'Server error. Please refresh or try again later' }
		return NextResponse.json(retBody, { status: 500 });
	}
}
