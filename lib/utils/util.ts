import { Role } from '@/app/types';

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