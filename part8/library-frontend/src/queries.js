import { gql } from "@apollo/client"

export const ALL_AUTHORS = gql`
query {
  allAuthors {
    bookCount
    born
    name
  }
}
`

export const ALL_BOOKS = gql`
query {
  allBooks {
    author
    title
    published
  }
}
`

export const CREATE_BOOK = gql`
mutation createBook($title: String!, $author: String, $published: Int!, $genres: [String!]){
  addBook(
    title: $title,
    author: $author,
    published: $published,
    genres: $genres
  ){
    title
    author
    published
  }
}
`

export const EDIT_YEAR = gql`
mutation editYear($name: String!, $born: Int!){
  editAuthor(
    name: $name,
    born: $born
  ){
    name
    born
  }
}
`