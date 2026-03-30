import jwt, { JwtPayload, SignOptions } from "jsonwebtoken";
import crypto from "crypto";
import { getEnv } from "./getEnv";

export type UserType = 'ADMIN' | 'CLIENT';

export type AccessTokenPayload = JwtPayload & {
    sub: string;
    email: string;
    userType: UserType;
}

export type RefreshTokenPayload = JwtPayload & {
    sub: string;
    userType: UserType;
}

const accessSecret = getEnv('JWT_ACCESS_SECRET');
const refreshSecret = getEnv('JWT_REFRESH_SECRET');

const accessTokenExpiresIn: SignOptions["expiresIn"] =
    (process.env.ACCESS_TOKEN_EXPIRES_IN as SignOptions["expiresIn"]) || "15m";

const refreshTokenExpiresIn: SignOptions["expiresIn"] =
    `${Number(process.env.REFRESH_TOKEN_EXPIRES_DAYS || 7)}d` as SignOptions["expiresIn"];


export function signAccessToken(payload: {
    sub: string;
    email: string;
    userType: UserType;
}) {
    return jwt.sign(payload, accessSecret, {
        expiresIn: accessTokenExpiresIn,
    })
}

export function signRefreshToken(payload: {
    sub: string;
    userType: UserType;
}) {
    return jwt.sign(payload, refreshSecret, {
        expiresIn: refreshTokenExpiresIn,
    })
}

function isAccessTokenPayload(decoded: string | JwtPayload): decoded is AccessTokenPayload {
    return (
        typeof decoded !== 'string' &&
        typeof decoded.sub === 'string' &&
        typeof decoded.email === 'string' &&
        (decoded.userType === 'ADMIN' || decoded.userType === 'CLIENT')
    )
}

function isRefreshTokenPayload(decoded: string | JwtPayload): decoded is RefreshTokenPayload {
    return (
        typeof decoded !== "string" &&
        typeof decoded.sub === "string" &&
        (decoded.userType === "ADMIN" || decoded.userType === "CLIENT")
    );
}

export function verifyAccessToken(token: string): AccessTokenPayload {
    const decoded = jwt.verify(token, accessSecret);

    if (!isAccessTokenPayload(decoded)) {
        throw new Error('Invalid access token payload')
    }

    return decoded;
}

export function verifyRefreshToken(token: string): RefreshTokenPayload {
  const decoded = jwt.verify(token, refreshSecret);

  if (!isRefreshTokenPayload(decoded)) {
    throw new Error("Invalid refresh token payload");
  }

  return decoded;
}

export function hashToken(token: string) {
    return crypto.createHash('sha256').update(token).digest('hex');
}