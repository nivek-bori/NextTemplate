'use client'
import { createClient } from '@/lib/supabase/client';
import React, { useEffect } from 'react';

export default function enable_google() {
	const supabase = createClient();

	async function handleGoogleAuthResponse(response: any) {
		const { data: auth_data, error: auth_error } = await supabase.auth.signInWithIdToken({
			provider: 'google',
			token: response.credential,
		});
	}

	// handle google social auth
	useEffect(() => {
		const initializeGoogle = () => {
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
		};

		setTimeout(initializeGoogle, 1000);

		return () => {
			delete window.handleGoogleAuthResponse;
		};
	}, []);

	
}