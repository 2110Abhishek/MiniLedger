import { app } from './app';
import { config } from './config';

const server = app.listen(config.port, () => {
  const border = '━'.repeat(54);
  console.log('\n' + border);
  console.log(`🚀 MiniLedger Backend Server is running!`);
  console.log(border);
  console.log(`• Local Port    : ${config.port}`);
  console.log(`• Environment   : ${config.nodeEnv}`);
  console.log(`• Base API URL  : http://localhost:${config.port}/api`);
  console.log(`• Health Check  : http://localhost:${config.port}/api/health`);
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
