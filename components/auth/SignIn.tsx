/* location: /app/signup/page.tsx */
'use client';

import React, { useCallback } from 'react';
import { useState, useEffect } from 'react';

import axios from 'axios';

import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { SignInArgs } from '@/app/types';
import { parseError } from '@/lib/utils/server_util';

declare global {
	interface Window {
		handleGoogleAuthResponse?: (response: any) => void;
		google?: {
			accounts?: {
				id?: {
					initialize?: (config: any) => void;
					renderButton?: (element: HTMLElement, config: any) => void;
					prompt?: () => void;
				};
			};
		};
	}
}

interface SignInParams {
	onSignIn: () => void;
	message?: string;
}

export default function SignIn(params: SignInParams) {
	const supabase = createClient();
	const router = useRouter();

	const [status, setStatus] = useState<{ status: string; message: string }>({ status: 'null', message: '' });
	// success, loading, error, null

	// TODO: REMOVE DEV
	function developerSignIn() {
		signIn('kevinboriboonsomsin@gmail.com', 'Fourty4thirty3!');
	}

	// The frontend should call this function
	// Prequisite: email, password, and name are all valid - frontend should verify before this function
	async function signIn(email: string, password: string) {
		setStatus({ status: 'loading', message: 'Loading...' });

		const reqBody: SignInArgs = {
			email: email,
			password: password,
		};

		const controller = new AbortController();
		setTimeout(() => controller.abort(), 1000 * 60); // Timeout logic

		axios
			.post('http://localhost:3000/api/signin', reqBody, { signal: controller.signal })
			.then(res => {
				setStatus({ status: res.data.status, message: res.data.message });
				params.onSignIn();
			})
			.catch(err => {
				// this is an axios error - refer to docuemntation
				if (err.response) {
					console.log('Page /signup signup error: ', err); // TODO: DEV REMOVE
					(async () => {
						setStatus({ status: 'error', message: await parseError(err.response.data.message) });
					})();
				} else {
					console.log('Page /signup signup error: ', err); // TODO: DEV REMOVE
					(async () => {
						setStatus({ status: 'error', message: await parseError(err.message) });
					})();
				}
			});
	}

	const handleGoogleAuthResponse = useCallback(async (response: any) => {
		const { data: auth_data, error: auth_error } = await supabase.auth.signInWithIdToken({
			provider: 'google',
			token: response.credential,
		});
	}, []);

	// handle google social auth
	useEffect(() => {
		window.handleGoogleAuthResponse = handleGoogleAuthResponse;

		if (window.google?.accounts?.id) {
			console.log('Initializing Google Identity Services...');

			// initialize
			if (typeof window.google.accounts.id.initialize === 'function') {
				window.google.accounts.id.initialize({
					client_id: process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID,
					callback: handleGoogleAuthResponse,
					auto_select: true,
					itp_support: true,
				});
			}
			// select user account
			if (typeof window.google.accounts.id.prompt === 'function') {
				window.google.accounts.id.prompt();
			}
			// render button
			const buttonContainer = document.querySelector('.g_id_signin');
			if (buttonContainer && typeof window.google.accounts.id.renderButton === 'function') {
				window.google.accounts.id.renderButton(buttonContainer as HTMLElement, {
					type: 'standard',
					shape: 'pill',
					theme: 'outline',
					text: 'signin_with',
					size: 'large',
					logo_alignment: 'left',
				});
				console.log('Google button rendered');
			}
		} else {
			console.log('Google Identity Services not available yet');
		}

		return () => {
			delete window.handleGoogleAuthResponse;
		};
	}, []);

	return (
		<div className="flex h-full w-full flex-col items-center justify-center">
			<h1>Sign In</h1>

			<div
				id="g_id_onload"
				data-client_id={process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID}
				data-context="signin"
				data-ux_mode="popup"
				data-callback="handleGoogleAuthResponse"
				data-auto_select="true"
				data-itp_support="true"></div>

			<div
				className="g_id_signin"
				data-type="standard"
				data-shape="pill"
				data-theme="outline"
				data-text="signin_with"
				data-size="large"
				data-logo_alignment="left"></div>

			{/* TODO: REMOVE */}
			<button 
				onClick={developerSignIn}
				className="mt-4 px-4 py-2 bg-gray-600 text-white rounded hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-gray-500"
			>
				Developer Sign In
			</button>

			{params.message && <div className="border-2 border-blue-300 border-b-blue-500">{params.message}</div>}

			{status.status === 'success' && <p className="text-[3rem] font-[600] text-green-500"> {status.message} </p>}

			{status.status === 'error' && <p className="text-[3rem] font-[600] text-red-500"> {status.message} </p>}

			{(status.status === 'loading' || status.status === 'null') && <p className="text-[3rem] font-[600] text-gray-500"> {'Loading'} </p>}
		</div>
	);
}
