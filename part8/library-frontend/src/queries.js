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