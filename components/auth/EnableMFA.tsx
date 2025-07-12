'use client';

import Message from '@/components/Message';
import { createClient } from '@/lib/supabase/client';
import { getDeviceName, getModernDeviceName } from '@/lib/utils/device';
import { parseError } from '@/lib/utils/server_util';
import axios from 'axios';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';

interface EnrollMFAParams {
	message?: string
}

export default function EnableMFA(params: EnrollMFAParams) {
	const supabase = createClient();
	const router = useRouter();

	const [factorId, setFactorId] = useState('');
	const [qr, setQR] = useState(''); // holds the QR code image SVG
	const [verifyCode, setVerifyCode] = useState(''); // contains the code entered by the user

	const [status, setStatus] = useState<{ status: string; message: string }>({ status: 'page_loading', message: '' });
	// 'success' 'loading' 'error' 'page_loading' 'null'

	// check if user can enable mfa -> automatically enroll a mfa factor
	useEffect(() => {
		async function exec() {
			setStatus({ status: 'page_loading', message: '' });

			// Check if user is signed in
			const { data: auth_data, error: auth_error } = await supabase.auth.getUser();
			if (auth_error) {
				console.log('get user', auth_error.message, auth_error.code); // TODO: REMOVE
				setStatus({ status: 'error', message: await parseError(auth_error.message, auth_error.code) });
				return;
			}
			if (!auth_data) {
				setStatus({ status: 'error', message: 'Please sign in before enabling multi-factor authentication' });
				router.push('/signin');
				return;
			}

			// check if mfa is already enabled
			const { data: factor_data, error: factor_error } = await supabase.auth.mfa.listFactors();
			if (factor_error) {
				console.log('factor', factor_error); // TODO: REMOVE
				setStatus({ status: 'error', message: await parseError(factor_error.message, factor_error.code) });
				return;
			}

			const controller = new AbortController();
			setTimeout(() => controller.abort(), 1000 * 60);

			// discard all unverified mfa
			await axios
				.post(`http://localhost:3000/api/mfa/`, {}, { signal: controller.signal })
				.catch(err => {
					console.log('Route /components/auth/EnrollMFA error', err); // TODO: DEV REMOVE
				});

			// if totp is already enabled
			if (factor_data.totp.some(factor => factor.status === 'verified' && factor.factor_type === 'totp')) {
				setStatus({ status: 'success', message: 'Multi-factor authentication is already enabled' });
				return;
			}

			enrollMFA();
		}
		exec();
	}, []);

	async function enrollMFA() {
		const deviceName = (await getModernDeviceName()) || getDeviceName();
		const { data: enroll_data, error: enroll_error } = await supabase.auth.mfa.enroll({ factorType: 'totp' });
		if (enroll_error) {
			console.log('enroll error', enroll_error); // TODO: REMOVE
			setStatus({ status: 'error', message: await parseError(enroll_error.message) });
			return;
		}
		if (!enroll_data || !enroll_data.id) {
			setStatus({
				status: 'error',
				message: 'There was an issue enabling multi-factor authentication. Please try again later or refresh',
			});
			return;
		}

		setFactorId(enroll_data.id);
		setQR(enroll_data.totp.qr_code);
		setStatus({ status: 'null', message: '' });
	}

	async function verifyEnrollment() {
		setStatus({ status: 'loading', message: '' });

		// enrollment challenge
		const { data: challenge_data, error: challenge_error } = await supabase.auth.mfa.challenge({ factorId });
		if (challenge_error) {
			console.log('challenge error', challenge_error); // TODO: REMOVE
			setStatus({ status: 'error', message: await parseError(challenge_error.message, challenge_error.code) });
			return;
		}
		if (!challenge_data) {
			setStatus({ status: 'error', message: 'There was an issue. Please try again later or refresh' });
			return;
		}

		const challengeId = challenge_data.id;

		// verifying enrollment challenge
		const { data: verify_data, error: verify_error } = await supabase.auth.mfa.verify({ factorId, challengeId, code: verifyCode });
		if (verify_error) {
			console.log('verify_error', verify_error); // TODO: REMOVE
			setStatus({ status: 'error', message: await parseError(verify_error.message, verify_error.code) });
			return;
		}

		setStatus({ status: 'success', message: 'Successfully enabled multi-factor authentication' });
	}

	if (status.status === 'page_loading') {
		return <Message type={'message'} message={'Loading...'}></Message>;
	}

	if (status.status === 'success') {
		return <Message type={'message'} message={status.message}></Message>;
	}

	return (
		<div className="flex h-full w-full items-center justify-center">
			<div className="mx-auto flex max-w-3xl flex-col rounded-lg bg-white p-6 shadow-md">
				<div className="flex flex-col items-center gap-[2rem] px-[2rem]">
					{params.message && (
						<div className="mx-10 mb-4 w-full rounded-md border-l-4 border-red-500 bg-red-50 p-3 text-red-700">
							<p>{params.message}</p>
						</div>
					)}

					{status.status === 'loading' && (
						<div className="mb-4 w-full rounded-md border-l-4 border-blue-500 bg-blue-50 p-3 text-blue-700">
							<p>Processing your request...</p>
						</div>
					)}

					{status.status === 'error' && (
						<div className="mx-10 mb-4 w-full rounded-md border-l-4 border-red-500 bg-red-50 p-3 text-red-700">
							<p>{status.message}</p>
						</div>
					)}

					<h2 className="mb-6 text-center text-2xl font-semibold text-gray-800">Enable Two-Factor Authentication</h2>

					<p className="mb-4 text-center text-gray-600">
						Scan this QR code with your authenticator app (like Google Authenticator, Authy, or 1Password)
					</p>
				</div>

				<div className="flex flex-col md:flex-row md:space-x-4">
					{/* QR Code Section */}
					<div className="m-10 flex flex-col items-center justify-start md:mb-0">
						{qr ? (
							<div className="flex aspect-square items-center justify-center rounded-lg border border-gray-300 bg-gray-50 p-4">
								<img src={qr} alt="QR Code for MFA setup" className="aspect-square h-40 w-40 object-contain" />
							</div>
						) : (
							status.status !== 'error' && (
								<div className="flex aspect-square h-48 w-48 items-center justify-center rounded-lg bg-gray-100">
									<svg
										className="h-8 w-8 animate-spin text-gray-500"
										xmlns="http://www.w3.org/2000/svg"
										fill="none"
										viewBox="0 0 24 24">
										<circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
										<path
											className="opacity-75"
											fill="currentColor"
											d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
									</svg>
								</div>
							)
						)}
					</div>

					{/* Input Section */}
					<div className="flex w-full flex-col justify-center">
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
							/>
						</div>

						<div className="w-full">
							<button
								onClick={verifyEnrollment}
								disabled={status.status === 'loading' || verifyCode.length !== 6}
								className="w-full rounded-md bg-blue-600 px-4 py-2 text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50">
								{status.status === 'loading' ? 'Processing...' : 'Enable MFA'}
							</button>
						</div>
					</div>
				</div>
			</div>
		</div>
	);
}
