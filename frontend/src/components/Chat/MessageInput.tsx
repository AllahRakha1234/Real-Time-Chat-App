import { useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { SendHorizonal } from "lucide-react";
import { Input } from "@/components/ui/input";

interface MessageInputProps {
  onSend: (content: string) => void;
  onTyping?: () => void;
  onStopTyping?: () => void;
}

const MessageInput = ({ onSend, onTyping, onStopTyping }: MessageInputProps) => {
  const [message, setMessage] = useState("");
  const typingTimeoutRef = useRef<NodeJS.Timeout | null>(null);


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


  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setMessage(e.target.value);

    // Notify typing
    if (onTyping) onTyping();

    // Debounce stop typing after 1.5s of inactivity
    if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
    typingTimeoutRef.current = setTimeout(() => {
      if (onStopTyping) onStopTyping();
    }, 1500);
  };

  return (
    <div className="flex items-center w-full gap-3 px-3 py-2 bg-white">
      {/* direct flex child — must grow/shrink */}
      <div className="flex-1 min-w-0">
        <Input
          type="text"
          placeholder="Type a message..."
          value={message}
          onChange={handleChange}
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