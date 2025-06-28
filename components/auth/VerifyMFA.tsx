'use client';

import { createClient } from '@/lib/supabase/client';
import { parseError } from '@/lib/utils/server_util';
import { useState } from 'react';

interface MFAParams {
	onMFA: () => void;
}

export default function VerifyMFA(params: MFAParams) {
	const supabase = createClient();

	const [verifyCode, setVerifyCode] = useState<string>('');
	const [status, setStatus] = useState<{ status: string; message: string }>({ status: 'null', message: '' });
	// 'success' 'error' 'loading' 'null'

	async function verifyMFA() {
		const { data: factor_data, error: factor_error } = await supabase.auth.mfa.listFactors();
		if (factor_error) {
			setStatus({ status: 'error', message: await parseError(factor_error.message, factor_error.code) });
			return;
		}
		if (!factor_data) {
			setStatus({ status: 'error', message: 'Please sign in before multi-factor authentication' });
			return;
		}

		const totpFactor = factor_data.totp[0];

		// If user does not have any mfa factors, then don't require mfa
		if (!totpFactor) {
			params.onMFA();
			return;
		}

		const factorId = totpFactor.id;

		const { data: challenge_data, error: challenge_error } = await supabase.auth.mfa.challenge({ factorId });
		if (challenge_error) {
			setStatus({ status: 'error', message: await parseError(challenge_error.message, challenge_error.code) });
			return;
		}
		if (!challenge_data) {
			setStatus({ status: 'error', message: 'There was an issue. Please try again later or refresh the page' });
			return;
		}

		const challengeId = challenge_data.id;

		const { data: verify_data, error: verify_error } = await supabase.auth.mfa.verify({
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
		<div className="flex h-full w-full items-center justify-center">
			<div className="mx-auto flex max-w-md flex-col rounded-lg bg-white p-6 shadow-md">
				<h2 className="mb-6 text-center text-2xl font-semibold text-gray-800">Two-Factor Authentication</h2>

				{status.status === 'loading' && (
					<div className="mb-4 w-full rounded-md border-l-4 border-blue-500 bg-blue-50 p-3 text-blue-700">
						<p>Processing your request...</p>
					</div>
				)}

				{status.status === 'error' && (
					<div className="mb-4 w-full rounded-md border-l-4 border-red-500 bg-red-50 p-3 text-red-700">
						<p>{status.message}</p>
					</div>
				)}

				{status.status === 'success' && (
					<div className="mb-4 w-full rounded-md border-l-4 border-green-500 bg-green-50 p-3 text-green-700">
						<p>{status.message}</p>
					</div>
				)}

				<p className="mb-4 text-center text-gray-600">Please enter the 6-digit code from your authenticator app</p>

				<div className="mb-4">
					<label htmlFor="verifyCode" className="mb-1 block text-sm font-medium text-gray-700">
						Verification Code
					</label>
					<input
						type="text"
						id="verifyCode"
						placeholder="Enter 6-digit code"
						value={verifyCode}
						onChange={e => setVerifyCode(e.target.value.trim())}
						className="w-full rounded-md border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
						maxLength={6}
						inputMode="numeric"
						autoFocus
					/>
				</div>

				<button
					onClick={verifyMFA}
					disabled={status.status === 'loading' || verifyCode.length !== 6}
					className="w-full rounded-md bg-blue-600 px-4 py-2 text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50">
					{status.status === 'loading' ? 'Verifying...' : 'Verify Code'}
				</button>
			</div>
		</div>
	);
}
