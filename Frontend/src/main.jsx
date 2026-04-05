import { createRoot } from 'react-dom/client'
import './app/index.css'
import App from './app/App.jsx'
import { store } from './app/app.store.js'
import { Provider } from 'react-redux'

createRoot(document.getElementById('root')).render(
    <Provider store={store}>
      <App />
    </Provider>
)


console.log("🔥 APP LOADED");
console.log("ENV:", import.meta.env);
