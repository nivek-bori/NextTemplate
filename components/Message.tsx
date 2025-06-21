import React from 'react';

interface MessageParams {
	type: 'message' | 'error';
	message: string;
}

export default function Message(params: MessageParams) {
	return (
		<div className="flex items-center justify-center">
			{params.type === 'message' && 
				<div className="border-[2rem] border-blue-500 bg-red-blue p-[2rem]">
					<p>{params.message}</p>
				</div>
			}
			{params.type === 'error' && 
				<div className="border-[2rem] border-red-500 bg-red-300 p-[2rem]">
					<p>{params.message}</p>
				</div>
			}
			
		</div>
	);
}