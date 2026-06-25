import { env } from '$env/dynamic/private';

const RIOT_API_KEY = env.RIOT_API_KEY ?? '';

// European shard — OutKing runs in Portugal
const ACCOUNT_BASE = 'https://europe.api.riotgames.com';
const VAL_MMR_BASE = 'https://eu.api.riotgames.com';

// Ascendant 3 = tier 20 (Iron 1 = 0 … Radiant = 24)
const MIN_TIER = 20;

const TIER_NAMES = [
	'Unranked',
	'Iron 1', 'Iron 2', 'Iron 3',
	'Bronze 1', 'Bronze 2', 'Bronze 3',
	'Silver 1', 'Silver 2', 'Silver 3',
	'Gold 1', 'Gold 2', 'Gold 3',
	'Platinum 1', 'Platinum 2', 'Platinum 3',
	'Diamond 1', 'Diamond 2', 'Diamond 3',
	'Ascendant 1', 'Ascendant 2', 'Ascendant 3',
	'Immortal 1', 'Immortal 2', 'Immortal 3',
	'Radiant'
];

export function tierName(tier: number): string {
	return TIER_NAMES[tier] ?? `Tier ${tier}`;
}

interface RiotAccount {
	puuid: string;
	gameName: string;
	tagLine: string;
}

interface MMRResponse {
	LatestCompetitiveUpdate?: {
		TierAfterUpdate: number;
	};
}

function parseRiotId(riotId: string): { gameName: string; tagLine: string } | null {
	const idx = riotId.indexOf('#');
	if (idx < 1 || idx === riotId.length - 1) return null;
	return {
		gameName: riotId.slice(0, idx),
		tagLine: riotId.slice(idx + 1)
	};
}

async function fetchPuuid(riotId: string): Promise<string | null> {
	const parsed = parseRiotId(riotId);
	if (!parsed) return null;

	const res = await fetch(
		`${ACCOUNT_BASE}/riot/account/v1/accounts/by-riot-id/${encodeURIComponent(parsed.gameName)}/${encodeURIComponent(parsed.tagLine)}`,
		{ headers: { 'X-Riot-Token': RIOT_API_KEY } }
	);
	if (!res.ok) return null;

	const data: RiotAccount = await res.json();
	return data.puuid;
}

async function fetchCompetitiveTier(puuid: string): Promise<number | null> {
	const res = await fetch(`${VAL_MMR_BASE}/val/mmr/v1/players/${puuid}`, {
		headers: { 'X-Riot-Token': RIOT_API_KEY }
	});
	if (!res.ok) return null;

	const data: MMRResponse = await res.json();
	return data.LatestCompetitiveUpdate?.TierAfterUpdate ?? null;
}

export interface RankResult {
	passed: boolean;
	riotId: string;
	rank: string | null;
	tier: number | null;
	/** Null = passed or API was unavailable (non-blocking). */
	reason: 'ok' | 'invalid_format' | 'not_found' | 'unranked' | 'rank_too_low' | 'api_unavailable';
}

/**
 * Validate a single Riot ID against the Riot API.
 *
 * Returns `reason: 'ok'` when the player meets requirements OR
 * when the API key isn't configured (non-blocking fallback).
 */
export async function validatePlayerRank(riotId: string): Promise<RankResult> {
	if (!RIOT_API_KEY) {
		return { passed: true, riotId, rank: null, tier: null, reason: 'ok' };
	}

	const parsed = parseRiotId(riotId);
	if (!parsed) {
		return { passed: false, riotId, rank: null, tier: null, reason: 'invalid_format' };
	}

	let puuid: string | null;
	try {
		puuid = await fetchPuuid(riotId);
	} catch {
		return { passed: true, riotId, rank: null, tier: null, reason: 'api_unavailable' };
	}

	if (!puuid) {
		return { passed: false, riotId, rank: null, tier: null, reason: 'not_found' };
	}

	let tier: number | null;
	try {
		tier = await fetchCompetitiveTier(puuid);
	} catch {
		return { passed: true, riotId, rank: null, tier: null, reason: 'api_unavailable' };
	}

	if (tier === null) {
		return { passed: false, riotId, rank: 'Unranked', tier: 0, reason: 'unranked' };
	}

	if (tier < MIN_TIER) {
		return { passed: false, riotId, rank: tierName(tier), tier, reason: 'rank_too_low' };
	}

	return { passed: true, riotId, rank: tierName(tier), tier, reason: 'ok' };
}

/**
 * Validate all player Riot IDs in a batch with a delay between requests
 * to stay within Riot's rate limits (20 req/s, 100 req/2min).
 */
export async function validatePlayers(riotIds: string[]): Promise<RankResult[]> {
	const results: RankResult[] = [];
	for (const id of riotIds) {
		results.push(await validatePlayerRank(id));
		// 60ms delay → ~16 req/s, safely under the 20 req/s limit
		await new Promise((r) => setTimeout(r, 60));
	}
	return results;
}
