import React, { Component } from "react";

export class ErrorBoundary extends Component {
  constructor(props) {
    super(props);

    this.state = {
      error: false,
    };
  }

  componentDidCatch(error, info) {
    console.log(error);
    console.log(info);
  }

  static getDerivedStateFromError(error) {
    return {
      error: true,
    };
  }

  render() {
    const { error } = this.state;
    if (error) {
      return (
        <div>
          Something went wrong please contact the administrator or check your
          inputs
        </div>
      );
    }
    return this.props.children;
  }
}

export default ErrorBoundary;
