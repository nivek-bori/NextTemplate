import { Role } from '@/app/types';

// Parsing backend errors for front end presentation
export function parseError(message: string, code?: string): string {
	if (typeof message !== 'string') {
		throw new Error('Parse error must receive a string');
	}

	let retMessage = message;

	// supabase
	if (message === 'email_not_confirmed') message = 'Please confirm your email';

	// prisma
	if (code === 'P2002') message = 'Email address already exists';

	console.log(message, retMessage); // TODO: REMOVE
	return message;
}

const roleHierarchy: Record<Role, number> = {
	admin: 2,
	user: 1,
	guest: 0,
};

export function isAuthorized(userRole: string | null | undefined, requiredRole: string) {
	if (!userRole) {
		userRole = 'guest';
	}

	const userRoleLevel = roleHierarchy[userRole as Role];
	const requiredRoleLevel = roleHierarchy[requiredRole as Role];

	return userRoleLevel >= requiredRoleLevel;
}