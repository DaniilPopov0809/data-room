import { Button } from "@/components/ui/button"
import React, { Component, type ReactNode } from "react"
import { AlertTriangle, RefreshCw, Home } from "lucide-react"

interface ErrorBoundaryProps {
  children: ReactNode
}

interface ErrorBoundaryState {
  hasError: boolean
  error: Error | null
}

class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props)
    this.state = { hasError: false, error: null }
  }

  static getDerivedStateFromError(error: Error) {
    return { hasError: true, error }
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo): void {
    console.error("ErrorBoundary caught an error", error, errorInfo)
  }

  handleReset = () => {
    this.setState({ hasError: false, error: null })
    window.location.href = "/"
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-svh w-full flex flex-col items-center justify-center bg-background text-foreground p-6">
          <div className="max-w-md w-full text-center space-y-6 bg-card p-8 rounded-[28px] shadow-sm border border-border">
            <div className="mx-auto flex size-16 items-center justify-center rounded-2xl bg-destructive/10 text-destructive animate-pulse">
              <AlertTriangle className="size-8" />
            </div>

            <div className="space-y-2">
              <h1 className="text-2xl font-semibold tracking-tight text-foreground">
                Something went wrong
              </h1>
              <p className="text-sm leading-relaxed">
                An unexpected error occurred in the application. You can try reloading the page or returning to the workspace.
              </p>
              {this.state.error && (
                <pre className="mt-4 p-3 bg-destructive/10 rounded-lg text-left text-xs font-mono text-destructive max-h-32 overflow-auto border border-destructive/20">
                  {this.state.error.message || String(this.state.error)}
                </pre>
              )}
            </div>

            <div className="flex flex-col sm:flex-row gap-3 pt-2">
              <Button
                variant="outline"
                className="flex-1 min-h-6"
                onClick={() => window.location.reload()}
              >
                <RefreshCw className="size-4" />
                Reload Page
              </Button>
              <Button
                className="flex-1 min-h-6"
                onClick={this.handleReset}
              >
                <Home className="size-4" />
                Go to Workspace
              </Button>
            </div>
          </div>
        </div>
      )
    }

    return this.props.children
  }
}

export default ErrorBoundary