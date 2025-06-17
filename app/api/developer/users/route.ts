import { NextResponse } from 'next/server';
import prisma from '@/lib/database/prisma';
import { createClient } from '@/lib/supabase/server';
import { createAdminClient } from '@/lib/supabase/admin';
import { parseError } from '@/lib/utils';
import { SignUpArgs } from '@/app/types';
import { error } from 'console';

// Only allow in development
const isDev = process.env.NODE_ENV === 'development';

export async function DELETE(request: Request) {
	try {
		const supabase = await createClient();

		// TODO: Add in for production, remove for development
		if (!isDev) {
			console.error('Attempted to access /api/developer in non-development environment');
			return NextResponse.json({ status: 'error', message: 'This endpoint is only available in development' }, { status: 403 });
		}

		const { data: auth_data, error: auth_error } = await supabase.auth.getUser();
		// Auth errros
		if (auth_error) return NextResponse.json({ status: 'error', message: 'Please sign in' }, { status: 401 });
		if (!auth_data.user) return NextResponse.json({ status: 'error', message: 'Please sign in' }, { status: 401 });
		if (auth_data.user.role !== 'admin') return NextResponse.json({ status: 'error', message: 'Unauthorized action' }, { status: 403 });
		// TODO: Add in for production, remove for development

		const body = await request.json();
		const deleteAuth = body.auth || false;
		const deleteDb = body.db || false;

		let errorMessages = '';

		if (deleteAuth) {
			const admin_supabase = createAdminClient();

			// Get all auth users
			const { data: admin_auth_data, error: admin_auth_error } = await admin_supabase.auth.admin.listUsers();

			// Note, if admin_auth_data.users is null, there is no error because then the request is to delete no users
			if (admin_auth_error) {
				console.error('Route /api/dev/users/delete auth delete error', admin_auth_error);
				errorMessages = errorMessages + parseError(admin_auth_error.message, admin_auth_error.code) + ' | ';
			}

			if (admin_auth_data?.users && admin_auth_data.users.length > 0) {
				for (const user of admin_auth_data.users) {
					const { error: deleteError } = await admin_supabase.auth.admin.deleteUser(user.id);
					if (deleteError) {
						console.error(`Route /api/dev/users/delete delete auth delete user id ${user.id} error`, deleteError);
						errorMessages = errorMessages + parseError(deleteError.message, deleteError.code) + ' | ';
					}
				}
			}
		}

		if (deleteDb) {
			try {
				// Delete user relationships before too
				await prisma.user.deleteMany();
			} catch (error: any) {
				console.error('Route /api/dev/users/delete delete db error', error);

				if (error && error.message) {
					if (error.code) errorMessages = errorMessages + parseError(error.message, error.code) + ' | ';
					errorMessages = errorMessages + parseError(error.message) + ' | ';
				} else {
					errorMessages = errorMessages + 'DB error' + ' | ';
				}
			}
		}

		if (!process.env.ADMIN_PASSWORD) {
			console.log('Route /api/developer/users/delete error: Admin password is not set');
		} else {
			const adminUsers: SignUpArgs[] = [
				{
					email: 'kevinboriboonsomsin@gmail.com',
					password: process.env.ADMIN_PASSWORD,
					name: 'nivek',
				},
				{
					email: 'dandepan303@gmail.com',
					password: process.env.ADMIN_PASSWORD,
					name: 'jorxy',
				},
			];

			for (const admin of adminUsers) {
				try {
					const { data: auth_data, error: auth_error } = await supabase.auth.signUp({
						email: admin.email,
						password: admin.password,
						options: {
							data: {
								name: admin.name,
								role: 'admin',
							},
							emailRedirectTo: `${process.env.HOSTING_LOCATION}/protected`,
						},
					});

					if (auth_error) throw new Error(parseError(auth_error.message, auth_error.code));
					if (!auth_data.user) throw new Error(`Error signing up ${admin.name}`);

					const db_data = await prisma.user.create({
						data: {
							id: auth_data.user.id,
							email: admin.email,
							name: admin.name,
						},
					});
				} catch (error: any) {
					console.log('Route /api/dev/user/delete signup admin error', error);
					if (error && error.message) {
						if (error.code) errorMessages = errorMessages + parseError(error.message, error.code) + ' | ';
						errorMessages = errorMessages + parseError(error.message) + ' | ';
					} else {
						errorMessages = errorMessages + 'Admin sign up error' + ' | ';
					}
				}
			}
		}

		console.log(errorMessages);

		const status = errorMessages === '' ? 'success' : 'error';
		const message = errorMessages === '' ? 'Successfully deleted all auth & db users' : errorMessages;
		return NextResponse.json({ status: status, message: message }, { status: 200 });
	} catch (error: any) {
		if (error && error.message) {
			if (error.code) return NextResponse.json({ status: 'error', message: parseError(error.message, error.code) }, { status: 500 });
			return NextResponse.json({ status: 'error', message: parseError(error.message) }, { status: 500 });
		}

		return NextResponse.json({ status: 'error', message: 'There was a server error' }, { status: 500 });
	}
}
