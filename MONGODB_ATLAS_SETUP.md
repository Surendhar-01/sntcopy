# MongoDB Atlas Express Setup

1. Create a MongoDB Atlas cluster and database user.
2. In Atlas, add your IP address under Network Access.
3. Copy the Node.js connection string.
4. Paste it in `server/.env.development`:

```env
MONGODB_URI=mongodb+srv://USER:PASSWORD@cluster0.xxxxx.mongodb.net/sri_nikil_erp?retryWrites=true&w=majority
MONGODB_DB=sri_nikil_erp
DEFAULT_ADMIN_PASSWORD=admin12345
PORT=5001
```

5. Start the app:

```bash
npm run dev
```

The Express Mongo backend runs on `http://localhost:5001`. The Vite dev server proxies `/api` requests to that port.

Fresh Atlas databases automatically get:

- default shop settings
- default `admin` account

Change the admin password from the Settings page after first login.
