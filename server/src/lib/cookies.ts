import { Response } from "express";

const isProduction = process.env.NODE_ENV === 'production';

const sameSite = isProduction ? 'none' : 'lax';
const secure = isProduction;

export function setAuthCookies(res: Response, accessToken: string, refreshToken: string) {
    res.cookie('accessToken', accessToken, {
        httpOnly: true,
        secure: secure,
        sameSite: sameSite,
        path: '/',
        maxAge: 15 * 60 * 1000,
    })
    
    res.cookie('refreshToken', refreshToken, {
        httpOnly: true,
        secure: secure,
        sameSite: sameSite,
        path: '/',
        maxAge: 7 * 24 * 60 * 60 * 1000,
    })
}

export function clearAuthCookies(res: Response) {
    res.clearCookie('accessToken', {
        httpOnly: true,
        secure: secure,
        sameSite: sameSite,
        path: '/',
    })

    res.clearCookie('refreshToken', {
        httpOnly: true,
        secure: secure,
        sameSite: sameSite,
        path: '/',
    })
}