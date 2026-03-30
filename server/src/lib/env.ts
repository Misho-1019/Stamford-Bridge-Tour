import { getEnv } from "./getEnv";

export const env = {
    PORT: process.env.PORT ? Number(process.env.PORT) : 3030,

    JWT_ACCESS_SECRET: getEnv('JWT_ACCESS_SECRET'),
    JWT_REFRESH_SECRET: getEnv('JWT_REFRESH_SECRET'),

    STRIPE_SECRET_KEY: getEnv('STRIPE_SECRET_KEY'),
    STRIPE_WEBHOOK_SECRET: getEnv('STRIPE_WEBHOOK_SECRET'),

    APP_BASE_URL: getEnv('APP_BASE_URL'),
}