import { NextResponse } from 'next/server';

import { createClient } from '@/lib/supabase/server';
import { isAuthorized } from '@/lib/utils/util';
import { DeleteMFARet } from '@/app/types';
import { parseError } from '@/lib/utils/server_util';

/// POST will be for deleting a user's unverified factors - the user's factors are known from their cookies
// DELETE will be for a specific factor

export async function POST(request: Request) {
	// Auth
	const supabase = await createClient();

	const { data: auth_data, error: auth_error } = await supabase.auth.getUser();
	if (auth_error) {
		const retBody: DeleteMFARet = { status: 'error', message: 'Please sign in' };
		return NextResponse.json(retBody, { status: 401 });
	}
	if (!auth_data.user) {
		const retBody: DeleteMFARet = { status: 'error', message: 'Please sign in' };
		return NextResponse.json(retBody, { status: 401 });
	}
	if (!isAuthorized(auth_data.user.user_metadata.role, 'user')) {
		const retBody: DeleteMFARet = { status: 'error', message: 'You do not have access to this' };
		return NextResponse.json(retBody, { status: 401 });
	}

	try {
		const { data: factor_data, error: factor_error } = await supabase.auth.mfa.listFactors();
		if (factor_error) {
			console.log('factor', factor_error); // TODO: REMOVE
			const retBody: DeleteMFARet = { status: 'error', message: await parseError(factor_error.message, factor_error.code) };
			return NextResponse.json(retBody, { status: 500 });
		}
		
		// unenroll (delete) all unverified factors
		const unverified = factor_data.all.filter(factor => factor.status === 'unverified');
		for (const factor of unverified) {
			console.log('Removing unverified factor:', factor.id); // TODO: DEV REMOVE
			const { error: unenroll_error } = await supabase.auth.mfa.unenroll({ factorId: factor.id });

			if (unenroll_error) {
				console.log('Error removing factor:', unenroll_error); // TODO: DEV REMOVE
			}
		}

		const retBody: DeleteMFARet = { status: 'success', message: 'Successfully deleted all unverified factors'};
		return NextResponse.json(retBody, { status: 200 });
	} catch (error: any) {
		console.log('Route: /api/route name error', error);

		const retBody: DeleteMFARet = { status: 'error', message: 'Server error. Please refresh or try again later' };
		return NextResponse.json(retBody, { status: 500 });
	}
}
