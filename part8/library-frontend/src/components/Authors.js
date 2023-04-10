import { useQuery } from "@apollo/client"
import { ALL_AUTHORS, EDIT_YEAR } from "../queries"
import { useState } from "react"
import { useMutation } from "@apollo/client"

const SetBirthYearForm = () => {
  const authors = useQuery(ALL_AUTHORS)

  const [editYear] = useMutation(EDIT_YEAR, {
    refetchQueries: [ {query: ALL_AUTHORS} ]
  }
    )

  const [name, setName] = useState("")
  const [born, setBorn] = useState("")
  console.log(name)

  const handleSubmit = (event) => {
    event.preventDefault()

    editYear( {variables: {name, born}} )

    console.log("changing year")

    setName("")
    setBorn("")
  }

  return(
  <form onSubmit={handleSubmit}>
    <div>
    </div>
    <div>
      <select onChange={({target}) => setName(target.value)}>
        {authors.data.allAuthors.map((a) => (
            <option key={a.name} value={a.name}>
              {a.name}
            </option>
        ))}
      </select>  
    </div>
    <div>
      Year
      <input
        value={born}
        onChange={( {target}) => setBorn(Number(target.value))}
      />
    </div>
    <button type="submit">Edit Year</button>
  </form>
  )
}

const Authors = (props) => {
  const authors = useQuery(ALL_AUTHORS)


  if (!props.show) {
    return null
  }

  if (authors.loading){
    return <p>loading...</p>
  }

  return (
    <div>
      <h2>authors</h2>
      <table>
        <tbody>
          <tr>
            <th></th>
            <th>born</th>
            <th>books</th>
          </tr>
          {authors.data.allAuthors.map((a) => (
            <tr key={a.name}>
              <td>{a.name}</td>
              <td>{a.born}</td>
              <td>{a.bookCount}</td>
            </tr>
          ))}
        </tbody>
      </table>
      <br></br>
      <SetBirthYearForm/>
    </div>

  )
}

export default Authors