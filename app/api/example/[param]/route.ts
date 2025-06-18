import { NextResponse } from 'next/server';

import { createClient } from '@/lib/supabase/server';
import { isAuthorized } from '@/lib/utils';

/* 
	add in Arg and Ret types to @/app/types.ts

	change the name of the [param] to the name of the param you want
		exa. /example/[id] means context: { params: Promise<{ id: string }>
*/


// TODO: Modify and add to @/app/types.ts
export type ExampleArgs = {
	email: string;
	password: string;
	name: string;
};

export type ExampleRet = {
	status: string;
	message: string;
	redirectUrl?: string;
};

export async function POST(request: Request, context: { params: Promise<{ param: string }> }) {
	// Auth
	const supabase = await createClient();

	const { data: auth_data, error: auth_error } = await supabase.auth.getUser();
	if (auth_error) {
			const retBody: ExampleRet = { status: 'error', message: 'Please sign in' }
			return NextResponse.json(retBody, { status: 401 });
		}
		if (!auth_data.user) {
			const retBody: ExampleRet = { status: 'error', message: 'Please sign in' }
			return NextResponse.json(retBody, { status: 401 });
		}
		if (!isAuthorized(auth_data.user.user_metadata.role, 'todo')) {
			const retBody: ExampleRet = { status: 'error', message: 'You do not have access to this' };
			return NextResponse.json(retBody, { status: 401 });
		}

	// Request parameter verification
	const param = (await context.params).param;
	const body = await request.json();
	const bodyData = body.data;

	if (!bodyData) {
			const retBody: ExampleRet = { status: 'error', message: 'Please provide all required information' };
			return NextResponse.json(retBody, { status: 400 });
		}
		if (typeof bodyData !== 'string') { // set to desired dtype
			const retBody: ExampleRet = { status: 'error', message: 'Please provide information if correct data type' };
			return NextResponse.json(retBody, { status: 400 });
		}

	try {
		/* logic */

		const retBody: ExampleRet = { status: 'success', message: 'todo: success message', redirectUrl: '/' };
		return NextResponse.json(retBody, { status: 200 });
	} catch (error: any) {
		console.log('Route: /api/route name error', error);

		const retBody: ExampleRet = { status: 'error', message: 'Server error. Please refresh or try again later' };
		return NextResponse.json(retBody, { status: 500 });
	}
}
