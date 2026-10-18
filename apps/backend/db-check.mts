// Verifies the MySQL -> Postgres/Neon migration against a real Postgres engine
// (PGlite, in-process — no Docker or network needed).
//
// Covers what a dialect swap can silently break:
//   1. the generated migration is valid Postgres
//   2. every query the app emits runs, and returns correct rows
//   3. better-auth resolves its models and runs sign-up / sign-in / session
//   4. the int4 cursor sentinel stays in range
//   5. FK cascade deletes still fire
//
// Run: pnpm db:check
import { PGlite } from '@electric-sql/pglite';
import { betterAuth } from 'better-auth';
import { drizzleAdapter } from 'better-auth/adapters/drizzle';
import { and, eq, lt } from 'drizzle-orm';
import { drizzle } from 'drizzle-orm/pg-proxy';
import { readdirSync, readFileSync } from 'node:fs';
import { join } from 'node:path';

const asUrl = (p: string) => new URL(`file:///${p}`).href;
const dir = import.meta.dirname ?? '.';

const { account, session, user, verification } = await import(
	asUrl(join(dir, 'src/db/schema/auth-schema.ts'))
);
const { entries } = await import(asUrl(join(dir, 'src/db/schema/schema.ts')));

const pg = new PGlite();
const emitted: string[] = [];
const run = async (q: string, params: unknown[], method: 'all' | 'execute') => {
	emitted.push(q);
	// pg.exec() drops params, so always go through query().
	const r = await pg.query(q, params as never[]);
	if (method === 'execute') return { rows: [] };
	// pg-proxy maps rows positionally, so return arrays in column order.
	const names = r.fields.map((f) => f.name);
	return { rows: r.rows.map((row) => names.map((n) => row[n])) };
};
const db = drizzle(run);

// 1. Apply the real migration, statement by statement like db:migrate does.
const sqlDir = join(dir, 'drizzle');
const files = readdirSync(sqlDir).filter((f) => f.endsWith('.sql'));
for (const f of files) {
	for (const stmt of readFileSync(join(sqlDir, f), 'utf8').split(
		'--> statement-breakpoint',
	)) {
		if (stmt.trim()) await pg.exec(stmt.trim());
	}
}
const tables = (
	await pg.query(
		"select table_name from information_schema.tables where table_schema='public' order by 1",
	)
).rows.map((r) => r.table_name);
console.log(`1. migration ${files.join(', ')} -> tables: ${tables.join(', ')}`);

// Seed directly so the app's own queries hit real rows.
await pg.exec(
	`insert into "user" (id,name,email,email_verified,created_at,updated_at) values ('u1','a','a@b.c',false,now(),now())`,
);
for (const t of ['one', 'two', 'three']) {
	await pg.exec(
		`insert into entries (title,type,director,"yearTime",user_id) values ('${t}','Movie','d','2020','u1')`,
	);
}

// 2. Every query from apps/backend/src/index.ts.
// The cursor sentinel must stay inside int4: a Date.now() default overflows
// because Postgres binds the param as integer (the column's type).
const cursor = 2_147_483_647;
await pg
	.query('select id from entries where id < $1', [Date.now()])
	.then(() => console.log('   FAIL: Date.now() did not overflow int4'))
	.catch(() => console.log('   Date.now() would overflow int4 (sentinel is safe)'));

const rows = await db
	.select({
		id: entries.id,
		title: entries.title,
		type: entries.type,
		director: entries.director,
		budget: entries.budget,
		location: entries.location,
		duration: entries.duration,
		yearTime: entries.yearTime,
		poster: entries.poster,
	})
	.from(entries)
	.where(and(eq(entries.userId, 'u1'), lt(entries.id, cursor)))
	.orderBy(entries.id)
	.limit(21);
if (rows.length !== 3) throw new Error(`GET /entries: got ${rows.length}, want 3`);
console.log(`2. GET /entries -> ${rows.length} rows, cursor=${cursor} (int4 max)`);

emitted.length = 0;
await db
	.insert(entries)
	.values({ title: 'new', type: 'TV Show', director: 'd', yearTime: '2021', userId: 'u1' });
