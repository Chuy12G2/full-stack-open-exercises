const { ApolloServer } = require('@apollo/server')
const { startStandaloneServer } = require('@apollo/server/standalone')
const { v4: uuidv4 } = require('uuid')

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
  author: String!
  id: ID!
  genres: [String!]
}

type Query {
  bookCount: Int
  authorCount: Int
  allBooks(name: String genre: String): [Book!]
  allAuthors: [Author!]
}

type Mutation {
  addBook(
    title: String
    author: String
    published: Int
    genres: [String!]
  ): Book
  editAuthor(
    name: String!
    born: Int!
  ): Author
}
`

const resolvers = {
  Query: {
    bookCount: () => books.length,
    authorCount: () => authors.length,
    allBooks: (root, args) => {
      if(!args.name && !args.genre){
        return books
      }else if(args.name && args.genre){
        return books.filter(b => (b.author === args.name) && (b.genres.includes(args.genre)))
      } else if(args.name){
        return books.filter(b => b.author === args.name)
      } else if(args.genre){
        return books.filter(b => b.genres.includes(args.genre))
      }
    },
    allAuthors: (root, args) => authors
  },

  Author: {
    bookCount: (root) => {
      let authorBooks = 0
      books.forEach(element => {
        if(root.name === element.author){
          authorBooks += 1
        }
      }
      )
      return authorBooks
    } 
  },

  Mutation: {
    addBook: (root, args) => {
      const book = {...args, id: uuidv4()}
      books = books.concat(book)
      console.log(book);
      const authorExist = authors.find(a => args.author === a.name)
      console.log(authorExist);
      if (authorExist === undefined) {
        const newAuthor = {name: book.author, born: null, id: uuidv4()}
        authors = authors.concat(newAuthor)
      }
      return book
    },
    editAuthor: (root, args) => {
      const author = authors.filter(a => a.name === args.name)
      console.log(author)
      const updatedAuthor = { name: author[0].name, id: author[0].id, born: args.born }
      console.log(updatedAuthor)
      authors = authors.map(a => a.name === updatedAuthor.name ? updatedAuthor : a)
      return updatedAuthor
    }
    
  }
}
 

const server = new ApolloServer({
  typeDefs,
  resolvers,
})

startStandaloneServer(server, {
  listen: { port: 4000 },
}).then(({ url }) => {
  console.log(`Server ready at ${url}`)
})