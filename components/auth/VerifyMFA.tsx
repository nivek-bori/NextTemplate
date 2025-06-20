'use client'

import { createClient } from "@/lib/supabase/client";
import { parseError } from '@/lib/utils/server_util';
import { useState } from "react";

interface MFAParams {
	onMFA: () => void;
}

export default function MFA(params: MFAParams) {
	const supabase = createClient();

	const [verifyCode, setVerifyCode] = useState<string>('');
	const [status, setStatus] = useState<{ status: string; message: string }>({ status: 'loading', message: '' });

	async function verifyMFA() {
		const { data: factor_data, error: factor_error } = await supabase.auth.mfa.listFactors()
		if (factor_error) {
			setStatus({ status: 'error', message: await parseError(factor_error.message, factor_error.code) });
			return;
		}
		if (!factor_data) {
			setStatus({ status: 'error', message: 'Please sign in before multi-factor authentication'});
			return;
		}

		const totpFactor = factor_data.totp[0];

		// If user does not have any mfa factors, then don't require mfa
		if (!totpFactor) {
			params.onMFA();
			return;
		}

		const factorId = totpFactor.id;

		const { data: challenge_data, error: challenge_error} = await supabase.auth.mfa.challenge({ factorId })
		if (challenge_error) {
			setStatus({ status: 'error', message: await parseError(challenge_error.message, challenge_error.code) });
			return;
		}
		if (!challenge_data) {
			setStatus({ status: 'error', message: 'There was an issue. Please try again later or refresh the page' });
			return;
		}

		const challengeId = challenge_data.id;

		const { data: verify_data, error: verify_error} = await supabase.auth.mfa.verify({
			factorId,
			challengeId,
			code: verifyCode,
		});

		if (verify_error) {
			setStatus({ status: 'error', message: await parseError(verify_error.message, verify_error.code) });
			return;
		}

		setStatus({ status: 'success', message: 'Authentication success!' });
		params.onMFA();
	}
	
	return (
		<>
			<div>Please enter the code from your authenticator app.</div>
			{status.status === 'error' && <div className='bg-red-300 border-[2px] border-b-red-600'>{status.message}</div>}
			<input
				type="text"
				value={verifyCode}
				onChange={(e) => setVerifyCode(e.target.value.trim())}
			/>
			<input type="button" value="Submit" onClick={verifyMFA} />
		</>
	)
}