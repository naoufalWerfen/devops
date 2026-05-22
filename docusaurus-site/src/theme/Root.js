import React from 'react';
import ChatBot from '@site/src/components/ChatBot/ChatBot';

// Wrap the entire site with the ChatBot widget
export default function Root({ children }) {
  return (
    <>
      {children}
      <ChatBot />
    </>
  );
}
