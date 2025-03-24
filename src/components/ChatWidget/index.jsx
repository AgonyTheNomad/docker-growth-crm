import React, { useState, useEffect, useRef } from 'react';
import { Box, TextField, Button, Typography, List, ListItem, IconButton, Paper } from '@mui/material';
import ChatIcon from '@mui/icons-material/Chat';

// Custom CloseIcon component
export const CloseIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="icon">
    <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
  </svg>
);

const ChatWidget = () => {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [isOpen, setIsOpen] = useState(false);
  const ws = useRef(null);
  const reconnectAttempts = useRef(0);

  const initializeWebSocket = () => {
    ws.current = new WebSocket(`ws://02zx7bj4-8001.usw2.devtunnels.ms/ws/chat?client_id=${Date.now()}`);

    ws.current.onopen = () => {
      console.log('WebSocket connected');
      reconnectAttempts.current = 0;
    };

    ws.current.onmessage = (event) => {
      const newMessages = [...messages, { text: event.data, sender: 'bot' }];
      setMessages(newMessages);
    };

    ws.current.onerror = (error) => {
      console.error('WebSocket error:', error);
    };

    ws.current.onclose = (event) => {
      console.log('WebSocket closed:', event);
      if (event.code !== 1000 && reconnectAttempts.current < 5) { // Try reconnecting up to 5 times
        setTimeout(() => {
          reconnectAttempts.current += 1;
          initializeWebSocket();
        }, 5000);
      }
    };
  };

  useEffect(() => {
    if (isOpen) {
      initializeWebSocket();
      return () => {
        ws.current.close();
      };
    }
  }, [isOpen]);

  const handleSendMessage = () => {
    if (input.trim() && ws.current && ws.current.readyState === WebSocket.OPEN) {
      const newMessages = [...messages, { text: input, sender: 'user' }];
      setMessages(newMessages);
      ws.current.send(input);
      setInput('');
    } else {
      console.error('WebSocket is not open.');
    }
  };

  const handleKeyPress = (event) => {
    if (event.key === 'Enter') {
      event.preventDefault();
      handleSendMessage();
    }
  };

  return (
    <Box sx={{ position: 'fixed', bottom: 16, right: 16, zIndex: 1000 }}>
      <IconButton 
        onClick={() => setIsOpen(!isOpen)} 
        sx={{ 
          backgroundColor: 'primary.main', 
          color: 'white', 
          width: 60, 
          height: 60, 
          boxShadow: 6, 
          borderRadius: '50%', 
          border: '3px solid #fff' 
        }}>
        {isOpen ? <CloseIcon sx={{ fontSize: 30 }} /> : <ChatIcon sx={{ fontSize: 30 }} />}
      </IconButton>
      {isOpen && (
        <Paper sx={{
          width: 350,
          height: 500,
          backgroundColor: 'white',
          boxShadow: 6,
          borderRadius: 2,
          padding: 2,
          display: 'flex',
          flexDirection: 'column',
          border: '1px solid #ccc',
        }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 2, position: 'relative' }}>
            <Typography variant="h6" gutterBottom sx={{ color: 'primary.main', fontWeight: 'bold' }}>
              Cyberbacker
            </Typography>
            <IconButton onClick={() => setIsOpen(false)} sx={{ 
              color: 'primary.main',
              position: 'absolute',
              right: 0, 
              top: 0,
            }}>
              <CloseIcon sx={{ fontSize: 30 }} />
            </IconButton>
          </Box>
          <List sx={{ flexGrow: 1, overflowY: 'auto', paddingBottom: 2 }}>
            {messages.map((message, index) => (
              <ListItem key={index} sx={{ justifyContent: message.sender === 'user' ? 'flex-end' : 'flex-start' }}>
                <Box sx={{ 
                  maxWidth: '75%', 
                  padding: 1, 
                  borderRadius: 2, 
                  backgroundColor: message.sender === 'user' ? '#e0e0e0' : '#f0f0f0',
                  border: '1px solid',
                  borderColor: message.sender === 'user' ? '#bdbdbd' : '#cfcfcf',
                  wordBreak: 'break-word'
                }}>
                  <Typography sx={{ 
                    color: message.sender === 'user' ? 'black' : 'gray'
                  }}>
                    {message.text}
                  </Typography>
                </Box>
              </ListItem>
            ))}
          </List>
          <Box sx={{ display: 'flex', gap: 1, marginTop: 2, alignItems: 'center' }}>
            <TextField
              fullWidth
              variant="outlined"
              multiline
              minRows={1}
              maxRows={4}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Type a message"
              sx={{ backgroundColor: 'white' }}
              inputProps={{ style: { color: 'black' } }}
              onKeyPress={handleKeyPress}
            />
            <Button 
              variant="contained" 
              onClick={handleSendMessage} 
              sx={{ 
                minWidth: '80px', 
                backgroundColor: 'primary.main', 
                color: 'white',
                '&:hover': {
                  backgroundColor: 'primary.dark',
                }
              }}
            >
              Send
            </Button>
          </Box>
        </Paper>
      )}
    </Box>
  );
};

export default ChatWidget;
