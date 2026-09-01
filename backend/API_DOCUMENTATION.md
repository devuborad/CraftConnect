# CraftConnect AI Backend API Documentation

Base URL: `http://localhost:5000/api`

---

## 1. Authentication (`/api/auth`)

### `POST /api/auth/register`
- **Description**: Registers a new user (artisan or buyer) and creates associated profile.
- **Request Body**:
```json
{
  "name": "Meena Ben",
  "email": "meena@craftconnect.ai",
  "phone": "+919876500001",
  "password": "password123",
  "role": "artisan",
  "language": "gu",
  "businessName": "Patan Patola Handloom",
  "location": "Patan, Gujarat"
}
```
- **Response**:
```json
{
  "success": true,
  "message": "Account created successfully.",
  "data": {
    "token": "eyJhbGciOiJIUzI1NiIsInR5...",
    "user": { "id": "...", "name": "Meena Ben", "role": "artisan" }
  }
}
```

### `POST /api/auth/login`
- **Description**: Authenticates user and returns JWT token.
- **Request Body**:
```json
{
  "emailOrPhone": "meena@craftconnect.ai",
  "password": "password123"
}
```

### `GET /api/auth/me`
- **Headers**: `Authorization: Bearer <token>`
- **Description**: Returns authenticated user details.

---

## 2. Products (`/api/products`)

### `GET /api/products`
- **Query Params**: `search`, `category`, `location`, `minPrice`, `maxPrice`, `material`, `craftType`, `page`, `limit`
- **Description**: Public marketplace product search with pagination.

### `POST /api/products`
- **Headers**: `Authorization: Bearer <token>` (Artisan or Admin)
- **Description**: Submits new product from Add Product Wizard.
- **Request Body**:
```json
{
  "name": "Handwoven Patola Cotton Saree",
  "categoryName": "Textiles",
  "material": "Organic Cotton",
  "craftType": "Handloom Double Ikkat",
  "origin": "Patan, Gujarat",
  "originalImageUrl": "https://images.unsplash.com/photo-1610030469983-98e550d6193c",
  "enhancedImageUrl": "https://images.unsplash.com/photo-1610030469983-98e550d6193c",
  "price": 4499,
  "stockQuantity": 5,
  "descriptionEn": "Exquisite handwoven Patola saree",
  "costs": {
    "rawMaterialCost": 1200,
    "labourCost": 1500,
    "packagingCost": 150,
    "otherCost": 100
  }
}
```

---

## 3. Bulk Inquiries (`/api/inquiries`)

### `POST /api/inquiries`
- **Headers**: `Authorization: Bearer <token>` (Buyer)
- **Request Body**:
```json
{
  "productId": "prod-1",
  "quantity": 50,
  "targetPrice": 3900,
  "message": "Bulk order inquiry for festival collection",
  "deliveryLocation": "Mumbai, Maharashtra"
}
```

---

## 4. B2C Cart & Orders (`/api/cart` & `/api/orders`)

### `POST /api/cart/items`
- **Description**: Adds item to buyer B2C cart.

### `POST /api/orders`
- **Headers**: `Authorization: Bearer <token>`
- **Description**: Direct Buy / Buy Now checkout flow. Validates stock and server-calculated unit prices safely inside a MySQL transaction.

---

## 5. AI Services & Pricing (`/api/ai` & `/api/pricing`)

### `POST /api/pricing/recommend`
- **Description**: Calculates total cost and recommended fair market price range.

### `POST /api/ai/image-enhance`
- **Description**: AI Studio image enhancement endpoint.

### `POST /api/ai/catalog`
- **Description**: Generates multi-lingual catalogue from voice transcript input.

### `POST /api/ai/chat`
- **Description**: CraftMate floating AI assistant chatbot query. Powered by Google Gemini AI (`gemini-2.5-flash`) when `GEMINI_API_KEY` is configured in `.env`.

---

## 6. Admin Dashboard (`/api/admin`)

### `GET /api/admin/dashboard`
- **Headers**: `Authorization: Bearer <admin-token>`
- **Description**: Statistics, charts data, and platform activity metrics.