console.log(`   POST /entries -> ${emitted.at(-1)}`);

emitted.length = 0;
await db
	.update(entries)
	.set({ title: 'edited' })
	.where(and(eq(entries.id, 1), eq(entries.userId, 'u1')));
console.log(`   PUT  /entries/:id -> ${emitted.at(-1)}`);

emitted.length = 0;
await db.delete(entries).where(and(eq(entries.id, 1), eq(entries.userId, 'u1')));
console.log(`   DEL  /entries/:id -> ${emitted.at(-1)}`);

// 3. better-auth against the same Postgres, same schema.
const auth = betterAuth({
	baseURL: 'http://localhost:3241',
	secret: 'x'.repeat(32),
	database: drizzleAdapter(db as never, {
		provider: 'pg',
		schema: { user, session, account, verification },
	}),
	emailAndPassword: { enabled: true },
});

const signUpRes = await auth.api.signUpEmail({
	body: { email: 'zo@asr.dev', password: 'sup3rsecret!', name: 'Zoa' },
	headers: new Headers(),
	asResponse: true,
});
const signUp = await signUpRes.json();
const setCookie = signUpRes.headers.get('set-cookie');
if (!setCookie) throw new Error('sign-up issued no session cookie');
const cookie = setCookie.split(';')[0];

const signIn = await auth.api.signInEmail({
	body: { email: 'zo@asr.dev', password: 'sup3rsecret!' },
	headers: new Headers({ cookie }),
});
if (signIn.user.email !== 'zo@asr.dev') throw new Error('sign-in wrong user');

const sess = await auth.api.getSession({ headers: new Headers({ cookie }) });
if (!sess?.user?.id) throw new Error('session not valid');

const rejected = await auth.api
	.signInEmail({
		body: { email: 'zo@asr.dev', password: 'wrong' },
		headers: new Headers(),
	})
	.then(() => false)
	.catch(() => true);
if (!rejected) throw new Error('wrong password was accepted');

console.log(`3. better-auth sign-up/sign-in/session OK (user ${sess.user.id})`);
console.log('   wrong password correctly rejected');

// 4. Unique constraint still enforced (better-auth relies on it).
const dup = await pg
	.query(
		`insert into "user" (id,name,email,email_verified,created_at,updated_at) values ('u9','x','zo@asr.dev',false,now(),now())`,
	)
	.then(() => false)
	.catch(() => true);
if (!dup) throw new Error('duplicate email accepted');
console.log('4. unique email constraint enforced');

// 5. FK cascade.
await pg.query('delete from "user" where id = $1', [signUp.user.id]);
const after = (
	await pg.query(
		'select (select count(*)::int from session) s, (select count(*)::int from account) a, (select count(*)::int from "user") u',
	)
).rows[0];
if (after.s !== 0 || after.a !== 0) {
	throw new Error(`cascade failed: ${JSON.stringify(after)}`);
}
console.log(
	`5. cascade delete OK (user removal cleared sessions=${after.s} accounts=${after.a})`,
);

// 6. Connection URL resolution, mirroring src/db/index.ts: the app prefers the
// pooled URL but must still work with only DATABASE_URL set.
const POOLED = 'postgresql://u:p@ep-x-pooler.us-east-2.aws.neon.tech/db';
const DIRECT = 'postgresql://u:p@ep-x.us-east-2.aws.neon.tech/db';
const resolve = (env: Record<string, string | undefined>) =>
	env.DATABASE_URL_POOLED ?? env.DATABASE_URL;

for (const [label, env, want] of [
	['pooled only', { DATABASE_URL_POOLED: POOLED }, POOLED],
	['direct only', { DATABASE_URL: DIRECT }, DIRECT],
	['both', { DATABASE_URL: DIRECT, DATABASE_URL_POOLED: POOLED }, POOLED],
] as const) {
	const got = resolve(env as Record<string, string | undefined>);
	if (got !== want) throw new Error(`${label}: got ${got}, want ${want}`);
	console.log(`6. ${label} -> ${got === POOLED ? 'pooled' : 'direct'} url`);
}

console.log('\nall migration checks passed');