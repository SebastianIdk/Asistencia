import React, { useEffect, useMemo, useState } from 'react';
import {
  IonPage,
  IonHeader,
  IonToolbar,
  IonTitle,
  IonContent,
  IonText,
  IonToast,
  useIonLoading,
} from '@ionic/react';
import './Tab2.css';

interface PUCEUser {
  record: string;
  id: string;
  lastnames: string;
  names: string;
  mail: string;
  phone: string;
  user: string;
}

interface AttendRow {
  record: number;
  date: string;      // "YYYY-MM-DD"
  time: string;      // "HH:mm:ss"
  join_date: string; // "YYYY-MM-DD HH:mm:ss"
}

const ENDPOINT_BASE = '/api-puce/api/examen.php';

const dayNameEs = (isoDate: string) => {
  try {
    const d = new Date(isoDate + 'T00:00:00');
    const fmt = new Intl.DateTimeFormat('es-EC', { weekday: 'long' });
    const name = fmt.format(d);
    return name.charAt(0).toUpperCase() + name.slice(1);
  } catch {
    return '—';
  }
};

const parseDateTime = (date: string, time: string) => new Date(`${date}T${time}`);

const pad2 = (n: number) => String(n).padStart(2, '0');
const formatHMS = (secs: number) => {
  const h = Math.floor(secs / 3600);
  const m = Math.floor((secs % 3600) / 60);
  const s = secs % 60;
  return `${pad2(h)}:${pad2(m)}:${pad2(s)}`;
};

type DecoratedRow = AttendRow & {
  weekday: string;
  expected?: string;     // "HH:mm:ss" si aplica
  novelty: string;       // "HH:mm:ss Atraso" o "A tiempo"
  isLate: boolean;
};

const Tab2: React.FC = () => {
  const [filter, setFilter] = useState('');
  const [rows, setRows] = useState<DecoratedRow[]>([]);
  const [toast, setToast] = useState<{ open: boolean; msg: string; ok: boolean }>({ open: false, msg: '', ok: true });
  const [present, dismiss] = useIonLoading();

  const currentUser: PUCEUser | null = useMemo(() => {
    try {
      const raw = localStorage.getItem('currentUser');
      return raw ? (JSON.parse(raw) as PUCEUser) : null;
    } catch {
      return null;
    }
  }, []);

  const decorate = (list: AttendRow[]): DecoratedRow[] => {
    return list.map((r) => {
      const weekday = dayNameEs(r.date); // “Miércoles”, “Sábado”, etc.
      let expected: string | undefined;
      if (weekday.toLowerCase().startsWith('sá')) expected = '08:00:00';     // sábado
      if (weekday.toLowerCase().startsWith('mié')) expected = '17:00:00';    // miércoles

      let isLate = false;
      let novelty = 'A tiempo';

      if (expected) {
        const actual = parseDateTime(r.date, r.time).getTime();
        const expectedTs = parseDateTime(r.date, expected).getTime();
        const diffSec = Math.max(0, Math.floor((actual - expectedTs) / 1000));
        if (diffSec > 0) {
          isLate = true;
          novelty = `${formatHMS(diffSec)} Atraso`;
        }
      }

      return { ...r, weekday, expected, novelty, isLate };
    });
  };

  useEffect(() => {
    const fetchRows = async () => {
      if (!currentUser?.record) return;
      try {
        await present({ message: 'Cargando registros…', spinner: 'circles' });
        const url = `${ENDPOINT_BASE}?record=${encodeURIComponent(currentUser.record)}`;
        const res = await fetch(url);
        if (!res.ok) throw new Error('No se pudieron obtener los registros');
        const data = (await res.json()) as AttendRow[];
        const decorated = decorate(Array.isArray(data) ? data : []);
        // Opcional: ordenar por fecha+hora asc
        decorated.sort((a, b) => (a.date + a.time).localeCompare(b.date + b.time));
        setRows(decorated);
      } catch (e) {
        const msg = e instanceof Error ? e.message : 'Error de red';
        setToast({ open: true, msg, ok: false });
      } finally {
        await dismiss(); // ✅ asegura que el loader se cierre
      }
    };
    fetchRows();
  }, [currentUser, present, dismiss]);

  const fullUser = currentUser
    ? `${currentUser.lastnames} ${currentUser.names}`.toUpperCase()
    : '—';

  const filtered = useMemo(() => {
    const q = filter.trim().toLowerCase();
    if (!q) return rows;
    return rows.filter(r =>
      r.date.toLowerCase().includes(q) ||
      r.time.toLowerCase().includes(q) ||
      (r.expected ?? '').toLowerCase().includes(q) ||
      r.novelty.toLowerCase().includes(q) ||
      r.weekday.toLowerCase().includes(q)
    );
  }, [rows, filter]);

  return (
    <IonPage>
      <IonHeader>
        <IonToolbar>
          <IonTitle>Registros</IonTitle>
        </IonToolbar>
      </IonHeader>
      <IonContent className="tab2-content">
        <div className="tab2-wrapper">
          <div className="tab2-filter-group">
            <IonText>Filtrar:</IonText>
            <input
              type="text"
              className="tab2-filter"
              placeholder="Buscar por fecha, día u hora…"
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
            />
          </div>

          <div className="tab2-table-container">
            <table className="tab2-table">
              <thead>
                <tr>
                  <th>Usuario</th>
                  <th>Día</th>
                  <th>Fecha</th>
                  <th>Hora de Registro</th>
                  <th>Hora de Entrada</th>
                  <th>Novedad</th>
                </tr>
              </thead>
              <tbody>
                {filtered.length === 0 ? (
                  <tr>
                    <td colSpan={6}>
                      <IonText>No hay registros.</IonText>
                    </td>
                  </tr>
                ) : (
                  filtered.map((r, i) => (
                    <tr key={`${r.record}-${i}`} className={r.isLate ? 'tab2-row-late' : ''}>
                      <td className="tab2-user">{fullUser}</td>
                      <td>{r.weekday}</td>
                      <td>{r.date}</td>
                      <td>{r.time}</td>
                      <td>{r.expected ?? '—'}</td>
                      <td className={r.isLate ? 'tab2-late' : 'tab2-ontime'}>
                        {r.novelty}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        <IonToast
          isOpen={toast.open}
          message={toast.msg}
          duration={2200}
          color={toast.ok ? 'success' : 'danger'}
          onDidDismiss={() => setToast({ ...toast, open: false })}
        />
      </IonContent>
    </IonPage>
  );
};

export default Tab2;
