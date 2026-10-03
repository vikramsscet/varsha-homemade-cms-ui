# Varsha Homemade CMS

A lightweight CMS and Product Catalogue management system for **Varsha Homemade**.

The application provides an admin interface to manage:

* Product Categories
* Products
* Rich-text Product Descriptions
* Product Images
* Product Availability
* Product Status
* Product Cloning
* Product Image Storage

The project is intentionally kept simple and is being developed incrementally.

---

## 1. Technology Stack

### Backend

* Node.js
* Express.js
* JavaScript
* PostgreSQL
* REST APIs
* Swagger / OpenAPI

### Frontend

* React
* Vite
* JavaScript
* Tailwind CSS
* React Router
* Axios

### Storage

* Supabase Storage
* S3-compatible protocol

### Database

* PostgreSQL

---

# 2. Project Architecture

```text
                    Varsha Homemade CMS
                           │
             ┌─────────────┴─────────────┐
             │                           │
             ▼                           ▼
       React CMS UI                Express REST API
       React + Vite                     │
       Tailwind CSS                     │
       React Router                     │
       Axios                            │
             │                          │
             └──────────────┬───────────┘
                            │
                            ▼
                       PostgreSQL
                            │
                ┌───────────┴───────────┐
                │                       │
             Products               Categories
                │
                ▼
          Product Images
                │
                ▼
        Supabase Storage
        S3-compatible API
```

---

# 3. Project Structure

```text
varsha-homemade/
│
├── backend/
│   ├── src/
│   │   ├── controllers/
│   │   ├── routes/
│   │   ├── services/
│   │   ├── repositories/
│   │   ├── middleware/
│   │   ├── config/
│   │   └── app.js
│   │
│   └── ...
│
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   ├── pages/
│   │   ├── services/
│   │   ├── routes/
│   │   ├── layouts/
│   │   └── App.jsx
│   │
│   └── ...
│
└── README.md
```

The exact folder structure should follow the current implementation.

---

# 4. Development Philosophy

The project is intentionally being developed **feature by feature**.

Each feature should be:

1. Implemented independently
2. Reviewed manually
3. Tested through the UI/API
4. Stabilized before moving to the next feature

At the current stage:

* No Docker
* No TypeScript
* No unit tests
* No unnecessary dependencies
* No complex state-management framework

---

# 5. Backend API

Base URL:

```text
http://localhost:3000/api/v1
```

---

# 6. Health API

Used by the CMS Dashboard to verify backend availability.

```http
GET /health
```

Example:

```bash
curl http://localhost:3000/api/v1/health
```

---

# 7. Category APIs

Categories are used to organize Products.

## Get Categories

```http
GET /categories
```

---

## Get Category

```http
GET /categories/:id
```

Example response:

```json
{
  "id": "62045cc4-5722-4a78-a680-52bf8d69d8a4",
  "name": "Snacks",
  "slug": "snacks",
  "description": "Homemade snacks",
  "displayOrder": 1,
  "isActive": true,
  "createdAt": "2026-09-27T17:22:38.436Z",
  "updatedAt": "2026-09-27T17:22:38.436Z"
}
```

---

## Create Category

```http
POST /categories
```

Request:

```json
{
  "name": "Snacks",
  "slug": "snacks",
  "description": "Homemade snacks",
  "displayOrder": 1,
  "isActive": true
}
```

---

## Update Category

```http
PATCH /categories/:id
```

---

## Delete Category

```http
DELETE /categories/:id
```

---

# 8. Product APIs

Products are the primary entity managed by the CMS.

A Product contains:

* Title
* Subtitle
* Rich-text description
* Price
* Currency
* Package size
* Category
* Status
* Featured flag
* Availability
* Display order
* Product images

---

# 9. Product List

```http
GET /products
```

Supports pagination.

Example:

```http
GET /products?page=1&limit=20
```

Example:

```text
http://localhost:3000/api/v1/products?page=1&limit=20
```

Example response:

