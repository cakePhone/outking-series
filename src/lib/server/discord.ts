import { db } from '$lib/server/db';
import { account } from '$lib/server/db/auth.schema';
import { eq, and } from 'drizzle-orm';

const DISCORD_API = 'https://discord.com/api/v10';

/** TODO: Replace with the OutKing Series guild ID */
const GUILD_ID = '';

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

export async function getDiscordAccessToken(userId: string): Promise<string | null> {
	const [acct] = await db
		.select({ accessToken: account.accessToken })
		.from(account)
		.where(and(eq(account.userId, userId), eq(account.providerId, 'discord')))
		.limit(1);

	return acct?.accessToken ?? null;
}

async function fetchDiscordProfile(accessToken: string): Promise<DiscordProfile> {
	const res = await fetch(`${DISCORD_API}/users/@me`, {
		headers: { Authorization: `Bearer ${accessToken}` }
	});
	if (!res.ok) throw new Error(`Discord profile fetch failed: ${res.status}`);
	return res.json();
}

async function fetchGuildMember(accessToken: string, guildId: string): Promise<DiscordGuildMember> {
	const res = await fetch(`${DISCORD_API}/users/@me/guilds/${guildId}/member`, {
		headers: { Authorization: `Bearer ${accessToken}` }
	});
	if (!res.ok) return { roles: [], nick: null, avatar: null };
	return res.json();
}

async function fetchGuildRoles(guildId: string): Promise<DiscordRole[]> {
	const res = await fetch(`${DISCORD_API}/guilds/${guildId}/roles`, {
		headers: { Authorization: `Bot ${process.env.DISCORD_BOT_TOKEN}` }
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
