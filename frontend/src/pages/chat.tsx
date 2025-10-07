import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { CirclePlus, MessageCirclePlus } from "lucide-react";
import ChatUser from "@/components/Chat/ChatUser";
import { useAuthStore } from "@/store/auth.store";
import { useChatStore } from "@/store/chat.store";
import GroupModal from "@/components/modals/NewGroupModal";
import { Loader } from "@/components/ui/loader";
import ChatTopbar from "@/components/Chat/ChatTopbar";
import ProfileModal from "@/components/modals/ProfileModal";
import UpdateGroupModal from "@/components/modals/UpdateGroupModal";
import ChatWindow from "@/components/Chat/ChatWindow";

const ChatPage = () => {
  const { user } = useAuthStore();
  const {
    chats,
    fetchChats,
    isLoading,
    error,
    selectedChat,
    setSelectedChat,
  } = useChatStore();

  const [isGroupModalOpen, setIsGroupModalOpen] = useState(false);
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);
  const [isUpdateGroupModalOpen, setIsUpdateGroupModalOpen] = useState(false);

  // Fetch chats when user loads
  useEffect(() => {
    if (user) fetchChats();
  }, [user, fetchChats]);

  const handleOpenDetails = () => {
    if (!selectedChat) return;
    if (selectedChat.isGroupChat) {
      setIsUpdateGroupModalOpen(true);
    } else {
      setIsProfileModalOpen(true);
    }
  };

  return (
    <div className="h-[92vh] w-screen px-16 pt-6 overflow-hidden">
      <div className="flex h-full flex-row gap-4">
        {/* Sidebar */}
        <div className="w-2/6 h-[85vh] bg-white rounded-md shadow-sm flex flex-col">
          {/* Sidebar Header */}
          <div className="flex items-center justify-between mt-1 py-2 px-6 flex-shrink-0 border-b-2 border-primary rounded-xl">
            <h1 className="text-2xl font-medium my-auto">My Chats</h1>
            <Button
              variant="simple"
              className="bg-secondary hover:bg-secondary/80 gap-2"
              onClick={() => setIsGroupModalOpen(true)}
            >
              <span>New Group</span>
              <CirclePlus size={18} />
            </Button>
          </div>

          {/* Chats Section */}
          <div className="flex-1 overflow-y-auto pr-1 custom-scrollbar">
            {isLoading && (
              <div className="flex h-full items-center justify-center">
                <Loader size={60} />
              </div>
            )}
            {error && <p className="text-red-500 flex justify-center mt-[50%] p-5 text-center">{error}</p>}
            {!isLoading && !error && (
              <ChatUser
                chats={chats ?? []}
                selectedChat={selectedChat}
                onSelectChat={setSelectedChat}
              />
            )}
          </div>
        </div>

        {/* Main Chat Window */}
        <div className="flex-1 max-h-[85vh] bg-white rounded-md shadow-sm flex flex-col">
          {selectedChat ? (
            <>
              <ChatTopbar chat={selectedChat} onOpenProfile={handleOpenDetails} />
              <ChatWindow chatId={selectedChat._id} currentUser={user} />
            </>
          ) : (
            <div className="flex flex-col items-center justify-center h-full space-y-4">
              <p className="text-2xl text-gray-500">Select a chat to start messaging</p>
              <MessageCirclePlus className="text-gray-400" size={80} />
            </div>
          )}
        </div>
      </div>

      {/* Group Modal */}
      <GroupModal
        isOpen={isGroupModalOpen}
        onClose={() => setIsGroupModalOpen(false)}
      />

      {/* Profile Modal */}
      <ProfileModal
        chat={selectedChat}
        isOpen={isProfileModalOpen}
        onClose={() => setIsProfileModalOpen(false)}
      />

      {/* Update Group Modal */}
      <UpdateGroupModal
        chat={selectedChat}
        isOpen={isUpdateGroupModalOpen}
        onClose={() => setIsUpdateGroupModalOpen(false)}
      />
    </div>
  );
};

export default ChatPage;
