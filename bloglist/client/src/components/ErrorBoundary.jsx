import { Component } from 'react'
import { Alert, AlertTitle, Box, Button } from '@mui/material'

class ErrorBoundary extends Component {
  constructor(props) {
    super(props)
    this.state = { hasError: false, error: null }
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error }
  }

  componentDidCatch(error, info) {
    console.error('ErrorBoundary caught an error:', error, info.componentStack)
  }

  handleReset = () => {
    this.setState({ hasError: false, error: null })
  }

  render() {
    if (this.state.hasError) {
      return (
        <Box sx={{ display: 'flex', justifyContent: 'center', mt: 8 }}>
          <Alert
            severity="error"
            sx={{ maxWidth: 600, width: '100%' }}
            action={
              <Button color="inherit" size="small" onClick={this.handleReset}>
                try again
              </Button>
            }
          >
            <AlertTitle>Something went wrong.</AlertTitle>
            {this.state.error?.message}
          </Alert>
        </Box>
      )
    }

    return this.props.children
  }
}

export default ErrorBoundary
