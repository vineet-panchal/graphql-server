const express = require('express');
const expressGraphQL = require('express-graphql');

const {
  GraphQLSchema,
  GraphQLObjectType,
  GraphQLString,
  GraphQLList,
  GraphQLInt,
  GraphQLNonNull
} = require('graphql');

const app = express();

const authors = [
	{ id: 1, name: 'J. K. Rowling' },
	{ id: 2, name: 'J. R. R. Tolkien' },
	{ id: 3, name: 'Brent Weeks' }
]

const books = [
	{ id: 1, name: 'Harry Potter and the Chamber of Secrets', authorId: 1 },
	{ id: 2, name: 'Harry Potter and the Prisoner of Azkaban', authorId: 1 },
	{ id: 3, name: 'Harry Potter and the Goblet of Fire', authorId: 1 },
	{ id: 4, name: 'The Fellowship of the Ring', authorId: 2 },
	{ id: 5, name: 'The Two Towers', authorId: 2 },
	{ id: 6, name: 'The Return of the King', authorId: 2 },
	{ id: 7, name: 'The Way of Shadows', authorId: 3 },
	{ id: 8, name: 'Beyond the Shadows', authorId: 3 }
]

const BookType = new GraphQLObjectType({
  name: 'Book',
  description: 'A book written by an author',
  fields: () => ({
    id: {
      type: GraphQLNonNull(GraphQLInt),
      description: 'The unique identifier for the book'
    },
    name: {
      type: GraphQLNonNull(GraphQLString),
      description: 'The name of the book'
    },
    authorId: {
      type: GraphQLNonNull(GraphQLInt),
      description: 'The ID of the author who wrote the book'
    },
    author: {
      type: AuthorType,
      resolve: (book) => {
        return authors.find(author => author.id === book.authorId);
      }
    }
  })
});

const AuthorType = new GraphQLObjectType({
  name: 'Author',
  description: 'This represents an author of books',
  fields: () => ({
    id: {
      type: GraphQLNonNull(GraphQLInt),
      description: 'The unique identifier for the author'
    },
    name: {
      type: GraphQLNonNull(GraphQLString),
      description: 'The name of the author'
    },
    books: {
      type: new GraphQLList(BookType),
      description: 'List of books written by the author',
      resolve: (author) => {
        return books.filter(book => book.authorId === author.id);
      }
    }
  })
});

const RootQueryType = new GraphQLObjectType({
  name: 'Query',
  description: 'Root Query',
  fields: () => ({
    book: {
      type: BookType,
      description: 'A single book',
      args: { 
        id: {
          type: GraphQLNonNull(GraphQLInt) 
        } 
      },
      resolve: (parent, args) => books.find(book => book.id === args.id)
    },
    books: {
      type: new GraphQLList(BookType),
      description: 'List of all books',
      resolve: () => books
    },
    author: {
      type: AuthorType,
      description: 'A single author',
      args: { 
        id: {
          type: GraphQLNonNull(GraphQLInt) 
        } 
      },
      resolve: (parent, args) => authors.find(author => author.id === args.id)
    },
    authors: {
      type: new GraphQLList(AuthorType),
      description: 'List of all authors',
      resolve: () => authors
    }
  })
});

const RootMutationType = new GraphQLObjectType({
  name: 'Mutation',
  description: 'Root Mutation',
  fields: () => ({
    addBook: {
      type: BookType,
      description: 'Add a book',
      args: {
        name: { type: GraphQLNonNull(GraphQLString) },
        authorId: { type: GraphQLNonNull(GraphQLInt) }
      },
      resolve: (parent, args) => {
        const newBook = {
          id: books.length + 1,
          name: args.name,
          authorId: args.authorId
        };
        books.push(newBook);
        return newBook;
      }
    },
    addAuthor: {
      type: AuthorType,
      description: 'Add an author',
      args: {
        name: { type: GraphQLNonNull(GraphQLString) }
      },
      resolve: (parent, args) => {
        const newAuthor = {
          id: authors.length + 1,
          name: args.name
        };
        authors.push(newAuthor);
        return newAuthor;
      }
    }
  })
});

const schema = new GraphQLSchema({
  query: RootQueryType,
  mutation: RootMutationType
});

// const schema = new GraphQLSchema({
//   query: new GraphQLObjectType({
//     name: 'HelloWorld',
//     fields: () => ({
//       message: {
//         type: GraphQLString,
//         resolve: () => 'Hello World!'
//       }
//     })
//   })
// });

app.use('/graphql', expressGraphQL.graphqlHTTP({
  schema: schema,
  graphiql: true
}));

app.listen(5005, () => console.log('Server is running'));