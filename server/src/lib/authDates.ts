export function getRefreshTokenExpiresAt() {
    const refreshTokenExpiresDays = Number(
        process.env.REFRESH_TOKEN_EXPIRES_DAYS || 7,
    );
  
    return new Date(
        Date.now() + refreshTokenExpiresDays * 24 * 60 * 60 * 1000,
    ); 
}