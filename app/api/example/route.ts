import { NextResponse } from 'next/server';

import { createClient } from '@/lib/supabase/server';
import { isAuthorized } from '@/lib/utils';

/* 
	reference types.ts for the sign in args and ret structures
*/

export async function POST(request: Request) {
	// Auth
	const supabase = await createClient();

	const { data: auth_data, error: auth_error } = await supabase.auth.getUser();
	if (auth_error) return NextResponse.json({ status: 'error', message: 'Please sign in' }, { status: 401 });
	if (!auth_data.user) return NextResponse.json({ status: 'error', message: 'Please sign in' }, { status: 401 });
	if (!isAuthorized(auth_data.user.user_metadata.role, 'todo')) return NextResponse.json({ status: 'error', message: 'You do not have access to this'}, { status: 401 });

	// Request parameter verification
	const body = await request.json();
	const bodyData = body.data;

	if (!bodyData) {
		return NextResponse.json({ status: 'error', message: 'Please provide all required information' }, { status: 400 });
	}
	if (typeof bodyData !== 'string') { // set to desired dtype
		return NextResponse.json({ status: 'error', message: 'Please provide information if correct data type' }, { status: 400 });
	}

	try {
		/* logic */

		return NextResponse.json({ status: 'success', message: 'todo: success message', redirectUrl: '/' }, { status: 200 });
	} catch (error: any) {
		console.log('Route: /api/route name error', error);

		return NextResponse.json({ status: 'error', message: 'Server error. Please refresh or try again later' }, { status: 500 });
	}
}
