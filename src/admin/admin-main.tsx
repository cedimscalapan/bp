import React from 'react';
import { createRoot } from 'react-dom/client';
import { setupIonicReact } from '@ionic/react';
import '@ionic/react/css/core.css';
import '@ionic/react/css/normalize.css';
import '@ionic/react/css/structure.css';
import AdminApp from './AdminApp';

setupIonicReact({ mode: 'md' });
document.title = 'KaPamana Admin';
createRoot(document.getElementById('root')!).render(<React.StrictMode><AdminApp /></React.StrictMode>);
