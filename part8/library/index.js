const { ApolloServer } = require('@apollo/server')
const { startStandaloneServer } = require('@apollo/server/standalone')
const { GraphQLError } = require('graphql')
const { v4: uuidv4 } = require('uuid')
const mongoose = require('mongoose')
const jwt = require('jsonwebtoken')

mongoose.set('strictQuery', false)

const Book = require('./models/book')
const Author = require('./models/author')
const User = require('./models/user')

const MONGODB_URI = "mongodb+srv://chuygs12:LqHj35Dz5QX4pzri@cluster0.mbqdmof.mongodb.net/?retryWrites=true&w=majority"

const JWT_SECRET = 'SECRET_PASSWORD'

console.log('connecting to...' , MONGODB_URI)

mongoose.connect(MONGODB_URI)
  .then(() => {
    console.log('connected to MongoDB')
  })
  .catch((error) => {
    console.log('error connection to MongoDb:', error.message)
  })

let authors = [
  {
    name: 'Robert Martin',
    id: "afa51ab0-344d-11e9-a414-719c6709cf3e",
    born: 1952,
  },
  {
    name: 'Martin Fowler',
    id: "afa5b6f0-344d-11e9-a414-719c6709cf3e",
    born: 1963
  },
  {
    name: 'Fyodor Dostoevsky',
    id: "afa5b6f1-344d-11e9-a414-719c6709cf3e",
    born: 1821
  },
  { 
    name: 'Joshua Kerievsky', // birthyear not known
    id: "afa5b6f2-344d-11e9-a414-719c6709cf3e",
  },
  { 
    name: 'Sandi Metz', // birthyear not known
    id: "afa5b6f3-344d-11e9-a414-719c6709cf3e",
  },
]

let books = [
  {
    title: 'Clean Code',
    published: 2008,
    author: 'Robert Martin',
    id: "afa5b6f4-344d-11e9-a414-719c6709cf3e",
    genres: ['refactoring']
  },
  {
    title: 'Agile software development',
    published: 2002,
    author: 'Robert Martin',
    id: "afa5b6f5-344d-11e9-a414-719c6709cf3e",
    genres: ['agile', 'patterns', 'design']
  },
  {
    title: 'Refactoring, edition 2',
    published: 2018,
    author: 'Martin Fowler',
    id: "afa5de00-344d-11e9-a414-719c6709cf3e",
    genres: ['refactoring']
  },
  {
    title: 'Refactoring to patterns',
    published: 2008,
    author: 'Joshua Kerievsky',
    id: "afa5de01-344d-11e9-a414-719c6709cf3e",
    genres: ['refactoring', 'patterns']
  },  
  {
    title: 'Practical Object-Oriented Design, An Agile Primer Using Ruby',
    published: 2012,
    author: 'Sandi Metz',
    id: "afa5de02-344d-11e9-a414-719c6709cf3e",
    genres: ['refactoring', 'design']
  },
  {
    title: 'Crime and punishment',
    published: 1866,
    author: 'Fyodor Dostoevsky',
    id: "afa5de03-344d-11e9-a414-719c6709cf3e",
    genres: ['classic', 'crime']
  },
  {
    title: 'The Demon ',
    published: 1872,
    author: 'Fyodor Dostoevsky',
    id: "afa5de04-344d-11e9-a414-719c6709cf3e",
    genres: ['classic', 'revolution']
  },
]


const typeDefs = `

type Author {
  name: String!
  id: ID!
  born: Int
  bookCount: Int
}

type Book {
  title: String!
  published: Int!
  author: Author!
  id: ID!
  genres: [String!]
}

type User {
  username: String!
  favoriteGenre: String!
  id: ID!
}

type Token {
  value: String!
}

type Query {
  bookCount: Int
  authorCount: Int
  allBooks(name: String genre: String): [Book!]
  allAuthors: [Author!]
  me: User
}

type Mutation {
  addBook(
    title: String!
    author: String!
    published: Int!
    genres: [String!]!
  ): Book
  editAuthor(
    name: String!
    born: Int!
  ): Author
  createUser(
    username:String!
    favoriteGenre:String!
  ):User
  login(
    username: String!
    password: String!       
  ): Token
}
`

