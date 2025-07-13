// .../pages/_app.js
import "@/styles/globals.css";
import { AuthProvider } from '../context/AuthContext'; // 引入 AuthProvider

export default function App({ Component, pageProps }) {
  return (
    <AuthProvider>
      <Component {...pageProps} />
    </AuthProvider>
  );
}