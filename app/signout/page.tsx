'use client';

import Message from '@/components/Message';
import { createClient } from '@/lib/supabase/client';
import { parseError } from '@/lib/utils/server_util';
import React, { useEffect, useState } from 'react';

export default function signout() {
	const supabase = createClient();

	const [status, setStatus] = useState<{ status: string; message: string }>({ status: 'loading', message: 'Loading...' });
	// 'success' 'error' 'loading'

	useEffect(() => {
		async function exec() {
			const { error: auth_error } = await supabase.auth.signOut();
			if (auth_error) {
				setStatus({ status: 'error', message: await parseError(auth_error.message, auth_error.code) });
				return;
			}

			setStatus({ status: 'success', message: 'Signed out successfully' });
		}
		exec();
	}, [supabase]);

	if (status.status === 'error') {
		return <Message type={'error'} message={status.message} />;
	}

	return <Message type={'message'} message={status.message} />;
}