const resolvers = {
  Query: {
    bookCount: async () => Book.collection.countDocuments(), 
    authorCount: async () => Author.collection.countDocuments(), 
    allBooks: async (root,args) => {
      if (args.author && args.genres) {
        const author = await Author.findOne({name: args.author})
        const books = await Book.find({
          $and: [{
            author:{$in:author.id},
            genres:{$in: args.genres}
            }]
          }).populate('author')
        return books
      } 
      else if (args.genres) {
        const books = await Book.find({genres:{$in: args.genres}}).populate('author');
        return books
      } 
      else if (args.author) {
        const author = await Author.findOne({name: args.author});
        const books = await Book.find({author:{$in: author.id}}).populate('author');
        return books;
      } 
      else {
        return await Book.find({}).populate('author');
      }
  },
    allAuthors: async () => Author.find({}),
    me: (root, args, context) => {
      console.log(context)
      return context.currentUser
    }
  },

  Author: {
    bookCount: async (root) => Book.find({author: root.id}).countDocuments()
  },

  Mutation: {
    addBook: async (root, args, { currentUser }) => {
      if(!currentUser){
        throw new GraphQLError('not authenticated', {
          extensions: {
            code: 'BAD_USER_INPUT',
          }
        })
      }
      let author = await Author.findOne({name: args.author})
      if(!author){
        try{
          author = new Author({name: args.author})
          await author.save();
        } catch (error) {
          throw new GraphQLError('Saving Author failed', {
            extensions: {
              code: 'BAD_USER_INPUT',
              invalidArgs: args.name,
              error
            }
          })
        }
      }
      const book = new Book({...args,author: author.id})
      try{
        await book.save()
      }catch (error){
        throw new GraphQLError('Saving Book failed', {
          extensions: {
            code: 'BAD_USER_INPUT',
            invalidArgs: args.name,
            error
          }
        })
      }
      return book
    },
    editAuthor: async (root, args, { currentUser }) => {
      if(!currentUser){
        throw new GraphQLError('not authenticated', {
          extensions: {
            code: 'BAD_USER_INPUT',
          }
        })
      }
      const objAuthor = await Author.findOne({name:args.name})
      if (!objAuthor){
        return null
      } 
      const updatedAuthor = await Author.findByIdAndUpdate({_id:objAuthor._id},{born: args.setBornTo},{new:true})
      return updatedAuthor
    },
    createUser: (root, args) => {
      const user = new User({ ...args })
      return user.save()
      .catch(error => {
        throw new GraphQLError('Creating the user failed', {
          extensions: {
            code: 'BAD_USER_INPUT',
            invalidArgs: args.name,
            error
          }
        })
      })
    },
    login: async (root,args) => {
      const user = await User.findOne({username:args.username})
      if(!user || args.password !== 'secret'){
        throw new GraphQLError('wrong credentials', {
          extensions: {
            code: 'BAD_USER_INPUT'
          }
        })       
      }   
      const userForToken = {
          username: args.username,
          id: user._id
      }

      console.log(userForToken)

      return {value: jwt.sign(userForToken , JWT_SECRET)}
  }
  }
}
 

const server = new ApolloServer({
  typeDefs,
  resolvers,
})

startStandaloneServer(server, {
  listen: { port: 4000 },
  context: async ({ req, res }) => {
  const auth = req ? req.headers.authorization : null
  if(auth && auth.startsWith('Bearer ')){
  const decodedToken = jwt.verify(
  auth.substring(7), JWT_SECRET)

  const currentUser = await User.findById(decodedToken.id)
  return { currentUser }
    }
  }
}).then(({ url }) => {
  console.log(`Server ready at ${url}`)
})

