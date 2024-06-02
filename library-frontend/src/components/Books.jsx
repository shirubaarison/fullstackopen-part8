/* eslint-disable react/prop-types */
import { useQuery } from "@apollo/client"
import { ALL_BOOKS } from "../queries"
import { useState, useEffect } from "react"

const Books = (props) => {
  const result = useQuery(ALL_BOOKS)
  const [books, setBooks] = useState(null)
  const [genres, setGenres] = useState(null)
  const [filtered, setFiltered] = useState(null)
  const [genre, setGenre] = useState(null)

  useEffect(() => {
    if (result.data) {
      setBooks(result.data.allBooks)
      setGenres(result.data.allBooks.flatMap(b => b.genres))
      setFiltered(result.data.allBooks)
    }
  }, [result.data]);

  const allGenres = [...new Set(genres)]

  const updateFilter = (genre) => {
    if (!genre) {
      setFiltered(books)
      setGenre(null)
    } else {
      const _books = books.filter(b => b.genres.includes(genre))
      setFiltered(_books)
      setGenre(genre)
    }
  }

  if (result.loading )
    return <div>loading...</div>

  if (!props.show) {
    return null
  }

  return (
    <div>
      <h2>books</h2>
      {genre && <p>in genrer <strong>{genre}</strong></p>}
      <table>
        <tbody>
          <tr>
            <th></th>
            <th>author</th>
            <th>published</th>
          </tr>
          {filtered.map((a) => (
            <tr key={a.title}>
              <td>{a.title}</td>
              <td>{a.author.name}</td>
              <td>{a.published}</td>
            </tr>
          ))}
        </tbody>
      </table>
      {allGenres.map(genre => (
        <button onClick={() => updateFilter(genre)}key={genre}>{genre}</button>
      ))}
      <button onClick={() => updateFilter(null)}>all genres</button>
    </div>
  )
}

export default Books
