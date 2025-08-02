import React, { useState, useEffect } from 'react';
import {
  IonPage,
  IonHeader,
  IonToolbar,
  IonTitle,
  IonContent,
  IonCard,
  IonCardHeader,
  IonCardContent,
  IonAvatar,
  IonIcon,
  IonItem,
  IonInput,
  IonButton,
  IonText
} from '@ionic/react';
import { logoIonic } from 'ionicons/icons';
import './Tab1.css';

const getRandomDigit = () => Math.floor(Math.random() * 10) + 1;

const Tab1: React.FC = () => {
  const [placeholder1, setPlaceholder1] = useState<string>('…');
  const [placeholder2, setPlaceholder2] = useState<string>('…');

  useEffect(() => {
    const first = getRandomDigit();
    let second = getRandomDigit();
    while (second === first) {
      second = getRandomDigit();
    }
    setPlaceholder1(first.toString());
    setPlaceholder2(second.toString());
  }, []);

  return (
    <IonPage>
      <IonHeader>
        <IonToolbar>
          <IonTitle>Asistencia</IonTitle>
        </IonToolbar>
      </IonHeader>
      <IonContent className="tab1-content">
        <div className="tab1-wrapper">
          <IonCard className="tab1-card">
            <IonCardHeader className="tab1-header">
              <IonAvatar className="tab1-avatar">
                <IonIcon icon={logoIonic} className="tab1-icon" />
              </IonAvatar>
              <IonText className="tab1-welcome">Bienvenido</IonText>
            </IonCardHeader>
            <IonCardContent>
              <IonText className="tab1-name">Gabriel Sebastián Márquez Muñoz</IonText>
              <IonText className="tab1-datetime">
                Fecha y hora: 2025-08-02 09:38:06
              </IonText>
              <IonText className="tab1-instruction">
                Para registrar su asistencia ingrese los dígitos de su cédula
              </IonText>
              <IonItem className="tab1-item" fill="outline">
                <IonInput
                  placeholder={placeholder1}
                />
              </IonItem>
              <IonItem className="tab1-item" fill="outline">
                <IonInput
                  placeholder={placeholder2}
                />
              </IonItem>
              <IonButton expand="block" className="tab1-button">
                Registrar
              </IonButton>
            </IonCardContent>
          </IonCard>
        </div>
      </IonContent>
    </IonPage>
  );
};

export default Tab1;