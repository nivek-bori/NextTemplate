/* location: /app/signup/page.tsx */
'use client';

import React from 'react';
import { useState, useEffect } from 'react';

import axios from 'axios';

import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { SignUpArgs } from '../types';
import { parseError } from '@/lib/utils/server_util';
import EnableMFA from '@/components/auth/EnableMFA';

export default function signup() {
	const supabase = createClient();
	const router = useRouter();

	const [status, setStatus] = useState<{ status: string; message: string }>({ status: 'null', message: '' });
	// success, loading, error, null

	useEffect(() => {
		signUp('kevinboriboonsomsin@gmail.com', 'Ab123456!', 'nivek');
		// signUp('deanhiran@gmail.com', 'Ab123456!', 'jorxy');
	}, []);

	// The frontend should call this function
	// Prequisite: email, password, and name are all valid - frontend should verify before this function
	async function signUp(email: string, password: string, name: string) {
		setStatus({ status: 'loading', message: 'Loading...' });

		const reqBody: SignUpArgs = {
			email: email,
			password: password,
			name: name,
		};

		const controller = new AbortController();
		setTimeout(() => controller.abort(), 1000 * 60);

		axios
			.post('http://localhost:3000/api/signup', reqBody, { signal: controller.signal })
			.then(res => {
				setStatus({ status: res.data.status, message: res.data.message });

				if (res.data.success && res.data.redirectUrl) router.push(res.data.redirectUrl);
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

	if (status.status === 'success') {
		return <EnableMFA message={'Sign Up Successful'}/>
	}

	return (
		<div className="flex h-full w-full items-center justify-center">
			{status.status === 'success' && <p className="text-[3rem] font-[600] text-green-500"> {status.message} </p>}

			{status.status === 'error' && <p className="text-[3rem] font-[600] text-red-500"> {status.message} </p>}

			{(status.status === 'loading' || status.status === 'null') && <p className="text-[3rem] font-[600] text-gray-500"> {'Loading'} </p>}
		</div>
	);
}
