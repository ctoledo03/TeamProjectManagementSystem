const express = require('express');
const { ApolloServer } = require('@apollo/server');
const cors = require('cors');
const cookieParser = require('cookie-parser');
const jwt = require('jsonwebtoken');
require('dotenv').config();
const { expressMiddleware } = require('@apollo/server/express4');

const configureMongoose = require('./config/mongoose');
const typeDefs = require('./graphql/typeDefs');
const resolvers = require('./graphql/resolvers');

const app = express();

// Middleware
app.use(cookieParser());
app.use(express.json());
app.use(cors({
  origin: 'http://localhost:5173',
  credentials: true,
  methods: ['GET', 'POST', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
}));

const JWT_SECRET = process.env.JWT_SECRET;

// Authentication middleware
const authMiddleware = async (req, res, next) => {
  const token = req.cookies.token;
  if (token) {
    try {
      const decoded = jwt.verify(token, JWT_SECRET);
      req.user = decoded;
    } catch (err) {
      console.error('Token verification failed:', err.message);
      req.user = null;
    }
  }
  next();
};

app.use(authMiddleware);

const server = new ApolloServer({
  typeDefs,
  resolvers,
});

const PORT = process.env.PORT || 4000;

async function startServer() {
  await configureMongoose();
  await server.start();
  
  app.use('/', expressMiddleware(server, {
    context: async ({ req, res }) => {
      return {
        user: req.user,
        res
      };
    }
  }));

  app.listen(PORT, () => {
    console.log(`🚀 Server running at http://localhost:${PORT}/`);
  });
}

startServer().catch(error => {
  console.error('Failed to start the server:', error);
});
