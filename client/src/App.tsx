import React, { useState } from 'react';
import { Redirect, Route } from 'react-router-dom';
import {
  IonApp,
  IonRouterOutlet,
  IonTabs,
  IonTabBar,
  IonTabButton,
  IonIcon,
  IonLabel,
  setupIonicReact
} from '@ionic/react';
import { IonReactRouter } from '@ionic/react-router';
import { funnel, grid } from 'ionicons/icons';

import Login from './pages/Login';
import Tab1 from './pages/Tab1';
import Tab2 from './pages/Tab2';

setupIonicReact();

const App: React.FC = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  return (
    <IonApp>
      <IonReactRouter>
        {!isAuthenticated ? (
          // Rutas públicas: solo /login, todo lo demás redirige ahí
          <IonRouterOutlet>
            <Route exact path="/login">
              <Login onLogin={() => setIsAuthenticated(true)} />
            </Route>
            <Route render={() => <Redirect to="/login" />} />
          </IonRouterOutlet>
        ) : (
          // Rutas privadas: tabs completas
          <IonTabs>
            <IonRouterOutlet>
              <Route exact path="/tab1">
                <Tab1 />
              </Route>
              <Route exact path="/tab2">
                <Tab2 />
              </Route>

              {/* Si hacen “/” dentro de tabs, los mando a tab1 */}
              <Route exact path="/">
                <Redirect to="/tab1" />
              </Route>
            </IonRouterOutlet>

            <IonTabBar slot="bottom">
              <IonTabButton tab="tab1" href="/tab1">
                <IonIcon icon={funnel} />
                <IonLabel>Registro</IonLabel>
              </IonTabButton>
              <IonTabButton tab="tab2" href="/tab2">
                <IonIcon icon={grid} />
                <IonLabel>Asistencia</IonLabel>
              </IonTabButton>
            </IonTabBar>
          </IonTabs>
        )}
      </IonReactRouter>
    </IonApp>
  );
};

export default App;
