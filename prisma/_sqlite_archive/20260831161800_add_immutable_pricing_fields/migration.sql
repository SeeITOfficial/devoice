-- Add payment settings and one-time ticket access codes.
ALTER TABLE "SiteSettings" ADD COLUMN "paymentAccountName" TEXT;
ALTER TABLE "SiteSettings" ADD COLUMN "paymentAccountNumber" TEXT;
ALTER TABLE "SiteSettings" ADD COLUMN "paymentProvider" TEXT;

CREATE TABLE "TicketAccessCode" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "phone" TEXT NOT NULL,
    "codeHash" TEXT NOT NULL,
    "expiresAt" DATETIME NOT NULL,
    "attempts" INTEGER NOT NULL DEFAULT 0,
    "usedAt" DATETIME,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- SQLite requires table rebuilds for this schema change. Foreign keys are
-- disabled only while the related Ticket and TicketOrder tables are rebuilt;
-- every key value is copied unchanged.
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;

CREATE TABLE "new_Ticket" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "ticketCode" TEXT NOT NULL,
    "qrToken" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'RESERVED',
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "orderId" TEXT NOT NULL,
    "ticketTypeId" TEXT NOT NULL,
    CONSTRAINT "Ticket_orderId_fkey" FOREIGN KEY ("orderId") REFERENCES "TicketOrder" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "Ticket_ticketTypeId_fkey" FOREIGN KEY ("ticketTypeId") REFERENCES "TicketType" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

INSERT INTO "new_Ticket" (
    "createdAt", "id", "orderId", "qrToken", "status", "ticketCode", "ticketTypeId"
)
SELECT
    "createdAt", "id", "orderId", "qrToken", "status", "ticketCode", "ticketTypeId"
FROM "Ticket";

DROP TABLE "Ticket";
ALTER TABLE "new_Ticket" RENAME TO "Ticket";
CREATE UNIQUE INDEX "Ticket_ticketCode_key" ON "Ticket"("ticketCode");
CREATE UNIQUE INDEX "Ticket_qrToken_key" ON "Ticket"("qrToken");
CREATE INDEX "Ticket_qrToken_idx" ON "Ticket"("qrToken");

-- Pricing is nullable only during this intermediate copy so existing orders
-- can be preserved while their approximate legacy pricing is backfilled.
CREATE TABLE "new_TicketOrder" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "customerName" TEXT NOT NULL,
    "phone" TEXT NOT NULL,
    "email" TEXT,
    "quantity" INTEGER NOT NULL,
    "unitPrice" REAL,
    "totalAmount" REAL,
    "status" TEXT NOT NULL DEFAULT 'PENDING',
    "paymentMethod" TEXT NOT NULL DEFAULT 'MOBILE_MONEY',
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    "eventId" TEXT NOT NULL,
    CONSTRAINT "TicketOrder_eventId_fkey" FOREIGN KEY ("eventId") REFERENCES "Event" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

INSERT INTO "new_TicketOrder" (
    "createdAt", "customerName", "email", "eventId", "id", "phone",
    "quantity", "status", "updatedAt"
)
SELECT
    "createdAt", "customerName", "email", "eventId", "id", "phone",
    "quantity", "status", "updatedAt"
FROM "TicketOrder";

-- The old schema did not record order pricing. Existing-order pricing is
-- approximate because the old schema did not store historical order pricing.
-- Orders containing multiple ticket types are rejected rather than silently
-- assigned an arbitrary price.
CREATE TABLE "order_type_validation" (
    "orderId" TEXT NOT NULL PRIMARY KEY,
    "ticketCount" INTEGER NOT NULL CHECK ("ticketCount" > 0),
    "distinctTicketTypeCount" INTEGER NOT NULL CHECK ("distinctTicketTypeCount" = 1)
);

INSERT INTO "order_type_validation" (
    "orderId", "ticketCount", "distinctTicketTypeCount"
)
SELECT
    "new_TicketOrder"."id",
    COUNT("Ticket"."id"),
    COUNT(DISTINCT "Ticket"."ticketTypeId")
