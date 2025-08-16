import React, { useEffect, useMemo, useState } from "react";
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
  IonText,
  IonButtons,
  IonToast,
  useIonLoading,
} from "@ionic/react";
import { logoIonic, logOutOutline } from "ionicons/icons";
import { useHistory } from "react-router-dom";
import type { IonInputCustomEvent } from "@ionic/core";
import type { InputInputEventDetail } from "@ionic/core/components";
import "./Tab1.css";

interface PUCEUser {
  record: string;
  id: string;
  lastnames: string;
  names: string;
  mail: string;
  phone: string;
  user: string;
}

interface Tab1Props {
  onLogout: () => void;
}

const ATTEND_ENDPOINT = "/api-puce/api/examen.php";
const getRandomPos = () => Math.floor(Math.random() * 10) + 1;
const digitsOnly = (s: string) => (s || "").replace(/\D/g, "");

const Tab1: React.FC<Tab1Props> = ({ onLogout }) => {
  const history = useHistory();

  const [pos1, setPos1] = useState<number>(1);
  const [pos2, setPos2] = useState<number>(2);
  const [d1, setD1] = useState<string>("");
  const [d2, setD2] = useState<string>("");

  const [now, setNow] = useState<Date>(new Date());
  const [toastMsg, setToastMsg] = useState("");
  const [toastSuccess, setToastSuccess] = useState(false);
  const [showToast, setShowToast] = useState(false);
  const [present, dismiss] = useIonLoading();

  const currentUser: PUCEUser | null = useMemo(() => {
    try {
      const raw = localStorage.getItem("currentUser");
      return raw ? (JSON.parse(raw) as PUCEUser) : null;
    } catch {
      return null;
    }
  }, []);

  useEffect(() => {
    if (!currentUser) {
      onLogout?.();
      history.replace("/login");
    }
  }, [currentUser, history, onLogout]);

  const regeneratePositions = () => {
    const a = getRandomPos();
    let b = getRandomPos();
    while (b === a) b = getRandomPos();
    setPos1(a);
    setPos2(b);
    setD1("");
    setD2("");
  };

  useEffect(() => {
    regeneratePositions();
  }, []);

  useEffect(() => {
    const t = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(t);
  }, []);

  const pad = (n: number) => String(n).padStart(2, "0");
  const fmtDateTime = (d: Date) => {
    const yyyy = d.getFullYear();
    const mm = pad(d.getMonth() + 1);
    const dd = pad(d.getDate());
    const hh = pad(d.getHours());
    const mi = pad(d.getMinutes());
    const ss = pad(d.getSeconds());
    return `${yyyy}-${mm}-${dd} ${hh}:${mi}:${ss}`;
  };

  const fullName = currentUser
    ? `${currentUser.names ?? ""} ${currentUser.lastnames ?? ""}`.trim()
    : "—";

  const handleLogout = () => {
    onLogout?.();
    history.replace("/login");
  };

  const blockNonDigitKey = (e: React.KeyboardEvent) => {
    const allowed = new Set([
      "Backspace",
      "Tab",
      "ArrowLeft",
      "ArrowRight",
      "Delete",
      "Home",
      "End",
    ]);
    if (allowed.has(e.key)) return;
    if (!/^[0-9]$/.test(e.key)) e.preventDefault();
  };

  const handlePaste =
    (setter: (v: string) => void) => (e: React.ClipboardEvent) => {
      const text = e.clipboardData?.getData("text") ?? "";
      const digit = digitsOnly(text).slice(0, 1);
      e.preventDefault();
      if (digit) setter(digit);
    };

  const onInputD1 = (e: IonInputCustomEvent<InputInputEventDetail>) => {
    const v = e.detail.value ?? "";
    const digit = v.replace(/\D/g, "").slice(0, 1);
    if (digit !== d1) setD1(digit);
  };

  const onInputD2 = (e: IonInputCustomEvent<InputInputEventDetail>) => {
    const v = e.detail.value ?? "";
    const digit = v.replace(/\D/g, "").slice(0, 1);
    if (digit !== d2) setD2(digit);
  };

  const onRegister = async () => {
    if (!currentUser) return;

    const cedula = digitsOnly(currentUser.id);
    if (cedula.length !== 10) {
      setToastSuccess(false);
      setToastMsg("Cédula inválida en el perfil");
      setShowToast(true);
      regeneratePositions();
      return;
    }

    const expected1 = cedula[pos1 - 1];
    const expected2 = cedula[pos2 - 1];

    if (d1 !== expected1 || d2 !== expected2) {
      setToastSuccess(false);
      setToastMsg("Dígitos incorrectos. Se solicitarán nuevas posiciones.");
      setShowToast(true);
      regeneratePositions();
      return;
    }

    try {
      await present({ message: "Registrando asistencia…", spinner: "circles" });

      const body = {
        record_user: Number(currentUser.record),
        join_user: Number(currentUser.record),
      };

      const res = await fetch(ATTEND_ENDPOINT, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });

      const json = await res.json();
      if (!res.ok) throw new Error(json?.error || "Error al registrar asistencia");

      setToastSuccess(true);
      setToastMsg(json?.message || "Asistencia registrada ✅");
      setShowToast(true);
      regeneratePositions();
    } catch (e) {
      const msg =
        e instanceof Error
          ? e.message
          : typeof e === "string"
          ? e
          : "Error de red";
      setToastSuccess(false);
      setToastMsg(msg);
      setShowToast(true);
      regeneratePositions();
    } finally {
      dismiss();
    }
  };

  return (
    <IonPage>
      <IonHeader>
        <IonToolbar color="light" className="tab1-toolbar">
          <IonTitle>Asistencia</IonTitle>
          <IonButtons slot="end">
            <IonButton className="tab1-logout" size="small" onClick={handleLogout}>
              <IonIcon icon={logOutOutline} slot="start" />
              Cerrar sesión
            </IonButton>
          </IonButtons>
        </IonToolbar>
      </IonHeader>

      <IonContent className="tab1-content no-bounce" scrollY={false} forceOverscroll={false}>
        <div className="tab1-wrapper">
          <IonCard className="tab1-card">
            <IonCardHeader className="tab1-header">
              <IonAvatar className="tab1-avatar">
                <IonIcon icon={logoIonic} className="tab1-icon" />
              </IonAvatar>
              <IonText className="tab1-welcome">Bienvenido</IonText>
            </IonCardHeader>

            <IonCardContent>
              <IonText className="tab1-name">{fullName}</IonText>

              <IonText className="tab1-datetime">
                Fecha y hora: {fmtDateTime(now)}
              </IonText>

              <IonText className="tab1-instruction">
                Para registrar su asistencia ingrese los dígitos de su cédula
              </IonText>

              <IonItem className="tab1-item" fill="outline">
                <IonInput
                  type="text"
                  inputmode="numeric"
                  pattern="[0-9]*"
                  maxlength={1}
                  clearOnEdit={false}
                  autocapitalize="off"
                  autocorrect="off"
                  autocomplete="off"
                  spellCheck={false}
                  placeholder="0-9"
                  value={d1}
                  onKeyDown={blockNonDigitKey}
                  onPaste={handlePaste(setD1)}
                  onIonInput={onInputD1}
                  aria-label={`Dígito en posición ${pos1}`}
                />
              </IonItem>
              <IonText className="tab1-pos-hint" style={{ marginTop: 6, display: "block" }}>
                Posición solicitada: {pos1}
              </IonText>

              <IonItem className="tab1-item" fill="outline">
                <IonInput
                  type="text"
                  inputmode="numeric"
                  pattern="[0-9]*"
                  maxlength={1}
                  clearOnEdit={false}
                  autocapitalize="off"
                  autocorrect="off"
                  autocomplete="off"
                  spellCheck={false}
                  placeholder="0-9"
                  value={d2}
                  onKeyDown={blockNonDigitKey}
                  onPaste={handlePaste(setD2)}
                  onIonInput={onInputD2}
                  aria-label={`Dígito en posición ${pos2}`}
                />
              </IonItem>
              <IonText className="tab1-pos-hint" style={{ marginTop: 6, display: "block" }}>
                Posición solicitada: {pos2}
              </IonText>

              <IonButton expand="block" className="tab1-button" onClick={onRegister}>
                Registrar
              </IonButton>
            </IonCardContent>
          </IonCard>
        </div>

        <IonToast
          isOpen={showToast}
          message={toastMsg}
          color={toastSuccess ? "success" : "danger"}
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

export default Tab1;
