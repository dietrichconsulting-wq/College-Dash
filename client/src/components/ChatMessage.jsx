export default function ChatMessage({ message }) {
  const isUser = message.role === 'user';

  return (
    <div className={`flex ${isUser ? 'justify-end' : 'justify-start'} mb-3`}>
      <div className={`max-w-[85%] px-4 py-2.5 rounded-2xl text-sm leading-relaxed ${
        isUser
          ? 'bg-navy text-white rounded-br-md'
          : 'bg-gray-100 text-text rounded-bl-md'
      }`}>
        {message.content}
      </div>
    </div>
  );
}
