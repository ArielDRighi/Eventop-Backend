import { MercadoPagoConfig } from 'mercadopago';
import { config as dotenvConfig } from 'dotenv';

dotenvConfig();

export const client = new MercadoPagoConfig({
  accessToken: process.env.MERCADOPAGO_ACCESS_TOKEN,
});
