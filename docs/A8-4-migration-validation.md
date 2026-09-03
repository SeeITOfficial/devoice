# A8-4 SQLite Pricing Migration Validation

This runbook validates the candidate migration
`20260831161800_add_immutable_pricing_fields` against a copy of the SQLite
database. It is non-destructive when followed as written.

## Safety Rules

- Stop application writes before copying or migrating.
- Never run the candidate migration on production until copy validation passes.
- Never run `prisma migrate reset`.
- Never use `prisma db push` to bypass migrations.
- Never point the test commands at the live development or production database.
- Keep the original database and its backup unchanged until validation completes.
- Do not expose credentials or commit a temporary environment file.

## 1. Stop Writes and Identify the Database

Stop the single application writer and confirm no deployment, worker, or admin
operation can write to SQLite. Read `DATABASE_URL` from the protected
operator environment without printing its value. Confirm that it refers to the
intended SQLite file and identify any `-wal`, `-shm`, or `-journal` sidecars.

Do not copy an active database by copying only the main `.db` file. SQLite
journal/WAL state must be captured consistently.

## 2. Create a Verified Copy

With writes stopped, create a backup and a separate validation copy using a
filesystem/database-aware copy procedure. For a quiet database, a file copy
can be used only when the main database and all applicable sidecars are copied
as one consistent set. Preserve file permissions and timestamps.

Example operator procedure on Linux (do not run against the live database
without substituting the approved paths):

```bash
install -d -m 700 /secure/backup /secure/validation
cp --preserve=all /path/to/database.db /secure/backup/database.db
cp --preserve=all /path/to/database.db /secure/validation/database.db
for suffix in -wal -shm -journal; do
  test ! -e "/path/to/database.db${suffix}" || cp --preserve=all \
    "/path/to/database.db${suffix}" "/secure/backup/database.db${suffix}"
  test ! -e "/path/to/database.db${suffix}" || cp --preserve=all \
    "/path/to/database.db${suffix}" "/secure/validation/database.db${suffix}"
done
sha256sum /secure/backup/database.db /secure/validation/database.db
```

The operator must confirm that the source was quiescent and that the copy is
readable before using it. Store the backup separately from the validation copy.
Do not delete the backup until post-migration recovery checks pass.

## 3. Point Prisma at the Copy

Use a temporary, protected environment in the validation shell. Do not create
or commit a project `.env` file for this test.

Linux/macOS example:

```bash
export DATABASE_URL="file:/secure/validation/database.db"
npx prisma migrate deploy
```

PowerShell example:

```powershell
$env:DATABASE_URL = "file:C:\secure\validation\database.db"
npx prisma migrate deploy
```

These commands are future test commands only. They were not executed for A8-4.
Confirm the displayed database path before running the migration. The command
must target only the validation copy.

## 4. Record Pre-Migration Evidence

Before applying the candidate migration, record the following from the copy:

- `TicketOrder` row count.
- `Ticket` row count.
- `TicketType` row count.
- `Event` row count.
- Every order ID and its event ID.
- Every ticket ID, order ID, and ticket-type ID.
- Order statuses, including `PENDING`, `CONFIRMED`, and `REJECTED`.
- Ticket statuses, including `RESERVED`, `VALID`, `USED`, and `INVALID`.
- Customer name, phone, email, quantity, timestamps, payment fields, and event IDs.
- Existing migration table/state.

Use a read-only SQLite inspection tool or a disposable validation script that
writes output outside the repository. Do not run these inspections against the
live database.

## 5. Apply Only to the Copy

After the evidence is captured, apply the candidate migration only with the
copy-specific `DATABASE_URL`. Do not edit the live database URL and do not run
any reset, seed, `db push`, or `db pull` command.

The candidate migration performs controlled SQLite table rebuilds. It:

1. Preserves `Ticket` IDs and foreign-key IDs while rebuilding `Ticket`.
2. Creates an intermediate `TicketOrder` with nullable pricing fields.
3. Copies all existing order fields and adds `paymentMethod` with its intended
   default for rows from the old schema.
4. Uses the actual relationship `TicketOrder -> Ticket -> TicketType` to
   reject orders with zero tickets or more than one distinct ticket type.
5. Backfills `unitPrice` from the sole related current `TicketType.price` and
   calculates `totalAmount = unitPrice * quantity` as an explicitly
   **APPROXIMATE** fallback.
6. Validates positive integer quantity, finite non-negative pricing, and the
   exact SQLite formula `totalAmount = unitPrice * quantity`.
7. Rebuilds `TicketOrder` with `unitPrice REAL NOT NULL` and
   `totalAmount REAL NOT NULL`.
8. Drops the original `TicketOrder` only after validated replacement rows
   exist, then renames `final_TicketOrder` to `TicketOrder`.
9. Runs `PRAGMA foreign_key_check` after rebuilding the tables.
10. Fails rather than inventing values if an order cannot receive pricing.

The migration SQL does not guarantee cleanup or rollback after an arbitrary
statement failure. The repository does not establish whether Prisma wraps this
specific migration in a transaction, nor how SQLite PRAGMA changes interact
with that execution. Copy testing must verify transaction behavior, foreign-key
restoration, and backup recovery rather than assuming them.

