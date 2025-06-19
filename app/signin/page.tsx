'use client'

import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

export default function signin() {
	// This page will be surrounded in the full auth flow (sign in + mfa)
	// When this page is rendered, the user will already be signed in

	const router = useRouter();

	useEffect(() => {
		router.push('/');
	})

	return (
		<p>successful sign in</p>
	)
}