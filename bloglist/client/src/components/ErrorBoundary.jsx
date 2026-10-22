import { Component } from 'react'

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
        <div role="alert">
          <h3>Something went wrong.</h3>
          <p>{this.state.error?.message}</p>
          <button onClick={this.handleReset}>try again</button>
        </div>
      )
    }

    return this.props.children
  }
}

export default ErrorBoundary
