import { fromNodeHeaders } from 'better-auth/node';
import { app, PORT } from '.';
import { auth } from './auth';

app.get('/health', (_, res) => {
	res.json({
		status: 'healthy',
		timestamp: new Date().toISOString(),
		port: PORT,
		environment: process.env.NODE_ENV || 'development',
	});
});

app.get('/debug/cors', (req, res) => {
	res.json({
		origin: req.get('Origin'),
		headers: req.headers,
		cookies: req.get('Cookie'),
		timestamp: new Date().toISOString(),
	});
});

const isProduction = process.env.NODE_ENV === 'production';

app.get('/debug/session', async (req, res) => {
	try {
		const headers = fromNodeHeaders(req.headers);
		const session = await auth.api.getSession({ headers });

		res.json({
			cookieHeader: req.get('Cookie'),
			origin: req.get('Origin'),
			isProduction,
			setCookieHeader: res.getHeaders()['set-cookie'],
			session: session
				? {
						userId: session.user?.id,
						email: session.user?.email,
						sessionId: session.session?.id,
						expiresAt: session.session?.expiresAt,
					}
				: null,
			timestamp: new Date().toISOString(),
			environment: process.env.NODE_ENV || 'development',
		});
	} catch (err) {
		res.json({
			// @ts-expect-error
			error: err.message,
			cookieHeader: req.get('Cookie'),
			origin: req.get('Origin'),
			timestamp: new Date().toISOString(),
		});
	}
});
