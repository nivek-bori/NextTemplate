export type SignInArgs = {
	email: string;
	password: string;
};

export type SignInRet = {
	status: 'success' | 'error';
	message: string;
	redirectUrl?: string;
};

export type SignUpArgs = {
	email: string;
	password: string;
	name: string;
};

export type SignUpRet = {
	status: 'success' | 'error';
	message: string;
	redirectUrl?: string;
};

export type DeleteMFAArgs = {};

export type DeleteMFARet = {
	status: string;
	message: string;
};

export type Role = 'admin' | 'user' | 'guest';