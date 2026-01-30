import React from 'react';

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  componentDidCatch(error, errorInfo) {
    console.error('ErrorBoundary caught:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div style={{ padding: '2rem', textAlign: 'center' }}>
          <h2>เกิดข้อผิดพลาด</h2>
          <p>กรุณาลองใหม่อีกครั้ง</p>
          <button onClick={() => window.location.reload()} style={{ padding: '0.5rem 1rem', fontSize: '1rem', cursor: 'pointer' }}>
            โหลดใหม่
          </button>
        </div>
      );
    }
    return this.props.children;
  }
}

export default ErrorBoundary;
