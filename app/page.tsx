type searchParamsType = {
	searchParams: Promise<{ message: string }>;
};

export default async function Home(args: searchParamsType) {
	const params = await args.searchParams;

	return (
		<div className="flex items-center justify-center">
			(params.message && {
				// pop up message
				<div>
					{params.message}
				</div>
			})

			<div>Read the setup.txt document</div>
		</div>
	);
}
