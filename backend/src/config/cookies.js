export const TOKEN_COOKIE_NAME = "token";
export const TOKEN_MAX_AGE_MS = 2 * 60 * 60 * 1000;

export const getTokenCookieOptions = () => ({
  httpOnly: true,
  secure: process.env.NODE_ENV === "production",
  sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
  path: "/",
});

export const setTokenCookie = (res, token) => {
  res.cookie(TOKEN_COOKIE_NAME, token, {
    ...getTokenCookieOptions(),
    maxAge: TOKEN_MAX_AGE_MS,
  });
};

export const clearTokenCookie = (res) => {
  res.clearCookie(TOKEN_COOKIE_NAME, getTokenCookieOptions());
};
