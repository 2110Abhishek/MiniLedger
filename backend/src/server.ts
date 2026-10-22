import { app } from './app';
import { config } from './config';
import { ensureDatabaseRunning } from './utils/dbEnsure';

async function bootstrap() {
  // Ensure database is online before handling traffic
  await ensureDatabaseRunning();

  const server = app.listen(config.port, () => {
    const border = '━'.repeat(54);
    console.log('\n' + border);
    console.log(`🚀 MiniLedger Backend Server is running!`);
    console.log(border);
    console.log(`• Local Port    : ${config.port}`);
    console.log(`• Environment   : ${config.nodeEnv}`);
    console.log(`• Base API URL  : http://localhost:${config.port}/api`);
    console.log(`• Health Check  : http://localhost:${config.port}/api/health`);
    console.log(`• Database Host : localhost:5432 (PostgreSQL)`);
    console.log(`• OTP Log Mode  : Dev Terminal Banner Active`);
    console.log(border + '\n');
  });

  process.on('SIGTERM', () => {
    console.log('SIGTERM received. Closing server gracefully...');
    server.close(() => {
      console.log('Server closed');
      process.exit(0);
    });
  });
}

bootstrap().catch((err) => {
  console.error('Fatal startup error:', err);
  process.exit(1);
});