```json
{
  "data": [
    {
      "id": "72b91880-c947-4323-a045-67ba0955a133",
      "slug": "homemade-chakli",
      "title": "Homemade Chakli",
      "subtitle": "Crispy & Fresh",
      "price": 250,
      "currency": "INR",
      "packageSize": "500 g",
      "status": "DRAFT",
      "isFeatured": false,
      "isAvailable": true,
      "displayOrder": 1,
      "category": {
        "id": "62045cc4-5722-4a78-a680-52bf8d69d8a4",
        "name": "Snacks",
        "slug": "snacks"
      },
      "createdAt": "2026-09-27T17:24:43.298Z",
      "updatedAt": "2026-09-27T17:24:43.298Z",
      "publishedAt": null,
      "images": [
        {
          "id": "ae67f200-f231-4f79-a0ff-9a56f6536d1a",
          "url": "https://...",
          "altText": "Homemade Chakli",
          "displayOrder": 1,
          "isPrimary": true
        }
      ]
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 20,
    "total": 1,
    "totalPages": 1
  }
}
```

---

# 10. Create Product

```http
POST /products
```

The current Create Product API accepts:

```json
{
  "title": "Homemade Chakli",
  "slug": "homemade-chakli",
  "subtitle": "Crispy & Fresh",
  "description": {
    "type": "doc",
    "content": [
      {
        "type": "paragraph",
        "content": [
          {
            "type": "text",
            "text": "Crispy homemade chakli made using traditional ingredients."
          }
        ]
      }
    ]
  },
  "price": 250,
  "currency": "INR",
  "packageSize": "500 g",
  "categoryId": "62045cc4-5722-4a78-a680-52bf8d69d8a4",
  "status": "DRAFT",
  "isFeatured": false,
  "isAvailable": true,
  "displayOrder": 1
}
```

### Create Product Fields

| Field          | Description                    |
| -------------- | ------------------------------ |
| `title`        | Product title                  |
| `slug`         | Unique URL-friendly identifier |
| `subtitle`     | Product subtitle               |
| `description`  | Rich-text JSON document        |
| `price`        | Product price                  |
| `currency`     | Currency code                  |
| `packageSize`  | Package size                   |
| `categoryId`   | Product Category ID            |
| `status`       | Product status                 |
| `isFeatured`   | Featured Product flag          |
| `isAvailable`  | Product availability           |
| `displayOrder` | Product ordering               |

---

# 11. Get Product

```http
GET /products/:id
```

Returns complete Product information including:

* Product details
* Category
* Rich-text description
* Product images
* Timestamps
* Publishing information

---

# 12. Update Product

```http
PATCH /products/:id
```

The Product Edit UI uses this API to update Product information.

---

# 13. Delete Product

```http
DELETE /products/:id
```

---

# 14. Product Cloning

## Important

There is **no dedicated Product Clone API**.

The frontend clones a Product using the existing Product and Product Image APIs.

The frontend does **not** call:

```http
POST /products/:id/clone
```

Instead, cloning is implemented as an orchestration workflow.

---

## Clone Flow

```text
User clicks Clone
       │
       ▼
GET /products/:id
       │
       ▼
Build Create Product Payload
       │
       ▼
POST /products
       │
       ▼
New Product ID
       │
       ▼
GET /products/:sourceProductId/images
       │
       ▼
Fetch each source image
       │
       ▼
Convert image to File
       │
       ▼
POST /products/:newProductId/images
       │
       ▼
All images cloned
       │
       ▼
Refresh Product List
```

---

# 15. Clone Product Data

When cloning a Product, the following fields are copied:

```text
title
subtitle
description
price
currency
packageSize
categoryId
isFeatured
isAvailable
displayOrder
```

The following fields are generated by the backend or changed during cloning:

```text
id
slug
createdAt
updatedAt
publishedAt
status
```

---

# 16. Clone Status

A cloned Product is always created as:

```text
DRAFT
```

For example:

```text
Original Product:
PUBLISHED

Cloned Product:
DRAFT
```

This prevents cloning a published Product directly into another published Product.

---

# 17. Clone Category Mapping

The Product GET API returns the category as an object:

```json
{
  "category": {
    "id": "62045cc4-5722-4a78-a680-52bf8d69d8a4",
    "name": "Snacks",
    "slug": "snacks"
  }
}
```

The Create Product API expects:

```json
{
  "categoryId": "62045cc4-5722-4a78-a680-52bf8d69d8a4"
}
```

Therefore the clone implementation maps:

```javascript
categoryId: sourceProduct.category.id
```

The complete `category` object is not sent to the Create Product API.

---

# 18. Clone Slug

The cloned Product must have a unique slug.

Example:

```text
Original:
homemade-chakli

Clone:
homemade-chakli-copy
```

If necessary:

```text
homemade-chakli-copy-2
homemade-chakli-copy-3
```

