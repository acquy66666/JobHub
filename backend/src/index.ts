import app from './app';
import { env } from './config/env';

app.listen(Number(env.PORT), '0.0.0.0', () => {
  console.log(`Backend running on http://localhost:${env.PORT}`);
});