The replacement sequence is intentionally a SQLite table replacement: the
original `TicketOrder` is removed only after the final table contains all
validated rows. The replacement keeps the same table name and primary keys, so
the existing `Ticket.orderId` values continue to refer to the corresponding
orders when foreign keys are restored and checked.

## 6. Validate Structural Integrity

Compare post-migration results with the pre-migration evidence:

- `TicketOrder` row count is unchanged.
- `Ticket` row count is unchanged.
- `TicketType` row count is unchanged.
- `Event` row count is unchanged.
- Every original order primary key still exists.
- Every original ticket primary key still exists.
- `TicketOrder.eventId` values are unchanged.
- Every `Ticket.orderId` still references the same order.
- Every `Ticket.ticketTypeId` still references the same ticket type.
- Customer fields, quantity, timestamps, payment fields, and statuses are
  unchanged.
- `TicketOrder -> Event`, `Ticket -> TicketOrder`, and
   `Ticket -> TicketType` foreign-key checks return no violations.
- The migration's `PRAGMA foreign_key_check` output is empty.
- No duplicate ticket codes, QR tokens, order IDs, or ticket IDs exist.
- A successful homogeneous order with multiple tickets still has every ticket
   linked to the same order after replacement.

## 7. Validate Pricing Backfill

For every existing order:

- `unitPrice` is present and finite.
- `totalAmount` is present and finite.
- `quantity` is an integer greater than zero.
- `totalAmount = unitPrice * quantity` using SQLite's stored REAL arithmetic,
   without an additional rounding policy.
- The value is labeled/documented as **APPROXIMATE** unless matched to an
  external historical payment record.
- No current `TicketType.price` value is represented as historically exact.
- Orders with zero related tickets must fail migration.
- Orders with more than one distinct related ticket type must fail migration.
- Orders without a reliable related ticket type or valid price must cause the
   migration to fail for operator resolution, not receive an invented price.

The schema does not contain `TicketOrder.ticketTypeId`. The actual relationship
is `TicketOrder -> Ticket -> TicketType`. A mixed-ticket historical order is
therefore rejected rather than assigned an arbitrary or weighted price.

## 8. Validate Accounting

Using the migrated copy, verify that:

- Confirmed orders contribute revenue from `TicketOrder.totalAmount`.
- Pending orders contribute zero revenue.
- Rejected orders contribute zero revenue.
- Ticket invalidation does not remove revenue from a confirmed order.
- Only `USED` tickets count as entered.
- `VALID` and `INVALID` tickets do not count as entered.
- Ticket-type and payment-method breakdowns remain event-scoped.
- Multiple ticket types remain independent.

`paymentMethod` is a newly introduced field for old orders, populated with the
schema default `MOBILE_MONEY`; it is not unchanged historical payment data.

## 9. Validate New Order Snapshot Behavior

Against the migrated copy only:

1. Create a new order through the normal application flow.
2. Record its `unitPrice` and `totalAmount`.
3. Change the related `TicketType.price` through the normal admin flow.
4. Confirm the new order still retains its original snapshot values.
5. Confirm historical orders retain their migrated values.
6. Confirm accounting reads order snapshots rather than the current ticket-type
   price.

Do not perform this test against production or the live development database.

Include a dedicated success case with one homogeneous `TicketOrder` containing
multiple `Ticket` rows that all reference the same `TicketType`. Verify the
order and every ticket survive the table replacement with unchanged IDs and
foreign-key IDs.

## 10. Verify Recovery and Rollback

Before any production migration:

1. Preserve the verified pre-migration backup.
2. If validation fails, discard the validation copy and restore a fresh copy
   from the backup.
3. Confirm the restored copy has the original row counts, relationships,
   statuses, and customer/payment data.
4. If a production migration fails, stop the application and restore the
   verified backup according to the approved maintenance procedure.
5. Keep the backup until application and accounting verification are complete.

SQLite schema rollback is not assumed to be automatic. Recovery is performed
by restoring the verified database backup, not by guessing a reverse SQL
migration.

Prisma migration execution behavior must be verified on the copy. The SQL
explicitly requests foreign-key checking and restores `foreign_keys` on the
normal success path, but it does not provide a SQL-level `finally` handler for
arbitrary failures. Backup restoration is the recovery guarantee.

A failed migration may leave the original and intermediate replacement tables,
or leave `foreign_keys` disabled, as observed during isolated testing. Dispose
of or restore the failed copy from the verified backup; do not treat Prisma as
providing automatic rollback unless a specific execution has independently
proved that behavior.

## 11. Production Gate

**NEVER run the candidate migration on production until copy validation passes.**

Production approval requires:

- A verified backup and restore test.
- A successful migration against a production-shaped copy.
- Exact/approximate historical pricing policy approval.
- Successful structural, pricing, accounting, and application tests.
- A controlled write pause and one migration runner.
- A documented recovery owner and maintenance window.

Never use `prisma migrate reset` and never use `prisma db push` to bypass the
migration history.
