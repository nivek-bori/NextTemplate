'use client';

import React, { useState, useEffect } from 'react';
import axios from 'axios';

export default function Developer() {
	const [userStat, setUserStat] = useState<string | null>(null);
	const [loadingUserStat, setLoadingUserStat] = useState(false);

	const [colorStat, setColorStat] = useState<string | null>(null);
	const [loadingColorStat, setLoadingColorStat] = useState(false);

	const [isDarkMode, setIsDarkMode] = useState(false);

	useEffect(() => {
		const savedMode = localStorage.getItem('blob-palette-dark-mode');
		setIsDarkMode(savedMode === 'true');
	}, []);

	// USERS
	async function deleteUsers(authUsers: boolean, dbUsers: boolean) { // automatically creates admin users too
		setLoadingUserStat(true);
		setUserStat('Deleting users...');

		axios
			.delete('http://localhost:3000/api/developer/users', { data: { auth: authUsers, db: dbUsers } })
			.then(res => {
				if (res.data.success) setUserStat(res.data.message); 
				else setUserStat('Error: ' + res.data.message);
			})
			.catch(err => {
				setUserStat('Error: ' + err.message);
			})
			.finally(() => {
				setLoadingUserStat(false);
			});
	}

	// DEVELOPER INTERFACE
	return (
		<div className={`min-h-screen transition-colors duration-200 bg-white text-white'`}>
			<div className="p-8">

				<div className="mb-8 flex flex-col gap-[0.5rem]">
					<h2 className="mb-[0.25rem] text-xl font-semibold">Database Management</h2>

					{/* User db interactions */}
					<div className="flex gap-[0.75rem]">
						<button
							onClick={() => {
								deleteUsers(true, true);
							}}
							disabled={loadingUserStat}
							className="w-[12rem] rounded bg-red-600 px-4 py-2 text-white transition-colors hover:bg-red-700 disabled:bg-gray-400">
							{loadingUserStat ? 'Deleting...' : 'Delete All users'}
						</button>

						<button
							onClick={() => {
								deleteUsers(true, false);
							}}
							disabled={loadingUserStat}
							className="w-[12rem] rounded bg-red-600 px-4 py-2 text-white transition-colors hover:bg-red-700 disabled:bg-gray-400">
							{loadingUserStat ? 'Deleting...' : 'Delete Auth users'}
						</button>

						<button
							onClick={() => {
								deleteUsers(false, true);
							}}
							disabled={loadingUserStat}
							className="w-[12rem] rounded bg-red-600 px-4 py-2 text-white transition-colors hover:bg-red-700 disabled:bg-gray-400">
							{loadingUserStat ? 'Deleting...' : 'Delete DB users'}
						</button>
					</div>

					{userStat && <p className={`mt-2 text-sm font-medium text-gray-300`}>{userStat}</p>}
					{colorStat && <p className={`mt-2 text-sm font-medium text-gray-300`}>{colorStat}</p>}
				</div>

				<div className={`text-sm text-gray-400`}>
					<p>Warning: These actions cannot be undone and should only be used in development.</p>
				</div>
			</div>
		</div>
	);
}
