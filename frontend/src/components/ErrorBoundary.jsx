import React from "react";

export default class ErrorBoundary extends React.Component {
  constructor(props){
    super(props);
    this.state = { hasError: false, error: null, info: null };
  }
  static getDerivedStateFromError(error){ return { hasError: true, error }; }
  componentDidCatch(error, info){
    console.error("UI Crash:", error, info);
    this.setState({ info });
  }
  render(){
    if (this.state.hasError){
      return (
        <div className="p-6">
          <h1 className="text-xl font-semibold mb-2">A runtime error occurred in this view.</h1>
          <pre className="text-sm bg-gray-100 p-3 rounded overflow-auto">{String(this.state.error)}</pre>
          {this.state.info?.componentStack ? (
            <pre className="text-xs bg-gray-50 p-3 rounded mt-2 overflow-auto">{this.state.info.componentStack}</pre>
          ) : null}
        </div>
      );
    }
    return this.props.children;
  }
}
