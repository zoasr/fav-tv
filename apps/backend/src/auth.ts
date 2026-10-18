import { betterAuth } from 'better-auth';
import { drizzleAdapter } from 'better-auth/adapters/drizzle';
import { db } from './db/index.js';
import {
	account,
	session,
	user,
	verification,
} from './db/schema/auth-schema.js';

const isProduction = process.env.NODE_ENV === 'production';

// better-auth's default is pure-JS scrypt (~4.5s CPU on Workers — instant
// failure). node:crypto.scryptSync is native but still ~78ms, over the 10ms
// free-tier CPU budget. WebCrypto PBKDF2 is native and fast enough at 10k
// iterations (~6ms).
//
// ponytail: 10k iterations is deliberately below OWASP's 600k PBKDF2
// recommendation — the free tier's 10ms cap makes that impossible (~350ms).
// Raise PASSWORD_ITERATIONS once on a paid Workers plan ($5/mo, 30s CPU).
// Security tradeoff: a leaked DB is cheaper to crack than OWASP guidance
// allows. Move back to scrypt if this ever holds real user data.
const PASSWORD_ITERATIONS = Number(process.env.PASSWORD_ITERATIONS ?? 10_000);

const deriveKey = (password: string, salt: Uint8Array, iterations: number) =>
	crypto.subtle
		.importKey(
			'raw',
			new TextEncoder().encode(password.normalize('NFKC')),
			'PBKDF2',
			false,
			['deriveBits'],
		)
		.then((key) =>
			crypto.subtle.deriveBits(
				{ name: 'PBKDF2', salt, iterations, hash: 'SHA-256' },
				key,
				256,
			),
		);

const toHex = (buf: Uint8Array) =>
	[...buf].map((b) => b.toString(16).padStart(2, '0')).join('');

const fromHex = (hex: string) =>
	new Uint8Array(hex.match(/../g)?.map((h) => parseInt(h, 16)) ?? []);

const hashPassword = async (password: string): Promise<string> => {
	const salt = crypto.getRandomValues(new Uint8Array(16));
	const key = new Uint8Array(
		await deriveKey(password, salt, PASSWORD_ITERATIONS),
	);
	return `${toHex(salt)}:${toHex(key)}`;
};

const verifyPassword = async ({
	hash,
	password,
}: {
	hash: string;
	password: string;
}): Promise<boolean> => {
	const [saltHex, keyHex] = hash.split(':');
	if (!saltHex || !keyHex) return false;
	const salt = fromHex(saltHex);
	const expected = fromHex(keyHex);
	if (salt.length !== 16 || expected.length !== 32) return false;
	const key = new Uint8Array(
		await deriveKey(password, salt, PASSWORD_ITERATIONS),
	);
	// Constant-time compare; both are 32 bytes.
	let diff = 0;
	for (let i = 0; i < expected.length; i++) diff |= key[i] ^ expected[i];
	return diff === 0;
};

export const auth = betterAuth({
	database: drizzleAdapter(db, {
		provider: 'pg',
		schema: {
			user,
			session,
			account,
			verification,
		},
	}),
	trustedOrigins: [
		'http://localhost:3000',
		'https://fav-tv.vercel.app',
		process.env.BETTER_AUTH_URL || 'http://localhost:3241',
	],
	session: {
		expiresIn: 60 * 60 * 24 * 7, // 7 days
		updateAge: 60 * 60 * 24, // 1 day
		cookieCache: {
			enabled: true,
			maxAge: 60 * 60 * 24 * 7,
		},
	},
	advanced: {
		defaultCookieAttributes: {
			sameSite: isProduction ? 'None' : 'Lax',
			secure: isProduction,
			httpOnly: true,
			maxAge: 60 * 60 * 24 * 7, // 7 days
			path: '/',
			// Add partitioned only in production for cross-origin
			...(isProduction && { partitioned: true }),
		},
		cookies: {
			sessionToken: {
				name: 'better-auth.session-token',
				attributes: {
					sameSite: isProduction ? 'None' : 'Lax',
					secure: isProduction,
					httpOnly: true,
					maxAge: 60 * 60 * 24 * 7, // 7 days
					path: '/',
					// Add partitioned only in production for cross-origin
					...(isProduction && { partitioned: true }),
				},
			},
		},
	},
	emailAndPassword: {
		enabled: true,
		password: {
			hash: hashPassword,
			verify: verifyPassword,
		},
	},
});
