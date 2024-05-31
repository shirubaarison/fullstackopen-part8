/* eslint-disable react/prop-types */

import { useMutation, useQuery } from "@apollo/client";
import { ALL_AUTHORS, UPDATE_BIRTH } from "../queries";
import { useState } from "react";

const Authors = (props) => {
  const [name, setName] = useState('')
  const [born, setBorn] = useState('')
  
  const [ updateBornYear ] = useMutation(UPDATE_BIRTH, {
    refetchQueries: [ { query: ALL_AUTHORS } ]
  })

  const result = useQuery(ALL_AUTHORS)
  if (!props.show) {
    return null
  }

  if (result.loading)
    return <div>loading...</div>

  const authors = result.data.allAuthors

  const submit = async (event) => {
    event.preventDefault()

    updateBornYear({ variables: { name, born: parseInt(born) } })

    setName('')
    setBorn('')
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
          {authors.map((a) => (
            <tr key={a.name}>
              <td>{a.name}</td>
              <td>{a.born}</td>
              <td>{a.bookCount}</td>
            </tr>
          ))}
        </tbody>
      </table>

      <h2>Set birthyear</h2>
      <form onSubmit={submit}>
      <div>
          name
          <select value={name} onChange={({ target }) => setName(target.value)}>
            <option value="" disabled>Select author</option>
            {authors.map((a) => (
              <option key={a.name} value={a.name}>
                {a.name}
              </option>
            ))}
          </select>
        </div>
        <div>
          born
          <input
            value={born}
            onChange={({ target }) => setBorn(target.value)}
          />
        </div>
        <button type="submit">update author</button>
      </form>
    </div>
  )
}

export default Authors
