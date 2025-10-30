// frontend/src/App.tsx
import { BrowserRouter } from 'react-router-dom';
import { AppRouter } from './presentation/router/AppRouter';
import './index.css';

function App() {
  return (
    <BrowserRouter>
      <AppRouter />
    </BrowserRouter>
  );
}

export default App;