The original Product slug is never modified.

---

# 19. Product Image APIs

Product images are stored separately from the Product record.

Each image contains:

```text
id
productId
url
altText
displayOrder
isPrimary
createdAt
updatedAt
```

---

## Get Product Images

```http
GET /products/:productId/images
```

Example:

```http
GET /api/v1/products/72b91880-c947-4323-a045-67ba0955a133/images
```

---

## Upload Product Image

```http
POST /products/:productId/images
```

Content type:

```text
multipart/form-data
```

Fields:

```text
file
altText
isPrimary
displayOrder
```

Example:

```bash
curl --request POST \
  --url http://localhost:3000/api/v1/products/{productId}/images \
  --header 'Content-Type: multipart/form-data' \
  --form 'file=@C:\path\image.png' \
  --form 'altText=Homemade Chakli' \
  --form 'isPrimary=true' \
  --form 'displayOrder=1'
```

---

# 20. Delete Product Image

```http
DELETE /products/:productId/images/:imageId
```

Example:

```bash
curl --request DELETE \
  --url http://localhost:3000/api/v1/products/{productId}/images/{imageId}
```

---

# 21. Clone Product Images

Product images are cloned separately from the Product.

The source image URL is fetched and converted into a `File`.

The File is then uploaded to the new Product using the existing image upload API.

```text
Source Image
     │
     ▼
Source Image URL
     │
     ▼
fetch()
     │
     ▼
Blob
     │
     ▼
File
     │
     ▼
FormData
     │
     ▼
POST /products/:newProductId/images
```

The following image metadata is preserved:

```text
altText
displayOrder
isPrimary
```

The cloned image receives a new database Image ID.

The source image is never modified.

---

# 22. Supabase Storage

Product images are stored in:

```text
Supabase Storage
```

Bucket:

```text
varsha-homemade
```

Recommended structure:

```text
varsha-homemade/
└── products/
    └── {productId}/
        ├── image-1.png
        ├── image-2.png
        └── image-3.webp
```

Each Product has its own storage path.

This is important for Product Cloning because cloned images are uploaded to the new Product's storage path.

---

# 23. Supabase S3 Configuration

The application uses Supabase Storage through its S3-compatible API.

### Endpoint

```text
https://abuysgnnvbemcemmjhdo.storage.supabase.co/storage/v1/s3
```

### Region

```text
ap-northeast-1
```

Example backend configuration:

```env
SUPABASE_S3_ENDPOINT=https://abuysgnnvbemcemmjhdo.storage.supabase.co/storage/v1/s3
SUPABASE_S3_REGION=ap-northeast-1
SUPABASE_S3_ACCESS_KEY_ID=<ACCESS_KEY>
SUPABASE_S3_SECRET_ACCESS_KEY=<SECRET_KEY>

SUPABASE_STORAGE_BUCKET=varsha-homemade
```

---

# 24. Storage Security

The following values must never be exposed to the React frontend:

```text
SUPABASE_S3_ACCESS_KEY_ID
SUPABASE_S3_SECRET_ACCESS_KEY
DATABASE_URL
```

They must remain server-side environment variables.

Never commit them to Git.

Use:

```text
.env
```

and ensure it is included in `.gitignore`.

---

# 25. Rich Text Description

Product descriptions are stored as JSONB rather than HTML.

Example:

```json
{
  "type": "doc",
  "content": [
    {
      "type": "paragraph",
      "content": [
        {
          "type": "text",
          "text": "Crispy homemade chakli made using traditional ingredients."
        }
      ]
    }
  ]
}
```

This allows the CMS to support rich-text editing while keeping structured content in PostgreSQL.

---

# 26. Product Fields

| Field          | Description                    |
| -------------- | ------------------------------ |
| `id`           | Unique Product UUID            |
| `slug`         | Unique URL-friendly identifier |
| `title`        | Product title                  |
| `subtitle`     | Product subtitle               |
| `description`  | Rich-text JSON                 |
| `price`        | Product price                  |
| `currency`     | Currency code                  |
| `packageSize`  | Package information            |
| `categoryId`   | Associated Category            |
| `status`       | Product status                 |
| `isFeatured`   | Featured flag                  |
| `isAvailable`  | Availability flag              |
| `displayOrder` | Display ordering               |
| `createdAt`    | Creation timestamp             |
| `updatedAt`    | Last update timestamp          |
| `publishedAt`  | Publication timestamp          |

