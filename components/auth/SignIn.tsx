/* location: /app/signup/page.tsx */
'use client';

import React from 'react';
import { useState, useEffect } from 'react';

import axios from 'axios';

import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { SignInArgs } from '@/app/types';
import { parseError } from '@/lib/utils/server_util';

interface SignInParams {
	onSignIn: () => void,
	message?: string,
}

export default function SignIn(params: SignInParams) {
	const supabase = createClient();
	const router = useRouter();

	const [status, setStatus] = useState<{ status: string; message: string }>({ status: 'null', message: '' });
	// success, loading, error, null

	// TODO: REMOVE DEV
	useEffect(
		function () {
			signIn('kevinboriboonsomsin@gmail.com', 'Fourty4thirty3!');
		},
		[supabase],
	);

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
					console.log('Page /signup signup error: ', err);
					(async () => {setStatus({ status: 'error', message: await parseError(err.response.data.message) });})();
				} else {
					console.log('Page /signup signup error: ', err);
					(async () => {setStatus({ status: 'error', message: await parseError(err.message) });})();
				}
			});
	}

	return (
		<div className="flex flex-col h-full w-full items-center justify-center">
			<h1>
				Sign In
			</h1>

			{params.message && (<div className='border-2 border-blue-300 border-b-blue-500'>{params.message}</div>)}
			
			{status.status === 'success' && <p className="text-[3rem] font-[600] text-green-500"> {status.message} </p>}

			{status.status === 'error' && <p className="text-[3rem] font-[600] text-red-500"> {status.message} </p>}

			{(status.status === 'loading' || status.status === 'null') && <p className="text-[3rem] font-[600] text-gray-500"> {'Loading'} </p>}
		</div>
	);
}
