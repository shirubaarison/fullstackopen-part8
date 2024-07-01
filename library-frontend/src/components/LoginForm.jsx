/* eslint-disable react/prop-types */
import { useMutation } from '@apollo/client'
import { useEffect, useState } from 'react'
import { LOGIN } from '../queries'

const LoginForm = (props) => {
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')

    const [ login, result ] = useMutation(LOGIN, {
        onError: (error) => {
            console.log(error)
        }
    })

    useEffect(() => {
        if (result.data) {
            const token = result.data.login.value
            props.setToken(token)
            localStorage.setItem('library-user-token', token)
        }
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [result.data])


  const submit = async (event) => {
    event.preventDefault()

    login({ variables: { username, password } })

    setUsername('')
    setPassword('')

    props.setPage('authors')
  }

  if (!props.show) {
    return null
  }

  return (
    <div>
      <form onSubmit={submit}>
        <div>
          username
          <input
            value={username}
            onChange={({ target }) => setUsername(target.value)}
          />
        </div>
        <div>
          password
          <input
            type='password'
            value={password}
            onChange={({ target }) => setPassword(target.value)}
          />
        </div>
        <button type="submit">login</button>
      </form>
    </div>
  )
}

export default LoginForm