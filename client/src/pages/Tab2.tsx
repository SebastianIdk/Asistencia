import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  IonPage,
  IonHeader,
  IonToolbar,
  IonTitle,
  IonContent,
  IonText,
  IonToast,
  IonLoading,
  IonDatetime,
  IonDatetimeButton,
  IonModal,
  IonButtons,
  IonButton,
  IonIcon,
  useIonViewDidEnter,
  useIonViewDidLeave,
} from '@ionic/react';
import { refreshOutline } from 'ionicons/icons';
import type { DatetimeChangeEventDetail, IonDatetimeCustomEvent } from '@ionic/core';
import './Tab2.css';
import { API_EXAMEN } from '../api';
import { apiGet } from '../apiClient';

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
  date: string;
  time: string;
  join_date: string;
}

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

const adjustTimeMinusOneHour = (time: string) => {
  try {
    const [hours, minutes, seconds] = time.split(':').map(Number);
    const date = new Date();
    date.setHours(hours, minutes, seconds || 0);
    date.setHours(date.getHours() - 1);
    return `${pad2(date.getHours())}:${pad2(date.getMinutes())}:${pad2(date.getSeconds())}`;
  } catch {
    return time;
  }
};

type DecoratedRow = AttendRow & {
  weekday: string;
  expected?: string;
  novelty: string;
  isLate: boolean;
  outOfSchedule: boolean;
  displayTime: string;
};

const toYMD = (iso: string) => {
  const i = iso.indexOf('T');
  return i > 0 ? iso.slice(0, i) : iso;
};

const getCurrentYMD = () => {
  const now = new Date();
  return now.toISOString().split('T')[0];
};

const getCurrentYearMonth = () => {
  const now = new Date();
  return now.toISOString().slice(0, 7);
};

const getCurrentYear = () => {
  const now = new Date();
  return now.getFullYear().toString();
};

type FilterMode = 'all' | 'day' | 'month' | 'year';

const isAttendRow = (obj: unknown): obj is AttendRow => {
  if (typeof obj !== 'object' || obj === null) return false;
  const o = obj as Record<string, unknown>;
  return typeof o.record === 'number' && typeof o.date === 'string' && typeof o.time === 'string';
};

const isAttendArray = (x: unknown): x is AttendRow[] =>
  Array.isArray(x) && x.every(isAttendRow);

const hasDataAttendArray = (x: unknown): x is { data: AttendRow[] } =>
  typeof x === 'object' &&
  x !== null &&
  isAttendArray((x as { data?: unknown }).data);

