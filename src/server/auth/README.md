# Google OAuth2 Authentication (Node.js + Express)

This project implements **Google OAuth2 authentication** with a secure, production-aligned flow using:

- Express (backend)
- Google OAuth2
- JWT (session)
- HTTP-only cookies
- SQLite (user persistence)

---

## Setup

### 1. Clone and install

```bash
bun install
```

---

### 2. Environment variables

Create `.env`:

```env
GOOGLE_CLIENT_ID=your_client_id
GOOGLE_CLIENT_SECRET=your_client_secret
JWT_SECRET=your_jwt_secret
```

---

### 3. Google Cloud Configuration

Go to **Google Cloud Console**

#### Create OAuth Client

- Type: Web application

#### Add redirect URI:

```text
http://localhost:3000/auth/google/callback
```

---

### 4. OAuth Consent Screen

- User type: **External**
- Publishing status: **Testing**
- Add your email under **Test Users**

---

## Backend Implementation

### Routes

```ts
GET / auth / google;
GET / auth / google / callback;
GET / auth / google / me;
```

---

## Cookie Strategy

```ts
res.cookie('auth_token', token, {
  httpOnly: true,
  secure: false, // true in production (HTTPS)
  sameSite: 'lax',
  maxAge: 7 * 24 * 60 * 60 * 1000, // 7d expiry
});
```

---

## Frontend Integration

### Trigger login

```js
const googleButtons = document.querySelectorAll(
    ".google-btn"
) as NodeListOf<HTMLButtonElement>;

googleButtons.forEach((btn) => {
    btn.addEventListener("click", () => {
        window.location.href = "http://localhost:3000/auth/google";
    });
});
```

---

### Restore session on load

```js
document.addEventListener('DOMContentLoaded', async () => {
  const res = await fetch('http://localhost:3000/auth/google/me', {
    credentials: 'include',
  });

  if (!res.ok) return;

  const user = await res.json();
  login(user.first_name || user.username);
});
```

---

### UI Login Handler

```js
function login(name) {
  document.getElementById('welcome-text').textContent = `Welcome ${name}`;
}
```

---
