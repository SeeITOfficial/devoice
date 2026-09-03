# SQLite Migration Archive

These migrations were created when the application used SQLite (better-sqlite3).
They are preserved here for reference and history but are **not applied by Prisma**.

Prisma ignores any directory whose name begins with `_`.

When the application migrated to PostgreSQL for Vercel deployment, a new
PostgreSQL baseline migration was created at:
`prisma/migrations/20260903_init_postgresql/`

Do not move these files back into the active `migrations/` directory.
