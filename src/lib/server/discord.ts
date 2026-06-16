import { db } from '$lib/server/db';
import { account } from '$lib/server/db/auth.schema';
import { eq, and } from 'drizzle-orm';
import { env } from '$env/dynamic/private';

const DISCORD_API = 'https://discord.com/api/v10';
const GUILD_ID = env.DISCORD_GUILD_ID;

export interface DiscordProfile {
	id: string;
	username: string;
	global_name: string | null;
	avatar: string | null;
	banner: string | null;
	accent_color: number | null;
	avatar_decoration_data: { asset: string; sku_id: string } | null;
}

export interface DiscordGuildMember {
	roles: string[];
	nick: string | null;
	avatar: string | null;
}

export interface DiscordRole {
	id: string;
	name: string;
	color: number;
	position: number;
	permissions: string;
}

export interface DiscordUserData {
	profile: DiscordProfile;
	guildMember: DiscordGuildMember | null;
	highestRole: DiscordRole | null;
	avatarUrl: string;
	guildAvatarUrl: string | null;
	bannerUrl: string | null;
	decorationUrl: string | null;
}

const cache = new Map<string, { data: DiscordUserData; expires: number }>();
const TTL = 5 * 60 * 1000; // 5 minutes

export async function getDiscordToken(userId: string): Promise<{
	accessToken: string;
	refreshToken: string | null;
	expiresAt: Date | null;
} | null> {
	const [acct] = await db
		.select({
			accessToken: account.accessToken,
			refreshToken: account.refreshToken,
			accessTokenExpiresAt: account.accessTokenExpiresAt
		})
		.from(account)
		.where(and(eq(account.userId, userId), eq(account.providerId, 'discord')))
		.limit(1);

	if (!acct?.accessToken) return null;
	return {
		accessToken: acct.accessToken,
		refreshToken: acct.refreshToken ?? null,
		expiresAt: acct.accessTokenExpiresAt ?? null
	};
}

async function refreshDiscordToken(refreshToken: string): Promise<{
	access_token: string;
	refresh_token: string;
	expires_in: number;
}> {
	const res = await fetch(`${DISCORD_API}/oauth2/token`, {
		method: 'POST',
		headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
		body: new URLSearchParams({
			client_id: env.DISCORD_CLIENT_ID!,
			client_secret: env.DISCORD_CLIENT_SECRET!,
			grant_type: 'refresh_token',
			refresh_token: refreshToken
		})
	});
	if (!res.ok) {
		const body = await res.text().catch(() => '');
		throw new Error(`Discord token refresh failed: ${res.status} — ${body}`);
	}
	return res.json();
}

async function storeDiscordTokens(
	userId: string,
	tokens: { access_token: string; refresh_token: string; expires_in: number }
): Promise<void> {
	await db
		.update(account)
		.set({
			accessToken: tokens.access_token,
			refreshToken: tokens.refresh_token,
			accessTokenExpiresAt: new Date(Date.now() + tokens.expires_in * 1000),
			updatedAt: new Date()
		})
		.where(and(eq(account.userId, userId), eq(account.providerId, 'discord')));
}

/** Returns a valid access token, refreshing it if expired or within 60s of expiry. */
export async function getValidDiscordToken(userId: string): Promise<string | null> {
	const tokens = await getDiscordToken(userId);
	if (!tokens) return null;

	// Refresh if expired or within 60 seconds of expiry
	const needsRefresh = tokens.expiresAt && tokens.expiresAt.getTime() - Date.now() < 60_000;

	if (needsRefresh) {
		if (!tokens.refreshToken) {
			console.error(`[discord] Token expired but no refresh token for user ${userId}`);
			return null;
		}
		try {
			const fresh = await refreshDiscordToken(tokens.refreshToken);
			await storeDiscordTokens(userId, fresh);
			return fresh.access_token;
		} catch (e) {
			console.error(`[discord] Token refresh failed for user ${userId}:`, e);
			return null;
		}
	}

	return tokens.accessToken;
}

async function fetchDiscordProfile(accessToken: string): Promise<DiscordProfile> {
	const res = await fetch(`${DISCORD_API}/users/@me`, {
		headers: { Authorization: `Bearer ${accessToken}` }
	});
	if (!res.ok) throw new Error(`Discord profile fetch failed: ${res.status}`);
	return res.json();
}

