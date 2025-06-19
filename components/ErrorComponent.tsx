import React from 'react';

interface ErrorComponentParams {
	message: string;
}

export default function ErrorComponent(params: ErrorComponentParams) {
	return (
		<div className="flex items-center justify-center">
			<div className="border border-r-[2rem] border-red-500 bg-red-300 p-[3rem]">
				<p>{params.message}</p>
			</div>
		</div>
	);
}