import React, { useState } from 'react';
import { useHistory } from 'react-router-dom';
import {
  IonPage,
  IonHeader,
  IonToolbar,
  IonTitle,
  IonContent,
  IonCard,
  IonCardHeader,
  IonCardTitle,
  IonCardContent,
  IonItem,
  IonInput,
  IonButton,
  IonAvatar,
  IonIcon
} from '@ionic/react';
import { personCircleOutline } from 'ionicons/icons';
import './Login.css';

interface LoginProps {
  onLogin: () => void;
}

const Login: React.FC<LoginProps> = ({ onLogin }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const history = useHistory();

  const handleLogin = () => {
    onLogin();
    history.replace('/tab1');
  };

  return (
    <IonPage>
      <IonHeader>
        <IonToolbar>
          <IonTitle>Iniciar Sesión</IonTitle>
        </IonToolbar>
      </IonHeader>
      <IonContent className="login-content">
        <div className="login-wrapper">
          <IonCard className="login-card">
            <IonCardHeader className="login-header">
              <IonAvatar className="gradient-avatar">
                <IonIcon icon={personCircleOutline} className="avatar-icon" />
              </IonAvatar>
              <IonCardTitle>¡Bienvenido!</IonCardTitle>
            </IonCardHeader>
            <IonCardContent>
              <IonItem className="login-item" fill="outline">
                <IonInput
                  type="email"
                  placeholder="Correo electrónico"
                  value={email}
                  onIonChange={e => setEmail(e.detail.value ?? '')}
                  style={{ '--placeholder-color': '#888888', '--placeholder-opacity': '1' } as React.CSSProperties}
                />
              </IonItem>
              <IonItem className="login-item" fill="outline">
                <IonInput
                  type="password"
                  placeholder="Contraseña"
                  value={password}
                  onIonChange={e => setPassword(e.detail.value ?? '')}
                  style={{ '--placeholder-color': '#888888', '--placeholder-opacity': '1' } as React.CSSProperties}
                />
              </IonItem>
              <IonButton
                expand="block"
                className="login-button"
                onClick={handleLogin}
              >
                Ingresar
              </IonButton>
            </IonCardContent>
          </IonCard>
        </div>
      </IonContent>
    </IonPage>
  );
};

export default Login;
