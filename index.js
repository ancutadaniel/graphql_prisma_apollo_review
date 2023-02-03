import { ApolloServer } from 'apollo-server-express';
import cors from 'cors';
import express from 'express';
import { expressjwt } from 'express-jwt';
import jwt from 'jsonwebtoken';

import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

import { readFile } from 'fs/promises';

import Query from './src/resolvers/Query.js';
import Mutation from './src/resolvers/Mutation.js';

const PORT = 9000;
const JWT_SECRET = Buffer.from(process.env.JWT_SECRET, 'base64');

const typeDefs = await readFile('./src/schema.graphql', 'utf8');

const resolvers = {
  Query,
  Mutation,
};

const app = express();

app.use(
  cors(),
  express.json(),
  expressjwt({
    algorithms: ['HS256'],
    credentialsRequired: false,
    secret: JWT_SECRET,
  })
);

app.post('/login', async (req, res) => {
  const { email, password } = req.body;

  const user = await prisma.user.findUnique({
    where: {
      email,
    },
  });

  if (user && user.password === password) {
    const token = jwt.sign({ sub: user.id }, JWT_SECRET);
    res.json({ token });
  } else {
    res.sendStatus(401);
  }
});

const context = async ({ req }) => {
  // find the user by the id in the JWT token and add it to the context
  // auth is added by express-jwt if the authorization header is present
  const user =
    req.user && (await prisma.user.findUnique({ where: { id: req.user.sub } }));
  return { user };
};

const apolloServer = new ApolloServer({
  typeDefs,
  resolvers,
  context,
});

await apolloServer.start();

apolloServer.applyMiddleware({ app, path: '/graphql' });

app.listen({ port: PORT }, () => {
  console.log(`Express Server running on port:  http://localhost:${PORT}`);
  console.log(
    `GraphQL running on port: http://localhost:${PORT}${apolloServer.graphqlPath}`
  );
});
