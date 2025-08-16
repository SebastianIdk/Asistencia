import React, { useEffect, useState, useCallback } from "react";
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
import type { IonInputCustomEvent } from "@ionic/core";
import type { InputInputEventDetail } from "@ionic/core/components";

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

const CONTROL_KEYS = new Set([
  "Backspace",
  "Delete",
  "ArrowLeft",
  "ArrowRight",
  "ArrowUp",
  "ArrowDown",
  "Tab",
  "Home",
  "End",
  "Enter",
  "Escape",
]);

const handleUsernameKeyDown = (e: React.KeyboardEvent) => {
  if (e.ctrlKey || e.metaKey || e.altKey) return;
  const k = e.key;
  if (CONTROL_KEYS.has(k)) return;
  if (!/^[a-z]$/.test(k)) e.preventDefault();
};

const handlePasswordKeyDown = (e: React.KeyboardEvent) => {
  if (e.ctrlKey || e.metaKey || e.altKey) return;
  const k = e.key;
  if (CONTROL_KEYS.has(k)) return;
  if (!/^\d$/.test(k)) e.preventDefault();
};

const handleUsernamePaste = (e: React.ClipboardEvent) => {
  const text = e.clipboardData.getData("text") ?? "";
  if (!/^[a-z]+$/.test(text)) e.preventDefault();
};

const handlePasswordPaste = (e: React.ClipboardEvent) => {
  const text = e.clipboardData.getData("text") ?? "";
  if (!/^\d+$/.test(text)) e.preventDefault();
};

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

  const isUsernameValid = /^[a-z]+$/.test(username);
  const isPasswordValid = /^\d{10}$/.test(password);
  const canSubmit = isUsernameValid && isPasswordValid;

  const handleLogin = useCallback(async () => {
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
  }, [username, password, history, onLogin, present, dismiss]);

  useEffect(() => {
    const onKeyDown = (ev: KeyboardEvent) => {
      if (ev.key === "Enter" && canSubmit) {
        ev.preventDefault();
        handleLogin();
      }
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [canSubmit, handleLogin]);

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
                  onKeyDown={handleUsernameKeyDown}
                  onPaste={handleUsernamePaste}
                  onIonInput={(e: IonInputCustomEvent<InputInputEventDetail>) =>
                    setUsername(e.detail.value?.toString() ?? "")
                  }
                  inputmode="text"
                  autocapitalize="off"
                  autocorrect="off"
                  spellCheck={false}
                  enterkeyhint="go"
                />
              </IonItem>

              <IonItem className="login-item" fill="outline">
                <IonInput
                  type="password"
                  placeholder="Contraseña (cédula)"
                  value={password}
                  onKeyDown={handlePasswordKeyDown}
                  onPaste={handlePasswordPaste}
                  onIonInput={(e: IonInputCustomEvent<InputInputEventDetail>) =>
                    setPassword(e.detail.value?.toString() ?? "")
                  }
                  inputmode="numeric"
                  maxlength={10}
                  enterkeyhint="go"
                />
              </IonItem>

              <IonButton
                type="button"
                expand="block"
                className={`login-button ${canSubmit ? "is-ready" : ""}`}
                onClick={handleLogin}
                disabled={!canSubmit}
              >
                Ingresar
              </IonButton>
            </IonCardContent>
          </IonCard>
        </div>

        <IonToast
          isOpen={showToast}
          message={toastMsg}
          color={"danger"}
          onDidDismiss={() => setShowToast(false)}
          buttons={[{ text: "Cerrar", role: "cancel" }]}
          position="top"
          cssClass="toast-top-right"
          duration={4000}
        />
      </IonContent>
    </IonPage>
  );
};

export default Login;
