import { useEffect, useState } from 'react'
import anecdoteService from '../services/anecdotes'

export const useField = (type) => {
  const [value, setValue] = useState('')

  const onChange = (event) => {
    setValue(event.target.value)
  }

  const reset = () => {
    setValue('')
  }

  return {
    value,
    reset,
    inputProps: {
      type,
      value,
      onChange
    }
  }
}

export const useAnecdotes = () => {
  const [anecdotes, setAnecdotes] = useState([])

  useEffect(() => {
    let ignore = false

    anecdoteService.getAll().then(initialAnecdotes => {
      if (!ignore) {
        setAnecdotes(initialAnecdotes)
      }
    })

    return () => {
      ignore = true
    }
  }, [])

  return { anecdotes }
}
