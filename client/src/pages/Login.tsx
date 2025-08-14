import React, { useEffect, useState } from "react";
import { useHistory } from "react-router-dom";
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
  IonIcon,
  IonToast,
  useIonLoading,
} from "@ionic/react";
import { personCircleOutline } from "ionicons/icons";
import "./Login.css";

interface LoginProps {
  onLogin: () => void;
}

interface PUCEUser {
  record: string;
  id: string;
  lastnames: string;
  names: string;
  mail: string;
  phone: string;
  user: string;
}

const ENDPOINT = "/api-puce/api/examen.php";

const normalize = (s: string) => (s || "").trim().toLowerCase();
const digitsOnly = (s: string) => (s || "").replace(/\D/g, "");
const isCedula10 = (s: string) => /^\d{10}$/.test(s);

function getErrorMessage(err: unknown): string {
  if (err instanceof Error) return err.message;
  if (typeof err === "string") return err;
  return "Error de red";
}

const Login: React.FC<LoginProps> = ({ onLogin }) => {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [toastMsg, setToastMsg] = useState("");
  const [showToast, setShowToast] = useState(false);
  const [present, dismiss] = useIonLoading();
  const history = useHistory();

  useEffect(() => {
    const raw = localStorage.getItem("currentUser");
    if (raw) {
      onLogin?.();
      history.replace("/tab1");
    }
  }, [history, onLogin]);

  const handleLogin = async () => {
    const userNorm = normalize(username);
    const passDigits = digitsOnly(password);

    if (!userNorm) {
      setToastMsg("Ingresa tu usuario");
      setShowToast(true);
      return;
    }
    if (!passDigits) {
      setToastMsg("Ingresa tu cédula como contraseña");
      setShowToast(true);
      return;
    }
    if (!isCedula10(passDigits)) {
      setToastMsg("La cédula debe tener 10 dígitos");
      setShowToast(true);
      return;
    }

    try {
      await present({ message: "Verificando usuario…", spinner: "circles" });

      const res = await fetch(ENDPOINT);
      if (!res.ok) throw new Error("No se pudo consultar el listado");

      const data = (await res.json()) as PUCEUser[];
      const clean = (data || []).filter((u) => u && u.user && u.id);

      const candidates = clean.filter((u) => normalize(u.user) === userNorm);

      if (candidates.length === 0) {
        setToastMsg("Usuario no autorizado.");
        setShowToast(true);
        return;
      }

      const picked =
        candidates.find((u) => digitsOnly(u.id) === passDigits) ??
        candidates.find((u) => digitsOnly(u.id).length === 10) ??
        candidates[0];

      const cedulaEndpoint = digitsOnly(picked.id);
      if (cedulaEndpoint !== passDigits) {
        setToastMsg("Contraseña incorrecta");
        setShowToast(true);
        return;
      }

      localStorage.setItem("currentUser", JSON.stringify(picked));
      onLogin?.();
      history.replace("/tab1");
    } catch (err: unknown) {
      setToastMsg(getErrorMessage(err));
      setShowToast(true);
    } finally {
      dismiss();
    }
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
                  type="text"
                  placeholder="Usuario"
                  value={username}
                  onIonChange={(e) => setUsername(String(e.detail.value ?? ""))}
                  style={
                    {
                      "--placeholder-color": "#888888",
                      "--placeholder-opacity": "1",
                    } as React.CSSProperties
                  }
                />
              </IonItem>
              <IonItem className="login-item" fill="outline">
                <IonInput
                  type="password"
                  placeholder="Contraseña (cédula)"
                  value={password}
                  onIonChange={(e) => setPassword(String(e.detail.value ?? ""))}
                  style={
                    {
                      "--placeholder-color": "#888888",
                      "--placeholder-opacity": "1",
                    } as React.CSSProperties
                  }
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

        <IonToast
          isOpen={showToast}
          message={toastMsg}
          duration={2200}
          color={toastMsg.toLowerCase().includes("error") ? "danger" : "danger"}
          onDidDismiss={() => setShowToast(false)}
        />
      </IonContent>
    </IonPage>
  );
};

export default Login;
