import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { Button, Box, Typography, Paper } from '@mui/material';
import { BugReport, Refresh } from '@mui/icons-material';

class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { 
      hasError: false, 
      error: null,
      errorInfo: null 
    };
  }

  static getDerivedStateFromError(error) {
    // Update state so the next render will show the fallback UI
    return { hasError: true };
  }

  componentDidCatch(error, errorInfo) {
    // Log the error to an error reporting service
    console.error('ErrorBoundary caught an error:', error, errorInfo);
    this.setState({
      error,
      errorInfo
    });
  }

  handleReset = () => {
    this.setState({
      hasError: false,
      error: null,
      errorInfo: null
    });
    
    // Optionally, you can add a callback to reset the application state
    if (this.props.onReset) {
      this.props.onReset();
    }
  };

  render() {
    if (this.state.hasError) {
      return (
        <Box 
          display="flex" 
          flexDirection="column" 
          alignItems="center" 
          justifyContent="center" 
          minHeight="60vh"
          p={3}
        >
          <Paper elevation={3} sx={{ p: 4, maxWidth: '600px', width: '100%' }}>
            <Box textAlign="center" mb={3}>
              <BugReport color="error" sx={{ fontSize: 60 }} />
              <Typography variant="h4" component="h1" gutterBottom>
                Oops! Something went wrong.
              </Typography>
              <Typography variant="body1" color="textSecondary" paragraph>
                We're sorry, but an unexpected error occurred. Our team has been notified.
              </Typography>
              
              {process.env.NODE_ENV === 'development' && this.state.error && (
                <Box 
                  mt={3} 
                  p={2} 
                  bgcolor="#f8f8f8" 
                  borderRadius={1} 
                  textAlign="left"
                  sx={{ overflowX: 'auto' }}
                >
                  <Typography variant="subtitle2" color="error" gutterBottom>
                    {this.state.error.toString()}
                  </Typography>
                  <Typography variant="caption" component="pre" sx={{ whiteSpace: 'pre-wrap' }}>
                    {this.state.errorInfo?.componentStack}
                  </Typography>
                </Box>
              )}
              
              <Box mt={4} display="flex" justifyContent="center" gap={2}>
                <Button
                  variant="contained"
                  color="primary"
                  startIcon={<Refresh />}
                  onClick={this.handleReset}
                >
                  Try Again
                </Button>
                <Button
                  variant="outlined"
                  color="primary"
                  onClick={() => window.location.reload()}
                >
                  Reload Page
                </Button>
                {this.props.homePath && (
                  <Button
                    variant="text"
                    color="primary"
                    onClick={() => window.location.href = this.props.homePath}
                  >
                    Go to Home
                  </Button>
                )}
              </Box>
            </Box>
          </Paper>
        </Box>
      );
    }

    return this.props.children;
  }
}

ErrorBoundary.propTypes = {
  children: PropTypes.node.isRequired,
  onReset: PropTypes.func,
  homePath: PropTypes.string
};

export default ErrorBoundary;
