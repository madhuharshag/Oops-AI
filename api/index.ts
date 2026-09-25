import { app } from '../server/src/index';
import { initDatabase } from '../server/src/db';

let isDbInitialized = false;

export default async function handler(req: any, res: any) {
  if (!isDbInitialized) {
    try {
      await initDatabase();
      isDbInitialized = true;
    } catch (err) {
      console.error('[Vercel Serverless] DB initialization error:', err);
    }
  }
  return app(req, res);
}