async function fetchGuildMember(
	accessToken: string,
	guildId: string
): Promise<DiscordGuildMember | null> {
	const res = await fetch(`${DISCORD_API}/users/@me/guilds/${guildId}/member`, {
		headers: { Authorization: `Bearer ${accessToken}` }
	});
	if (res.status === 404) return null; // user is not in this guild
	if (!res.ok) {
		const body = await res.text().catch(() => '');
		console.error(`[discord] fetchGuildMember failed: ${res.status} ${res.statusText} — ${body}`);
		return null;
	}
	return res.json();
}

async function fetchGuildRoles(guildId: string): Promise<DiscordRole[]> {
	if (!env.DISCORD_BOT_TOKEN) return [];
	const res = await fetch(`${DISCORD_API}/guilds/${guildId}/roles`, {
		headers: { Authorization: `Bot ${env.DISCORD_BOT_TOKEN}` }
	});
	if (!res.ok) return [];
	return res.json();
}

export function getDiscordAvatarUrl(userId: string, avatarHash: string | null, size = 128): string {
	if (!avatarHash) {
		const discriminator = (BigInt(userId) >> 22n) % 5n;
		return `https://cdn.discordapp.com/embed/avatars/${discriminator}.png`;
	}
	const ext = avatarHash.startsWith('a_') ? 'gif' : 'png';
	return `https://cdn.discordapp.com/avatars/${userId}/${avatarHash}.${ext}?size=${size}`;
}

export function getDiscordGuildAvatarUrl(
	guildId: string,
	userId: string,
	avatarHash: string | null,
	size = 128
): string | null {
	if (!avatarHash) return null;
	const ext = avatarHash.startsWith('a_') ? 'gif' : 'png';
	return `https://cdn.discordapp.com/guilds/${guildId}/users/${userId}/avatars/${avatarHash}.${ext}?size=${size}`;
}

export function getDiscordBannerUrl(
	userId: string,
	bannerHash: string | null,
	size = 512
): string | null {
	if (!bannerHash) return null;
	const ext = bannerHash.startsWith('a_') ? 'gif' : 'png';
	return `https://cdn.discordapp.com/banners/${userId}/${bannerHash}.${ext}?size=${size}`;
}

export function getDiscordDecorationUrl(asset: string | null): string | null {
	if (!asset) return null;
	return `https://cdn.discordapp.com/avatar-decoration-presets/${asset}.png`;
}

export function resolveHighestRole(roles: DiscordRole[]): DiscordRole | null {
	if (roles.length === 0) return null;
	return roles.reduce((highest, role) => (role.position > highest.position ? role : highest));
}

export async function isGuildMember(userId: string): Promise<boolean> {
	if (!GUILD_ID) {
		console.error('[discord] isGuildMember: DISCORD_GUILD_ID not set');
		return false;
	}
	const token = await getValidDiscordToken(userId);
	if (!token) {
		console.error(`[discord] isGuildMember: no valid token for user ${userId}`);
		return false;
	}
	const member = await fetchGuildMember(token, GUILD_ID);
	return member !== null;
}

export async function fetchDiscordUserData(
	userId: string,
	accessToken: string
): Promise<DiscordUserData> {
	const cached = cache.get(userId);
	if (cached && cached.expires > Date.now()) return cached.data;

	const profile = await fetchDiscordProfile(accessToken);

	let guildMember: DiscordGuildMember | null = null;
	let highestRole: DiscordRole | null = null;

	if (GUILD_ID) {
		guildMember = await fetchGuildMember(accessToken, GUILD_ID);
		const guildRoles = await fetchGuildRoles(GUILD_ID);
		highestRole = resolveHighestRole(guildRoles);
	}

	const data: DiscordUserData = {
		profile,
		guildMember,
		highestRole,
		avatarUrl: getDiscordAvatarUrl(profile.id, profile.avatar),
		guildAvatarUrl: guildMember
			? getDiscordGuildAvatarUrl(GUILD_ID, profile.id, guildMember.avatar)
			: null,
		bannerUrl: getDiscordBannerUrl(profile.id, profile.banner),
		decorationUrl: getDiscordDecorationUrl(profile.avatar_decoration_data?.asset ?? null)
	};

	cache.set(userId, { data, expires: Date.now() + TTL });
	return data;
}

/** Clear cached data for a user (call on logout or role change) */
export function invalidateDiscordCache(userId: string): void {
	cache.delete(userId);
}
