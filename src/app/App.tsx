import { HelmetProvider } from "react-helmet-async";
import { AppRouter } from "./routes/AppRouter";
import "./styles/App.css";
import "tailwindcss";

function App() {
  return (
    <HelmetProvider>
      <AppRouter />
    </HelmetProvider>
  );
}

export default App;
