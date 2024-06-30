/* eslint-disable react/prop-types */
import { useQuery, useSubscription } from "@apollo/client"
import { ALL_BOOKS, BOOK_ADDED } from "../queries"
import { useState, useEffect } from "react"

const Books = (props) => {
  const { loading, data } = useQuery(ALL_BOOKS)
  const [books, setBooks] = useState([])
  const [genres, setGenres] = useState([])
  const [filtered, setFiltered] = useState([])
  const [genre, setGenre] = useState(null)

  useSubscription(BOOK_ADDED, {
    onData: ({ data, client }) => {
      const addedBook = data.data.bookAdded
      try {
        client.cache.updateQuery({ query: ALL_BOOKS }, ({ allBooks }) => {
          return {
            allBooks: allBooks.concat(addedBook)
          }
        })
      } catch (error) {
        console.error('Error updating client cache:', error)
      }

      setBooks((prevBooks) => prevBooks.concat(addedBook))
      setGenres((prevGenres) => [
        ...new Set([...prevGenres, ...addedBook.genres]),
      ])
      if (!genre || addedBook.genres.includes(genre)) {
        setFiltered((prevFiltered) => prevFiltered.concat(addedBook))
      }
    }
  })

  useEffect(() => {
    if (data) {
      setBooks(data.allBooks)
      const genresSet = new Set(data.allBooks.flatMap(b => b.genres))
      setGenres([...genresSet])
      setFiltered(data.allBooks)
    }
  }, [data])

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

  if (loading)
    return <div>loading...</div>

  if (!props.show) {
    return null
  }

  return (
    <div>
      <h2>books</h2>
      {genre && <p>in genre <strong>{genre}</strong></p>}
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
        <button onClick={() => updateFilter(genre)} key={genre}>{genre}</button>
      ))}
      <button onClick={() => updateFilter(null)}>all genres</button>
    </div>
  )
}

export default Books
