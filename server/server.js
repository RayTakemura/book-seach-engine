const express = require('express');
// import ApolloServer
const { ApolloServer } = require('apollo-server-express');
// import our typeDefs and resolvers
const { typeDefs, resolvers } = require('./schemas');
const path = require('path');
const db = require('./config/connection');


// import middleware
const { authMiddleware } = require('./utils/auth');

const app = express();
const PORT = process.env.PORT || 3001;
// create a new Apollo server and pass in our schema data
const server = new ApolloServer({
  typeDefs,
  resolvers,
  context: authMiddleware
});
// integrate our Apollo server with the Express application as middleware
server.applyMiddleware({ app });

app.use(express.urlencoded({ extended: false }));
app.use(express.json());

// if we're in production, serve client/build as static assets
if (process.env.NODE_ENV === 'production') {
  app.use(express.static(path.join(__dirname, '../client/build')));
}

app.get('*', (req,res) => {
  res.sendFile(path.join(__dirname, '../client/build/index.html'));
});


db.once('open', () => {
  app.listen(PORT, () => console.log(`🌍 Now listening on localhost:${PORT}`));
  // log where we can go to test our GQL API
  console.log(`Use GraphQL at http://localhost:${PORT}${server.graphqlPath}`);
});

app.get('*', (req, res) => {
  res.status(404).sendFile(path.join(__dirname, './public/404.html'));
});