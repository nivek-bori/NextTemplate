'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { createClient } from '@/lib/supabase/client';
import VerifyMFA from '@/components/auth/VerifyMFA';
import { parseError } from '@/lib/utils/server_util';
import SignIn from '@/components/auth/SignIn';
import Message from '@/components/Message';

/* 
	if a facotr is in totp -> it is verified
	if it is in all, then it is either verified or unverified
*/

export default function EnforceMFA({ children }: Readonly<{ children: React.ReactNode }>) {
	const supabase = createClient();

	const [status, setStatus] = useState<{ status: string; message: string }>({ status: 'loading', message: '' });
	// 'signin' 'mfa' 'authenticated' 'error' 'loading'

	const checkMFA = useCallback(async () => {
		try {
			const { data: auth_data, error: auth_error } = await supabase.auth.mfa.getAuthenticatorAssuranceLevel();

			// Auth error
			if (auth_error) {
				setStatus({ status: 'error', message: await parseError(auth_error.message, auth_error.code) });
				return;
			}
			if (!auth_data || !auth_data.nextLevel || !auth_data.currentLevel) {
				setStatus({ status: 'signin', message: 'Please sign in' });
				return;
			}

			// if user is not signed in, auth_data is null -> we know user is signed in

			// list mfa factors that user has
			const { data: factors_data, error: factors_error } = await supabase.auth.mfa.listFactors();

			// factor errors
			if (factors_error) {
				setStatus({ status: 'error', message: await parseError(factors_error.message, factors_error.code) });
				return;
			}
			if (!factors_data) {
				setStatus({ status: 'error', message: "There was an issue verifying the user's identity. Please try again later or refresh" });
				return;
			}

			// if totp mfa factors verified -> enforce mfa
			if (factors_data.totp.some(factor => factor.status === 'verified')) {
				console.log(auth_data);
				// enforce mfa - 'aal1' is caught above
				if (auth_data.nextLevel === 'aal2' && auth_data.nextLevel !== auth_data.currentLevel) {
					setStatus({ status: 'mfa', message: 'Please complete your multi-factor authentication' });
					return;
				}
			}

			setStatus({ status: 'authenticated', message: 'Welcome!' });
		} catch (error: any) {
			console.log('Route example/api/layout error', error);

			if (error && error.message) setStatus({ status: 'error', message: await parseError(error.message) });
			setStatus({ status: 'error', message: 'There was an issue when loading the page. Please try again later or refresh' });
		}
	}, [supabase]);

	useEffect(() => {
		checkMFA();
	}, [checkMFA]);

	if (status.status === 'error') {
		return <Message type={'error'} message={status.message} />;
	}
	if (status.status === 'signin') {
		return <SignIn onSignIn={checkMFA} />;
	}
	if (status.status === 'mfa') {
		return <VerifyMFA onMFA={checkMFA} />;
	}
	if (status.status === 'authenticated') {
		return <>{children}</>;
	}

	// the only status left should be loading -> assert loading status
	if (status.status !== 'loading') {
		throw new Error('MFA layout error unfamiliar status');
	}
	return <Message type={'message'} message={'Loading...'}></Message>
}
