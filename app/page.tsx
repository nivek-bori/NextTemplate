import EnforceMFA from '@/components/auth/EnforceMFA';

type searchParamsType = {
	searchParams: Promise<{ message: string }>;
};

export default async function Home(args: searchParamsType) {
	const params = await args.searchParams;

	return (
		<EnforceMFA>
			<div className="flex flex-col items-center justify-center">
				{params.message && <div>{params.message}</div>}
				<div>Read the setup.txt document</div>
			</div>
		</EnforceMFA>
	);
}
