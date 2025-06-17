export type SignInArgs = {
	email: string;
	password: string;
};

export type SignInRet = {
	status: string;
	message: string;
	redirectUrl?: string;
};

export type SignUpArgs = {
	email: string;
	password: string;
	name: string;
};

export type SignUpRet = {
	status: string;
	message: string;
	redirectUrl?: string;
};

export type Role = 'admin' | 'user' | 'guest';