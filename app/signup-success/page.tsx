/* 
	Landing page for users who just signed up
		Asks them to confirm their email
		Allows them to proceed to sign in
*/

import Link from 'next/link';

type searchParamsType = {
	searchParams: Promise<{ message: string }>;
};

export default async function signUpSuccess(args: searchParamsType) {
	const params = await args.searchParams;

	return (
		<div className="flex flex-col h-full w-full items-center justify-center">
			<h1>Sign in successful</h1>
			{/* If there is a message in the url, display it */}
			{params.message && <p>{params.message}</p>}
			<p>Please confirm your email</p>
			<Link href="/signin">Sign in</Link>
		</div>
	);
}
