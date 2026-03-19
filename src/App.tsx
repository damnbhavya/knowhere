import AuthGuard from '@/components/AuthGuard';
import Chat from '@/pages/Chat';

export default function App() {
  return (
    <AuthGuard>
      <Chat />
    </AuthGuard>
  );
}
