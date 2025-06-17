import { NextResponse } from 'next/server';

import { createClient } from '@/lib/supabase/server';
import { createAdminClient } from '@/lib/supabase/admin';
import prisma from '@/lib/database/prisma';
import { parseError } from '@/lib/utils';

/* 
	reference types.ts for the sign in args and ret structures
*/

export async function POST(request: Request) {
	const body = await request.json();
	const email = body.email;
	const password = body.password;
	const name = body.name;

	if (!email || !password || !name) {
		return NextResponse.json({ status: 'error', message: 'Not all fields provided: email, password, name' }, { status: 400 });
	}

	const supabase = await createClient();

	let auth_data_ = null;
	let user_created: boolean = false;

	try {
		// Auth sign up
		const { data: auth_data, error: auth_error } = await supabase.auth.signUp({
			email: email,
			password: password,
			options: {
				data: {
					name: name,
					role: 'user',
				},
				emailRedirectTo: `${process.env.HOSTING_LOCATION}/`,
			},
		});

		// Auth errros
		if (auth_error) {
			return NextResponse.json({ status: 'error', message: parseError(auth_error.message) }, { status: 400 });
		}
		if (!auth_data.user) {
			return NextResponse.json({ status: 'error', message: 'There was an issue signing up. Please try again' }, { status: 500 });
		}

		auth_data_ = auth_data;

		// DB sign up
		const db_data = await prisma.user.create({
			data: {
				id: auth_data.user.id,
				email: email,
				name: name,
			},
		});

		user_created = true;

		return NextResponse.json(
			{ status: 'success', message: `Welcome ${name}. Please confirm your email`, redirectUrl: '/signup-success' },
			{ status: 200 },
		);
	} catch (error: any) {
		console.log('Route: /api/signup error error', error);

		if (auth_data_?.user && user_created) {
			const supabase = createAdminClient();
			await supabase.auth.admin.deleteUser(auth_data_.user.id);
		}

		return NextResponse.json({ status: 'errror', message: 'Server error. Please refresh or try again later' }, { status: 500 });
	}
}
