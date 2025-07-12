import Link from "next/link";

export default function signup_success() {
	return (
		<div className='flex items-center justify-center gap-[0.5rem]'>
			<h1>Sign up successful</h1>
			<Link href={'/enable-mfa'}>Enable MFA</Link>
			<Link href={'/enable-google'}>Enable Google Sign In</Link>
		</div>
		
	)
}