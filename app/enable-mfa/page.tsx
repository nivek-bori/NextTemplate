import { createClient } from "@/lib/supabase/client";
import { parseError } from "@/lib/utils";
import { useEffect, useState } from "react";

export function EnrollMFA({ onEnrolled, onCancelled }: { onEnrolled: () => void; onCancelled: () => void }) {
	const supabase = createClient();

	const [factorId, setFactorId] = useState('');
	const [qr, setQR] = useState(''); // holds the QR code image SVG
	const [verifyCode, setVerifyCode] = useState(''); // contains the code entered by the user
	
	const [status, setStatus] = useState<{ status: string; message: string }>({ status: 'null', message: '' });
	// 'success' 'loading' 'error'

	// automatically enroll a mfa factor
	useEffect(() => {
		async function exec() {
			const { data: enroll_data, error: enroll_error } = await supabase.auth.mfa.enroll({ factorType: 'totp' });

			// enroll errors
			if (enroll_error) {
				setStatus({ status: 'error', message: parseError(enroll_error.message) });
				return;
			}
			if (!enroll_data || !enroll_data.id) {
				setStatus({ status: 'error', message: 'There was an issue enabling multi-factor authentication. Please try again later or refresh' });
				return;
			}

			setFactorId(enroll_data.id);

			setQR(enroll_data.totp.qr_code);
		}
		exec();
	}, []);

	function verifyEnrollment() {
		async function exec() {
			setStatus({ status: 'loading', message: ''});

			// enrollment challenge
			const { data: challenge_data, error: challenge_error } = await supabase.auth.mfa.challenge({ factorId });

			// challenge errors
			if (challenge_error) {
				setStatus({ status: 'error', message: parseError(challenge_error.message) });
				return;
			}

			const challengeId = challenge_data.id;

			// verifying enrollment challenge
			const verify = await supabase.auth.mfa.verify({
				factorId,
				challengeId,
				code: verifyCode,
			});

			// verifying errors
			if (verify.error) {
				setStatus({ status: 'error', message: verify.error.message });
				return;
			}

			onEnrolled();
		}
		exec();
	};

	return (
		<>
			{status.status === 'error' && (
				<div className="flex items-center justify-center border-[2px] border-b-red-700 bg-red-400 p-[1rem]">
					<p>{status.message}</p>
				</div>
			)}
			<img src={qr} />
			<input type="text" value={verifyCode} onChange={e => setVerifyCode(e.target.value.trim())} />
			<input type="button" value="Enable" onClick={verifyEnrollment} />
			<input type="button" value="Cancel" onClick={onCancelled} />
		</>
	);
}
