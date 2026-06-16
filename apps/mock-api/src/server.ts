import cors from '@fastify/cors';
import Fastify from 'fastify';
import { migrate } from './db/migrate.js';
import { caseNoteRoutes } from './routes.js';

const PORT = Number(process.env.PORT ?? 4000);
const HOST = process.env.HOST ?? '0.0.0.0';

export async function buildServer() {
	// Ensure the schema exists before serving (idempotent).
	migrate(false);

	const app = Fastify({
		logger: {
			level: process.env.LOG_LEVEL ?? 'info'
		}
	});

	// Tolerate empty bodies on requests that still send a JSON content-type
	// (e.g. DELETE). Default Fastify would reject these with 400.
	app.addContentTypeParser(
		'application/json',
		{ parseAs: 'string' },
		(_request, body, done) => {
			const text = typeof body === 'string' ? body.trim() : '';
			if (text.length === 0) {
				done(null, undefined);
				return;
			}
			try {
				done(null, JSON.parse(text));
			} catch (error) {
				done(error as Error, undefined);
			}
		}
	);

	await app.register(cors, {
		origin: true,
		methods: ['GET', 'POST', 'PATCH', 'DELETE']
	});

	app.get('/health', async () => ({ status: 'ok', service: 'mock-api' }));

	await app.register(caseNoteRoutes);

	return app;
}

const invokedDirectly = process.argv[1]?.endsWith('server.ts') || process.argv[1]?.endsWith('server.js');
if (invokedDirectly) {
	const app = await buildServer();
	try {
		await app.listen({ port: PORT, host: HOST });
		app.log.info(`Mock Case Note API listening on http://${HOST}:${PORT}`);
	} catch (error) {
		app.log.error(error);
		process.exit(1);
	}
}
