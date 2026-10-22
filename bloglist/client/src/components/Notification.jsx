import { Alert } from '@mui/material'

const Notification = ({ message }) => {
  if (!message) {
    return null
  }

  return (
    <Alert severity={message.type} style={{ marginTop: 10, marginBottom: 10 }}>
      {message.text}
    </Alert>
  )
}

export default Notification
