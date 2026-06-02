# Local

## Swagger UI
http://127.0.0.1:8000/api/docs/
## OpenAPI Schema
http://127.0.0.1:8000/api/schema/
## ReDoc
http://127.0.0.1:8000/api/redoc/

for swagger authentication in backend apis.
# Swagger Authentication Setup Guide

## Step 1 → Register User

Open:

```http
POST /api/register/
```

Click:

> Try it out

Send:

```json
{
  "username": "janesh",
  "password": "1234"
}
```

Click:

> Execute

---

## Step 2 → Login

Open:

```http
POST /api/login/
```

Click:

> Try it out

Send:

```json
{
  "username": "janesh",
  "password": "1234"
}
```

Click:

> Execute

---

## Step 3 → Copy Access Token

You will receive:

```json
{
  "refresh": "eyJhbGciOi...",
  "access": "eyJhbGciOi..."
}
```

Copy ONLY the:

```text
access
```

token.

---

## Step 4 → Click Authorize 🔒

At the top-right corner in Swagger UI.

Paste:

```text
eyJhbGciOi...
```
Then click:
> Authorize