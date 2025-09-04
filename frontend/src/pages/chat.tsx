import { Loader } from "@/components/ui/loader";
import React, { useEffect } from "react";
import toast from "react-hot-toast";

const ChatPage = () => {
  useEffect(() => {
    // toast.error("hi")
    toast.success("Welcom to chat page.")

  }, [])

  return (
    <div className="h-[93vh] w-[100vw]">
      <h1>ChatPage</h1>
    </div>
  );
};

export default ChatPage;
