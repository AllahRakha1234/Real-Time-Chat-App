import { useState } from "react";
import { Button } from "@/components/ui/button";
import { SendHorizonal } from "lucide-react";
import { Input } from "@/components/ui/input";

interface MessageInputProps {
  onSend: (content: string) => void;
}

const MessageInput = ({ onSend }: MessageInputProps) => {
  const [message, setMessage] = useState("");

  const handleSend = () => {
    if (!message.trim()) return;
    onSend(message);
    setMessage("");
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className="flex items-center w-full gap-3 px-3 py-2 bg-white">
      {/* direct flex child — must grow/shrink */}
      <div className="flex-1 min-w-0">
        <Input
          type="text"
          placeholder="Type a message..."
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          onKeyDown={handleKeyDown}
          className="w-full"        
        />
      </div>

      {/* don't let the button grow — keep it visible on small screens */}
      <Button
        onClick={handleSend}
        className="flex-shrink-0 whitespace-nowrap"
      >
        <SendHorizonal size={18} />
        <span className="ml-1">Send</span>
      </Button>
    </div>
  );
};

export default MessageInput;