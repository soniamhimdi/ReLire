# Architecture du projet ReLire

## Arborescence actuelle

```
.
├── architecture.md
├── README_new.md
├── README.md
├── backend/
│   ├── package.json
│   ├── prisma.config.ts
│   ├── test.rest
│   ├── tsconfig.json
│   ├── prisma/
│   │   ├── schema.prisma
│   │   ├── seed.ts
│   │   └── migrations/
│   │       ├── migration_lock.toml
│   │       ├── 20260222060232_init/
│   │       │   └── migration.sql
│   │       ├── 20260222184840_set_default_rating_0/
│   │       │   └── migration.sql
│   │       └── 20260222211937_add_description_to_listing/
│   │           └── migration.sql
│   └── src/
│       ├── App.css
│       ├── index.ts
│       ├── config/
│       │   └── database.ts
│       ├── controllers/
│       │   ├── book.controller.ts
│       │   ├── listing.controller.ts
│       │   └── user.controller.ts
│       ├── generated/
│       │   └── prisma/
│       │       ├── browser.d.ts
│       │       ├── browser.js
│       │       ├── browser.ts
│       │       ├── client.d.ts
│       │       ├── client.js
│       │       ├── client.ts
│       │       ├── commonInputTypes.d.ts
│       │       ├── commonInputTypes.js
│       │       ├── commonInputTypes.ts
│       │       ├── enums.d.ts
│       │       ├── enums.js
│       │       ├── enums.ts
│       │       ├── models.d.ts
│       │       ├── models.js
│       │       ├── models.ts
│       │       └── internal/
│       │           ├── class.ts
│       │           ├── prismaNamespace.ts
│       │           └── prismaNamespaceBrowser.ts
│       ├── middleware/
│       │   └── clerk.middleware.ts
│       ├── prisma/
│       │   └── prisma.ts
│       ├── routes/
│       │   ├── book.routes.ts
│       │   ├── index.ts
│       │   ├── listing.routes.ts
│       │   └── user.routes.ts
│       ├── services/
│       └── types/
├── doc/
│   └── Relire_ERD.txt
└── frontend/
    ├── eslint.config.js
    ├── index.html
    ├── package.json
    ├── README.md
    ├── tsconfig.app.json
    ├── tsconfig.json
    ├── tsconfig.node.json
    ├── vite.config.ts
    ├── public/
    └── src/
        ├── App.css
        ├── App.tsx
        ├── config.ts
        ├── index.css
        ├── main.tsx
        ├── assets/
        ├── components/
        │   ├── Books/
        │   │   ├── BookCard.css
        │   │   ├── BookCard.tsx
        │   │   ├── BookFilters.css
        │   │   ├── BookFilters.tsx
        │   │   └── BookList.tsx
        │   ├── Layout/
        │   │   ├── Footer.tsx
        │   │   ├── Header.css
        │   │   ├── Header.tsx
        │   │   └── Navbar.tsx
        │   ├── Listings/
        │   │   ├── ListingCard.css
        │   │   ├── ListingCard.tsx
        │   │   ├── ListingDetail.tsx
        │   │   ├── ListingForm.css
        │   │   └── ListingForm.tsx
        │   └── UI/
        │       ├── Button.tsx
        │       ├── Input.tsx
        │       └── Modal.tsx
        ├── contexts/
        │   ├── clerk-auth.context.ts
        │   ├── ClerkAuthProvider.tsx
        │   └── useClerkAuth.ts
        ├── pages/
        │   ├── Admin.tsx
        │   ├── BookDetail.css
        │   ├── BookDetail.tsx
        │   ├── Books.css
        │   ├── Books.tsx
        │   ├── Home.css
        │   ├── Home.tsx
        │   ├── Listing.css
        │   ├── Listing.tsx
        │   ├── ListingDetail.css
        │   ├── ListingDetail.tsx
        │   ├── ListingEdit.tsx
        │   ├── Profile.css
        │   ├── Profile.tsx
        │   └── Test.tsx
        ├── services/
        │   └── api.ts
        └── types/
            └── index.ts
```
