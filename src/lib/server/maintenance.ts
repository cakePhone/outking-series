import { env } from '$env/dynamic/private';
import { fetchGuildMember, fetchGuildRoles, getValidDiscordToken } from './discord';

/** Roadblock cleared cookie: present means the visitor may see the real app in prod */
export const MAINTENANCE_COOKIE = 'ok_roadblock_cleared';
export const MAINTENANCE_COOKIE_VALUE = 'cleared';

const ADMIN_PERMISSION_BIT = 0x8; // Discord "Administrator" permission

const adminCache = new Map<string, { admin: boolean; ts: number }>();
const ADMIN_CACHE_TTL = 5 * 60 * 1000; // 5 minutes

/**
 * Admin gate for early access:
 * 1. Explicit user id allowlist (ADMIN_DISCORD_USER_IDS), always granted
 * 2. Member of ADMIN_GUILD_ID holding a role with Administrator, or a role
 *    with the ADMIN_ROLE_IDS environment variable
 */
export async function isAdminUser(userId: string): Promise<boolean> {
	const cached = adminCache.get(userId);
	if (cached && Date.now() - cached.ts < ADMIN_CACHE_TTL) return cached.admin;

	const admin = await checkAdminUncached(userId);
	adminCache.set(userId, { admin, ts: Date.now() });
	return admin;
}

async function checkAdminUncached(userId: string): Promise<boolean> {
	// Fallback allowlist: never lock yourself out while the bot token is missing
	const allowlist = (env.ADMIN_DISCORD_USER_IDS ?? '')
		.split(',')
		.map((id) => id.trim())
		.filter(Boolean);
	if (allowlist.includes(userId)) return true;

	const guildId = env.ADMIN_GUILD_ID;
	if (!guildId) {
		console.error('[maintenance] ADMIN_GUILD_ID not set - no one can get early access');
		return false;
	}

	const token = await getValidDiscordToken(userId);
	if (!token) return false;

	const member = await fetchGuildMember(token, guildId);
	if (!member) return false;

	const allowedRoleIds = (env.ADMIN_ROLE_IDS ?? '')
		.split(',')
		.map((id) => id.trim())
		.filter(Boolean);

	if (allowedRoleIds.length > 0) {
		return member.roles.some((roleId) => allowedRoleIds.includes(roleId));
	}

	const guildRoles = await fetchGuildRoles(guildId);
	if (guildRoles.length === 0) {
		// No bot token or roles fetch failed: fall back to plain guild membership
		console.warn('[maintenance] Guild roles unavailable, granting on guild membership only');
		return true;
	}

	return member.roles.some((roleId) => {
		const role = guildRoles.find((r) => r.id === roleId);
		return role != null && (parseInt(role.permissions) & ADMIN_PERMISSION_BIT) !== 0;
	});
}
