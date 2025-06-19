import { createClient } from "@/lib/supabase/client";

interface MFAParams {
	onMFA: () => void;
}

export default function MFA(params: MFAParams) {
	const supabase = createClient();

	// call onMFA when user is mfa verified

	function verifyMFA() {
		async function exec() {
			const { data: factor_data, error: factor_error } = await supabase.auth.mfa.listFactors()
			if (!factor_data || factor_error) {
				
			}
	
			const totpFactor = factors.data.totp[0]
	
			if (!totpFactor) {
			throw new Error('No TOTP factors found!')
			}
	
			const factorId = totpFactor.id
	
			const challenge = await supabase.auth.mfa.challenge({ factorId })
			if (challenge.error) {
			setError(challenge.error.message)
			throw challenge.error
			}
	
			const challengeId = challenge.data.id
	
			const verify = await supabase.auth.mfa.verify({
			factorId,
			challengeId,
			code: verifyCode,
			})
			if (verify.error) {
			setError(verify.error.message)
			throw verify.error
			}
		}
		exec():
	}

	return ();
}

function AuthMFA() {
	const [verifyCode, setVerifyCode] = useState('')
	const [error, setError] = useState('')
  
	const onSubmitClicked = () => {
	  setError('')
	  ;(async () => {
		
	  })()
	}
  
	return (
	  <>
		<div>Please enter the code from your authenticator app.</div>
		{error && <div className="error">{error}</div>}
		<input
		  type="text"
		  value={verifyCode}
		  onChange={(e) => setVerifyCode(e.target.value.trim())}
		/>
		<input type="button" value="Submit" onClick={onSubmitClicked} />
	  </>
	)
  }