FROM "new_TicketOrder"
LEFT JOIN "Ticket"
  ON "Ticket"."orderId" = "new_TicketOrder"."id"
GROUP BY "new_TicketOrder"."id";

-- Backfill only after proving each order has exactly one related ticket type.
-- The current TicketType.price is an explicitly APPROXIMATE fallback, not an
-- assertion about the historical price paid for the order.
UPDATE "new_TicketOrder"
SET
    "unitPrice" = (
        SELECT "TicketType"."price"
        FROM "Ticket" JOIN "TicketType"
          ON "TicketType"."id" = "Ticket"."ticketTypeId"
        WHERE "Ticket"."orderId" = "new_TicketOrder"."id"
        GROUP BY "Ticket"."orderId"
        HAVING COUNT(DISTINCT "Ticket"."ticketTypeId") = 1
    ),
    "totalAmount" = "quantity" * (
        SELECT "TicketType"."price"
        FROM "Ticket" JOIN "TicketType"
          ON "TicketType"."id" = "Ticket"."ticketTypeId"
        WHERE "Ticket"."orderId" = "new_TicketOrder"."id"
        GROUP BY "Ticket"."orderId"
        HAVING COUNT(DISTINCT "Ticket"."ticketTypeId") = 1
    );

DROP TABLE "order_type_validation";

-- Validate quantity and the approximate backfill before enforcing the final
-- schema. The formula uses SQLite's exact stored REAL arithmetic expression;
-- no additional rounding policy is introduced.
CREATE TABLE "pricing_validation" (
    "orderId" TEXT NOT NULL PRIMARY KEY,
    "quantity" INTEGER NOT NULL CHECK (
        typeof("quantity") = 'integer' AND "quantity" > 0
    ),
    "unitPrice" REAL NOT NULL CHECK (
        "unitPrice" >= 0 AND
        "unitPrice" = "unitPrice" AND
        "unitPrice" < 1.7976931348623157e+308
    ),
    "totalAmount" REAL NOT NULL CHECK (
        "totalAmount" >= 0 AND
        "totalAmount" = "totalAmount" AND
        "totalAmount" < 1.7976931348623157e+308
    ),
    CHECK ("totalAmount" = "unitPrice" * "quantity")
);

INSERT INTO "pricing_validation" (
    "orderId", "quantity", "unitPrice", "totalAmount"
)
SELECT "id", "quantity", "unitPrice", "totalAmount"
FROM "new_TicketOrder";

DROP TABLE "pricing_validation";

-- The final rebuild enforces NOT NULL only after the backfill. If an order has
-- no related ticket type or a non-finite source price, this INSERT aborts
-- rather than inventing a value or silently losing the order.
CREATE TABLE "final_TicketOrder" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "customerName" TEXT NOT NULL,
    "phone" TEXT NOT NULL,
    "email" TEXT,
    "quantity" INTEGER NOT NULL,
    "unitPrice" REAL NOT NULL,
    "totalAmount" REAL NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'PENDING',
    "paymentMethod" TEXT NOT NULL DEFAULT 'MOBILE_MONEY',
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    "eventId" TEXT NOT NULL,
    CONSTRAINT "TicketOrder_eventId_fkey" FOREIGN KEY ("eventId") REFERENCES "Event" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

INSERT INTO "final_TicketOrder" (
    "createdAt", "customerName", "email", "eventId", "id", "phone",
    "quantity", "status", "unitPrice", "totalAmount", "paymentMethod",
    "updatedAt"
)
SELECT
    "createdAt", "customerName", "email", "eventId", "id", "phone",
    "quantity", "status", "unitPrice", "totalAmount", "paymentMethod",
    "updatedAt"
FROM "new_TicketOrder";

DROP TABLE "new_TicketOrder";
-- Replace the original only after every validated row is in the final table.
-- Ticket.orderId values remain valid because the replacement keeps the same
-- TicketOrder table name and preserves every order primary key.
DROP TABLE "TicketOrder";
ALTER TABLE "final_TicketOrder" RENAME TO "TicketOrder";

PRAGMA foreign_keys=ON;
PRAGMA foreign_key_check;
PRAGMA defer_foreign_keys=OFF;
