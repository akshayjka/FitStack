# My Project — Full-stack Products, Blog & Enquiries

## 1. Requirements
- Node.js 20+
- MongoDB 7+ locally, or a MongoDB Atlas cluster

## 2. Install
```bash
npm install
```

Copy `.env.example` to `.env` and configure it.

### Local MongoDB
Use:
```env
MONGO_URI=mongodb://localhost:27017/myproject
```
Make sure MongoDB is running.

### MongoDB Atlas
Create a database user, allow your deployment IP/network access, and use your Atlas connection string:
```env
MONGO_URI=mongodb+srv://USERNAME:PASSWORD@CLUSTER.mongodb.net/myproject?retryWrites=true&w=majority
```

## 3. Environment
Example:
```env
PORT=3000
MONGO_URI=mongodb://localhost:27017/myproject
JWT_SECRET=use-a-long-random-secret-at-least-32-characters
JWT_EXPIRES_IN=8h
NODE_ENV=development
MAX_UPLOAD_MB=50
```

For the initial admin, optionally add:
```env
ADMIN_USERNAME=admin
ADMIN_EMAIL=admin@example.com
ADMIN_PASSWORD=ChangeMe123!
```

## 4. Seed the admin
```bash
npm run seed:admin
```
The seed command creates or updates the admin account for the configured username.

For production, change the default password before exposing the application publicly.

## 5. Run locally
Development:
```bash
npm run dev
```
Production-like:
```bash
npm start
```
Open http://localhost:3000
Admin login: http://localhost:3000/admin/login

## 6. Application API
Public:
- `POST /api/enquiries`
- `GET /api/products`
- `GET /api/blogs`
- `GET /api/blogs/:slug`

Admin (JWT cookie protected):
- `GET /api/admin/enquiries`
- `DELETE /api/admin/enquiries/:id`
- `GET/POST /api/admin/products`
- `PUT/DELETE /api/admin/products/:id`
- `GET/POST /api/admin/blogs`
- `PUT/DELETE /api/admin/blogs/:id`
- `POST /api/admin/login`
- `POST /api/admin/logout`
- `GET /api/admin/me`

## 7. Upload storage
Local uploads are stored in `public/uploads`. `.gitignore` excludes uploaded files.

For Render, the default filesystem is ephemeral. Files uploaded to the local disk can disappear when the service restarts/redeploys. For production media, replace the storage implementation in `middleware/uploadMiddleware.js` with Cloudinary, S3, or another persistent object-storage provider. Keep MongoDB for metadata/URLs.

If you intentionally use Render persistent disk, mount it to a path and change `uploadDir` to that mounted path. Object storage is generally more portable for production deployments and multiple instances.

## 8. Render deployment
1. Push the project to GitHub/GitLab.
2. Create a Render Web Service.
3. Build command: `npm install`
4. Start command: `npm start`
5. Add environment variables:
   - `MONGO_URI`
   - `JWT_SECRET`
   - `JWT_EXPIRES_IN=8h`
   - `NODE_ENV=production`
   - `MAX_UPLOAD_MB=50`
   - `ADMIN_USERNAME`, `ADMIN_EMAIL`, `ADMIN_PASSWORD` if you want the seed command to be run during deployment/initialization.
6. Deploy.
7. Run `npm run seed:admin` once against the production database. If your Render setup does not provide a shell, run the seed command locally using the production `MONGO_URI` only in a controlled environment, then remove/secure that credential.

### Render uploads
Do not depend on `public/uploads` for permanent production media unless you have attached persistent storage. Cloudinary/S3 is recommended because Render instances can be replaced.

## 9. Security notes before production
- Use a long random `JWT_SECRET`.
- Use a strong unique admin password.
- Keep `.env` out of Git.
- Serve over HTTPS (Render does this for the public service URL).
- The enquiry endpoint has a rate limiter; consider CAPTCHA/Turnstile and stronger abuse protection for a public production site.
- Add CSRF protection if you expand cookie-authenticated state-changing endpoints across multiple origins.
- Add MIME/content scanning if accepting untrusted uploads at scale.
- Consider an object-storage upload flow rather than routing large media through the app server.
