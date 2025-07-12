'use client'

import EnforceMFA from '@/components/auth/EnforceMFA';
import Message from '@/components/Message';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { useCallback, useEffect } from 'react';

export default function signin() {
	const router = useRouter();
	const searchParams = useSearchParams();
	const message = searchParams.get('message');

	const redirect = useCallback(() => {router.push('/')}, [router]);

	return (
		<EnforceMFA>
			<div className="flex h-full w-full flex-col items-center justify-center">
				<Message type={'message'} message={message || 'successful sign in'} />
				<Link href={'/'}>Home page</Link>
				<Link href={'/enable-mfa'}>Enable MFA</Link>
			</div>
		</EnforceMFA>
	);
}