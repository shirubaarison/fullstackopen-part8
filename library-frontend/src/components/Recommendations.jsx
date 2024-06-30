/* eslint-disable react/prop-types */
import { useQuery } from "@apollo/client"
import { ALL_BOOKS, FAVORITE_GENRE } from "../queries"
import { useState, useEffect } from "react"

const Recommendations = (props) => {
  const result = useQuery(ALL_BOOKS)
  const favoriteGenre = useQuery(FAVORITE_GENRE)
  const [filtered, setFiltered] = useState(null)
  const [genre, setGenre] = useState(null)

  useEffect(() => {
    if (result.data && favoriteGenre.data) {
      const genr = favoriteGenre.data ? favoriteGenre.data.me.favoriteGenre : null
      if (genr) {
        setGenre(genr)
        setFiltered(result.data.allBooks.filter(b => b.genres.includes(genr)))
      }
      
    }
  }, [favoriteGenre.data, result.data]);


  if (result.loading || favoriteGenre.loading)
    return <div>loading...</div>

  if (!props.show) {
    return null
  }


  if (!genre) {
    return (
        <div>
            somehow you dont have a favorite genre....
        </div>
    )
  }

  return (
    <div>
      <h2>Recommendations</h2>
      {genre && <p>books in your favorite genre <strong>{genre}</strong></p>}
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
    </div>
  )
}

export default Recommendations
