import { Alert } from '@mui/material'
import { useNotificationStore } from '../stores/notificationStore'

const Notification = () => {
  const message = useNotificationStore((state) => state.notification)

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