---

# 27. Category Fields

| Field          | Description                    |
| -------------- | ------------------------------ |
| `id`           | Category UUID                  |
| `name`         | Category name                  |
| `slug`         | Unique URL-friendly identifier |
| `description`  | Category description           |
| `displayOrder` | Category ordering              |
| `isActive`     | Active state                   |
| `createdAt`    | Creation timestamp             |
| `updatedAt`    | Last update timestamp          |

---

# 28. CMS UI Features

The CMS currently supports:

## Dashboard

* Backend health
* Basic counts

## Categories

* Category List
* Create Category
* Edit Category
* Delete Category

## Products

* Product List
* Create Product
* Edit Product
* Product Image Gallery
* Product Image Upload
* Product Image Delete
* Product Clone

---

# 29. Product List UI

The Product List provides:

* Pagination
* Product title
* Subtitle
* Price
* Package size
* Category
* Status
* Featured state
* Availability
* Primary image
* Product actions

Product actions:

```text
Edit
Clone
Delete
```

---

# 30. Product Create UI

The Product Create form supports:

```text
Title
Slug
Subtitle
Description
Price
Currency
Package Size
Category
Status
Featured
Available
Display Order
```

---

# 31. Product Edit UI

The Product Edit screen uses:

```http
PATCH /products/:id
```

Product image management is handled separately through the Product Image Gallery.

---

# 32. Product Image Gallery

The Product Image Gallery supports:

* Image preview
* Primary image badge
* Alt text
* Display order
* Image upload
* Image delete
* Loading state
* Empty state
* Error state

---

# 33. Frontend API Client

All frontend API calls should go through the centralized Axios client.

Example:

```text
src/services/api.js
```

Feature-specific services should use the centralized client.

For example:

```text
src/services/productService.js
src/services/categoryService.js
src/services/productImageService.js
```

React components should not contain raw Axios calls where possible.

---

# 34. Product Clone Service

Although there is no backend clone API, the frontend may expose a helper such as:

```javascript
cloneProduct(productId)
```

This is an **orchestration function**, not an API endpoint.

Internally:

```text
cloneProduct()
    │
    ├── getProduct()
    │
    ├── createProduct()
    │
    ├── getProductImages()
    │
    └── uploadProductImage() × N
```

It must never call:

```text
POST /products/:id/clone
```

---

# 35. Frontend Routing

The application uses React Router.

Current routes include:

```text
/dashboard

/categories

/categories/new

/categories/:id/edit

/products

/products/new

/products/:id/edit
```

Product image management is integrated into the Product Edit experience.

---

# 36. API Integration Summary

| Feature         | Method | Endpoint                               |
| --------------- | ------ | -------------------------------------- |
| Health          | GET    | `/health`                              |
| Categories      | GET    | `/categories`                          |
| Get Category    | GET    | `/categories/:id`                      |
| Create Category | POST   | `/categories`                          |
| Update Category | PATCH  | `/categories/:id`                      |
| Delete Category | DELETE | `/categories/:id`                      |
| Products        | GET    | `/products`                            |
| Get Product     | GET    | `/products/:id`                        |
| Create Product  | POST   | `/products`                            |
| Update Product  | PATCH  | `/products/:id`                        |
| Delete Product  | DELETE | `/products/:id`                        |
| Product Images  | GET    | `/products/:productId/images`          |
| Upload Image    | POST   | `/products/:productId/images`          |
| Delete Image    | DELETE | `/products/:productId/images/:imageId` |

### Product Clone

There is intentionally **no separate Clone API**.

Product cloning uses:

```text
GET    /products/:id
POST   /products
GET    /products/:productId/images
POST   /products/:newProductId/images
GET    /products
```

---

# 37. Environment Configuration

Example:

```env
PORT=3000

DATABASE_URL=<POSTGRES_CONNECTION_STRING>

SUPABASE_S3_ENDPOINT=https://abuysgnnvbemcemmjhdo.storage.supabase.co/storage/v1/s3
SUPABASE_S3_REGION=ap-northeast-1
SUPABASE_S3_ACCESS_KEY_ID=<ACCESS_KEY>
SUPABASE_S3_SECRET_ACCESS_KEY=<SECRET_KEY>

SUPABASE_STORAGE_BUCKET=varsha-homemade
```

---

# 38. Local Development

## Backend

```bash
cd backend
npm install
npm run dev
```

Backend:

```text
http://localhost:3000
```

