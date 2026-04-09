# E‑commerce (Vite + React)

## Platform API integration

This project can load **product categories** and **products** from the Platform public APIs.

1. Create a `.env` file (see `.env.example`).
2. Set `VITE_PLATFORM_BASE_URL` and your `VITE_PLATFORM_PUBLIC_CLIENT_ID` (or per-endpoint overrides).
3. Run `npm run dev`.

Notes:
- The browser manages keep-alive connections automatically; the app adds request timeouts + abort support in `src/lib/platform/http.ts`.
- If your authenticated APIs (cart/wishlist/orders) use a different client id, set `VITE_PLATFORM_CART_CLIENT_ID`, `VITE_PLATFORM_WISHLIST_CLIENT_ID`, and `VITE_PLATFORM_ORDERS_CLIENT_ID`.
- If user profile/address APIs use a different client id, set `VITE_PLATFORM_USERS_CLIENT_ID`.
- If Easebuzz shows “not configured for this client”, double-check that the `client_id` you use for orders matches the client where Easebuzz payment credentials are configured.
- Do not hardcode credentials/tokens in the repo. Use runtime input and safe storage if you later add authenticated flows.
