# Backend setup

## Environment variables

Create a `.env` file in `backend/` with:

```
MONGODB_URI=mongodb+srv://<user>:<pass>@cluster0.xt9uwed.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0
NODE_ENV=development
```

Ensure your MongoDB Atlas Network Access allows your machine (for local) and your deployment (for production/Vercel) to connect.

## Development

```
npm install
npm run start
```

The server listens on port 3000 in non-production and connects to MongoDB via the cached connector.
