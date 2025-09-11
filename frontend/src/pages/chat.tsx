import { useState } from "react";
import { Button } from "@/components/ui/button";
import { CirclePlus, MessageCirclePlus } from "lucide-react";
import ChatUser from "@/components/Chat/ChatUser";
import { useChatStore } from "@/store/chat.store";
import GroupModal from "@/components/modals/NewGroupModal";
import { Loader } from "@/components/ui/loader";

const ChatPage = () => {
  const { chats, isLoading, error } = useChatStore();
  const [isGroupModalOpen, setIsGroupModalOpen] = useState(false); // modal state

  return (
    <div className="h-[92vh] w-screen px-16 pt-6 overflow-hidden">
      <div className="flex h-full flex-row gap-4">
        {/* Sidebar */}
        <div className="w-2/6 h-[85vh] bg-white p-3 rounded-md shadow-sm flex flex-col">
          {/* Sidebar Header */}
          <div className="flex items-center justify-between mb-4 flex-shrink-0">
            <h1 className="text-2xl font-medium my-auto">My Chats</h1>
            <Button
              className="bg-secondary hover:bg-secondary/80 gap-2"
              onClick={() => setIsGroupModalOpen(true)} // ✅ open modal
            >
              <span>New Group</span>
              <CirclePlus size={18} />
            </Button>
          </div>

          {/* Chats Section (scrollable only for users) */}
          <div className="flex-1 overflow-y-auto pr-1 custom-scrollbar">
            {isLoading && <div className="flex h-full items-center justify-center">
              <Loader />
            </div>}
            {error && <p className="text-red-500">{error}</p>}
            {!isLoading && !error && (
              <ChatUser chats={chats ?? []} isLoading={isLoading} error={error} />
            )}
          </div>
        </div>

        {/* Main Chat Window */}
        <div className="flex-1 h-[85vh] bg-white rounded-md shadow-sm flex items-center justify-center">
          <div>
            <p className="text-2xl text-gray-500">Select a chat to start messaging</p>
            <p className="flex justify-center">
              <MessageCirclePlus className="text-gray-400" size={80} />
            </p>
          </div>
        </div>
      </div>

      {/* Group Modal */}
      <GroupModal
        isOpen={isGroupModalOpen}
        onClose={() => setIsGroupModalOpen(false)}
      />
    </div>
  );
};

export default ChatPage;