const Tab2: React.FC = () => {
  const [rows, setRows] = useState<DecoratedRow[]>([]);
  const [loading, setLoading] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [toast, setToast] = useState<{ open: boolean; msg: string; ok: boolean }>({
    open: false, msg: '', ok: true
  });
  const [mode, setMode] = useState<FilterMode>('all');
  const [selDay, setSelDay] = useState<string | null>(null);
  const [selMonth, setSelMonth] = useState<string | null>(null);
  const [selYear, setSelYear] = useState<string | null>(null);
  const hasFilter = mode !== 'all' && (selDay || selMonth || selYear);
  const [pageSize, setPageSize] = useState<number>(10);
  const [page, setPage] = useState<number>(1);

  const currentUser: PUCEUser | null = useMemo(() => {
    try {
      const raw = localStorage.getItem('currentUser');
      return raw ? (JSON.parse(raw) as PUCEUser) : null;
    } catch {
      return null;
    }
  }, []);

  const decorate = (list: AttendRow[]): DecoratedRow[] =>
    list.map((r) => {
      const weekday = dayNameEs(r.date);
      const lw = weekday.toLowerCase();
      let expected: string | undefined;
      if (lw.startsWith('mié')) expected = '17:00:00';
      else if (lw.startsWith('sá')) expected = '08:00:00';
      let isLate = false;
      let novelty = 'A tiempo';
      let outOfSchedule = false;
      const displayTime = adjustTimeMinusOneHour(r.time);
      if (!expected) {
        novelty = 'Fuera de horario';
        outOfSchedule = true;
      } else {
        const actual = parseDateTime(r.date, r.time).getTime();
        const expectedTs = parseDateTime(r.date, expected).getTime();
        const diffSec = Math.max(0, Math.floor((actual - expectedTs) / 1000));
        if (diffSec > 0) {
          isLate = true;
          novelty = `${formatHMS(diffSec)} Atraso`;
        }
      }
      return { ...r, weekday, expected, novelty, isLate, outOfSchedule, displayTime };
    });

  const refetch = useCallback(async (showSpinner = false, showToast = false) => {
    if (!currentUser?.record) return;
    if (showSpinner) setLoading(true);
    setIsRefreshing(true);
    try {
      const res = await apiGet<AttendRow[] | { data: AttendRow[] }>(API_EXAMEN, {
        record: String(currentUser.record),
        t: Date.now(),
      });
      let base: AttendRow[] = [];
      if (isAttendArray(res)) base = res;
      else if (hasDataAttendArray(res)) base = res.data;
      const decorated = decorate(base);
      decorated.sort((a, b) => (a.date + a.time).localeCompare(b.date + b.time));
      setRows(decorated);
      
      if (showToast) {
        setToast({ open: true, msg: 'Registros actualizados', ok: true });
      }
    } catch (e) {
      setToast({ open: true, msg: e instanceof Error ? e.message : 'Error de red', ok: false });
    } finally {
      if (showSpinner) setLoading(false);
      setIsRefreshing(false);
    }
  }, [currentUser?.record]);

  const handleManualRefresh = () => {
    refetch(false, true);
  };

  useEffect(() => {
    refetch(true, false);
  }, [refetch]);

  const POLL_MS = 20000;
  const timerRef = useRef<number | null>(null);

  const startPolling = useCallback(() => {
    if (timerRef.current) return;
    timerRef.current = window.setInterval(() => refetch(false, false), POLL_MS) as unknown as number;
  }, [refetch]);

  const stopPolling = useCallback(() => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
  }, []);

  useIonViewDidEnter(startPolling);
  useIonViewDidLeave(stopPolling);

  useEffect(() => stopPolling, [stopPolling]);

  useEffect(() => {
    const onUpdated = () => refetch(false, true);
    window.addEventListener('attendance:updated', onUpdated);
    return () => window.removeEventListener('attendance:updated', onUpdated);
  }, [refetch]);

  const fullUser = currentUser
    ? `${(currentUser.lastnames || '').toUpperCase()} ${(currentUser.names || '').toUpperCase()}`.trim()
    : '—';

  const filtered = useMemo(() => {
    if (mode === 'all') return rows;
    if (mode === 'day' && selDay)     return rows.filter(r => r.date === selDay);
    if (mode === 'month' && selMonth) return rows.filter(r => r.date.slice(0, 7) === selMonth);
    if (mode === 'year' && selYear)   return rows.filter(r => r.date.slice(0, 4) === selYear);
    return rows;
  }, [rows, mode, selDay, selMonth, selYear]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / pageSize));
  const safePage = Math.min(Math.max(1, page), totalPages);
  useEffect(() => { if (page !== safePage) setPage(safePage); }, [safePage, page]);

  const pageStart = (safePage - 1) * pageSize;
  const pageRows = filtered.slice(pageStart, pageStart + pageSize);
  const showingFrom = filtered.length === 0 ? 0 : pageStart + 1;
  const showingTo = Math.min(filtered.length, pageStart + pageSize);

  const handleDayFilter = () => {
    const today = getCurrentYMD();
    setMode('day');
    setSelDay(today);
    setPage(1);
  };

  const handleMonthFilter = () => {
    const currentMonth = getCurrentYearMonth();
    setMode('month');
    setSelMonth(currentMonth);
    setPage(1);
  };

  const handleYearFilter = () => {
    const currentYear = getCurrentYear();
    setMode('year');
    setSelYear(currentYear);
    setPage(1);
  };

  const onDayChanged = (e: IonDatetimeCustomEvent<DatetimeChangeEventDetail>) => {
    const v = e.detail.value; if (!v) return;
    const ymd = Array.isArray(v) ? toYMD(v[0]) : toYMD(String(v));
    setSelDay(ymd); setMode('day'); setPage(1);
  };
  const onMonthChanged = (e: IonDatetimeCustomEvent<DatetimeChangeEventDetail>) => {
    const v = e.detail.value; if (!v) return;
    const ymd = Array.isArray(v) ? toYMD(v[0]) : toYMD(String(v));
    setSelMonth(ymd.slice(0, 7)); setMode('month'); setPage(1);
  };
  const onYearChanged = (e: IonDatetimeCustomEvent<DatetimeChangeEventDetail>) => {
    const v = e.detail.value; if (!v) return;
    const iso = Array.isArray(v) ? String(v[0]) : String(v);
    setSelYear(iso.slice(0, 4)); setMode('year'); setPage(1);
  };

  const clearFilter = () => {
    setMode('all'); setSelDay(null); setSelMonth(null); setSelYear(null); setPage(1);
  };

  return (
    <IonPage>
      <IonHeader>
        <IonToolbar color="light">
          <IonTitle>Registros</IonTitle>
          <IonButtons slot="end">
            <IonButton 
              fill="clear" 
              onClick={handleManualRefresh}
              disabled={isRefreshing}
              title="Actualizar registros"
            >
              <IonIcon 
                icon={refreshOutline} 
                className={isRefreshing ? 'refresh-spinning' : ''} 
              />
            </IonButton>
          </IonButtons>
        </IonToolbar>
      </IonHeader>
      <IonContent className="tab2-content">
        <div className="tab2-wrapper">
          <div className="tab2-filter-group">
            <IonText className="tab2-filter-label">Filtrar por:</IonText>
            <div className="filter-modes">
              <button
                type="button"
                className={`btn-pill ${mode === 'day' ? 'primary selected' : 'ghost'}`}
                onClick={handleDayFilter}
                aria-pressed={mode === 'day'}
              >Día</button>
              <button
                type="button"
                className={`btn-pill ${mode === 'month' ? 'primary selected' : 'ghost'}`}
                onClick={handleMonthFilter}
                aria-pressed={mode === 'month'}
              >Mes</button>
              <button
                type="button"
                className={`btn-pill ${mode === 'year' ? 'primary selected' : 'ghost'}`}
                onClick={handleYearFilter}
                aria-pressed={mode === 'year'}
              >Año</button>
              <button
                type="button"
                className={`btn-pill ${mode === 'all' ? 'primary selected' : 'ghost'}`}
                onClick={clearFilter}
                disabled={mode === 'all'}
                aria-pressed={mode === 'all'}
                title="Ver todos"
              >Todos</button>
              <button
                type="button"
                className={`btn-pill ${hasFilter ? 'primary' : 'ghost'}`}
                onClick={clearFilter}
                disabled={!hasFilter}
                title="Quitar filtro"
              >Quitar filtro</button>
            </div>
            <div className="date-trigger-wrap">
              <IonDatetimeButton datetime="filter-day"   className={`date-trigger ${mode === 'day' ? '' : 'hidden'}`} />
              <IonDatetimeButton datetime="filter-month" className={`date-trigger ${mode === 'month' ? '' : 'hidden'}`} />
              <IonDatetimeButton datetime="filter-year"  className={`date-trigger ${mode === 'year' ? '' : 'hidden'}`} />
            </div>
            <IonModal keepContentsMounted={true}>
              <IonDatetime
                id="filter-day"
                presentation="date"
                locale="es-EC"
                firstDayOfWeek={1}
                showDefaultButtons
                doneText="Aplicar"
                cancelText="Cancelar"
                value={selDay ?? undefined}
                onIonChange={onDayChanged}
              />
            </IonModal>
            <IonModal keepContentsMounted={true}>
              <IonDatetime
                id="filter-month"
                presentation="month-year"
                locale="es-EC"
                firstDayOfWeek={1}
                showDefaultButtons
                doneText="Aplicar"
                cancelText="Cancelar"
                value={selMonth ? `${selMonth}-01` : undefined}
                onIonChange={onMonthChanged}
              />
            </IonModal>
            <IonModal keepContentsMounted={true}>
              <IonDatetime
                id="filter-year"
                presentation="year"
                locale="es-EC"
                showDefaultButtons
                doneText="Aplicar"
                cancelText="Cancelar"
                value={selYear ? `${selYear}-01-01` : undefined}
                onIonChange={onYearChanged}
              />
            </IonModal>
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
                {pageRows.length === 0 ? (
                  <tr><td colSpan={6}><IonText>No hay registros.</IonText></td></tr>
                ) : (
                  pageRows.map((r, i) => (
                    <tr
                      key={`${r.record}-${(pageStart + i)}`}
                      className={r.outOfSchedule ? 'tab2-row-off' : (r.isLate ? 'tab2-row-late' : '')}
                    >
                      <td className="tab2-user" data-label="Usuario">
                        {fullUser}
                      </td>
                      <td data-label="Día">{r.weekday}</td>
                      <td data-label="Fecha">{r.date}</td>
                      <td data-label="Hora de Registro">{r.displayTime}</td>
                      <td data-label="Hora de Entrada">{r.expected ?? '—'}</td>
                      <td data-label="Novedad" className="tab2-novelty">
                        <span className={`chip ${r.outOfSchedule ? 'chip-warn' : r.isLate ? 'chip-danger' : 'chip-success'}`}>
                          {r.novelty}
                        </span>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          <div className="tab2-pagination">
            <div className="pag-info">
              Mostrando <strong>{showingFrom}</strong>–<strong>{showingTo}</strong> de <strong>{filtered.length}</strong>
            </div>
            <div className="pag-controls">
              <button
                type="button"
                className="btn-pill ghost"
                onClick={() => setPage(p => Math.max(1, p - 1))}
                disabled={safePage <= 1}
              >◀ Anterior</button>
              <span className="pag-page">Página {safePage} de {totalPages}</span>
              <button
                type="button"
                className="btn-pill ghost"
                onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                disabled={safePage >= totalPages}
              >Siguiente ▶</button>
            </div>
            <div className="pag-size">
              <label>Por página:</label>
              <select
                value={pageSize}
                onChange={(e) => { const n = Number(e.target.value); setPageSize(n); setPage(1); }}
              >
                <option value={10}>10</option>
                <option value={20}>20</option>
                <option value={50}>50</option>
              </select>
            </div>
          </div>
        </div>

        <IonLoading isOpen={loading} message="Cargando registros…" spinner="circles" />
        <IonToast
          isOpen={toast.open}
          message={toast.msg}
          color={toast.ok ? 'success' : 'danger'}
          onDidDismiss={() => setToast({ ...toast, open: false })}
          buttons={[{ text: 'Cerrar', role: 'cancel' }]}
          position="top"
          cssClass="toast-top-right"
          duration={4000}
        />
      </IonContent>
    </IonPage>
  );
};

export default Tab2;