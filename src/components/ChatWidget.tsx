import React, { useEffect } from 'react';

interface ChatWidgetProps {
  intellisyncId?: string;
  serverUrl?: string;
}

const ChatWidget: React.FC<ChatWidgetProps> = ({ 
  intellisyncId = "JmKENjszo8z63AUUL9i7", 
  serverUrl = "https://intellisync-server-fbc47e09b67b.herokuapp.com/chatbot-embed.js" 
}) => {
  useEffect(() => {
    // Create script element
    const script = document.createElement('script');
    script.src = serverUrl;
    script.setAttribute('data-intellisync-id', intellisyncId);
    script.defer = true;
    script.type = 'module';

    // Append script to body
    document.body.appendChild(script);

    // Cleanup function to remove script when component unmounts
    return () => {
      document.body.removeChild(script);
    };
  }, [serverUrl, intellisyncId]);

  return (
    <div 
      id="intellisync-chat" 
      className="fixed bottom-4 right-4 z-50 w-80 h-96"
    >
      {/* Chat widget container */}
    </div>
  );
};

export default ChatWidget;
