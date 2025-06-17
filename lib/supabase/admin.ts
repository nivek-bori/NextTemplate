import { createClient } from '@supabase/supabase-js';

export function createAdminClient() {
	const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
	const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

	if (!supabaseUrl || !supabaseServiceRoleKey) {
		throw new Error('Missing required environment variables for Supabase admin client');
	}

	return createClient(supabaseUrl, supabaseServiceRoleKey);
}