API:

```text
http://localhost:3000/api/v1
```

---

## Frontend

```bash
cd frontend
npm install
npm run dev
```

Frontend:

```text
http://localhost:5173
```

---

# 39. Swagger / OpenAPI

The backend provides Swagger/OpenAPI documentation for the REST APIs.

The documentation should include:

* Health
* Categories
* Products
* Product Images

Since Product Cloning is implemented entirely in the frontend using existing APIs, there is no separate Swagger endpoint for cloning.

---

# 40. Development Guidelines

### Backend

Follow:

```text
Routes
   ↓
Controller
   ↓
Service
   ↓
Repository / Database
```

### Frontend

Follow:

```text
Page
 ↓
Component
 ↓
Feature Service
 ↓
Axios API Client
 ↓
REST API
```

Keep business logic out of UI components where possible.

---

# 41. Current Feature Roadmap

| ID    | Feature                        | Status                |
| ----- | ------------------------------ | --------------------- |
| UI-1  | React + Vite Setup             | Completed             |
| UI-2  | Tailwind + Basic Visual Theme  | Completed             |
| UI-3  | CMS Layout + Sidebar           | Completed             |
| UI-4  | React Router                   | Completed             |
| UI-5  | Axios API Client               | Completed             |
| UI-6  | Dashboard                      | Completed             |
| UI-7  | Category List                  | Completed             |
| UI-8  | Create Category                | Completed             |
| UI-9  | Edit/Delete Category           | Completed             |
| UI-10 | Product List                   | Completed             |
| UI-11 | Product Create                 | Completed             |
| UI-12 | Product Edit                   | Completed             |
| UI-13 | Product Details                | Skipped               |
| UI-14 | Product Image Gallery          | Completed             |
| UI-15 | Product Image Upload           | Completed             |
| UI-16 | Product Image Delete / Primary | In Progress           |
| UI-17 | Product Clone                  | Planned / In Progress |

---

# 42. Future Enhancements

Potential future features:

* Product publishing workflow
* Rich-text editor improvements
* Drag-and-drop image ordering
* Set primary image API
* Image replacement
* Bulk image upload
* Product search
* Product filtering
* Category filtering
* Product sorting
* Product preview
* Product audit history
* Authentication
* Role-based access control
* SEO metadata
* Product tags
* Product variants
* Inventory management
* Public Product Catalogue API
* CDN optimization
* Image transformations
* Analytics

Features should continue to be implemented incrementally.

---

# 43. Security Considerations

Never commit:

```text
DATABASE_URL
SUPABASE_S3_ACCESS_KEY_ID
SUPABASE_S3_SECRET_ACCESS_KEY
```

Do not expose Supabase S3 credentials in the frontend.

Storage operations requiring credentials must be handled by the backend.

The frontend should communicate with the Express API rather than directly using privileged S3 credentials.

---

# 44. Current Architecture Summary

```text
                         CMS UI
                    React + Vite
                   Tailwind CSS
                         │
                         │ Axios
                         ▼
                  Express REST API
                         │
             ┌───────────┴───────────┐
             │                       │
             ▼                       ▼
        PostgreSQL             Supabase Storage
             │                   S3 Protocol
       ┌─────┴─────┐                 │
       │           │                 │
   Categories   Products             │
                   │                 │
                   ▼                 │
             Product Images ─────────┘
```

---

# 45. Product Clone Architecture

Product cloning intentionally happens at the application/UI layer using existing APIs.

```text
                  Clone Product
                       │
                       ▼
              GET /products/:id
                       │
                       ▼
              Build Create Payload
                       │
                       ▼
                POST /products
                       │
                       ▼
                New Product ID
                       │
                       ▼
        GET /products/:sourceId/images
                       │
                       ▼
               For each image
                       │
                       ▼
                Fetch Image URL
                       │
                       ▼
                  Blob → File
                       │
                       ▼
           POST /products/:newId/images
                       │
                       ▼
               Product Cloned
```

This approach avoids introducing a dedicated backend clone API while reusing the existing Product and Image APIs.

---

# 46. Design Goal

The primary goal of the Varsha Homemade CMS is to remain:

* Simple
* Lightweight
* Easy to maintain
* API-driven
* PostgreSQL-backed
* Storage-independent at the application layer
* Easy to extend
* Suitable for incremental development

New functionality should be added **one feature at a time**, reviewed, and validated before proceeding to the next feature.
