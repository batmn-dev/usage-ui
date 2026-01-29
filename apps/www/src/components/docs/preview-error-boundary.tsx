"use client";

import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { AlertCircle } from "lucide-react";
import * as React from "react";

interface PreviewErrorBoundaryProps {
  children: React.ReactNode;
}

interface PreviewErrorBoundaryState {
  hasError: boolean;
  error?: Error;
}

export class PreviewErrorBoundary extends React.Component<
  PreviewErrorBoundaryProps,
  PreviewErrorBoundaryState
> {
  constructor(props: PreviewErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): PreviewErrorBoundaryState {
    return { hasError: true, error };
  }

  render() {
    if (this.state.hasError) {
      return (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Preview Error</AlertTitle>
          <AlertDescription>
            Failed to render component preview.
            {this.state.error && (
              <pre className="mt-2 text-xs">{this.state.error.message}</pre>
            )}
          </AlertDescription>
        </Alert>
      );
    }

    return this.props.children;
  }
}
