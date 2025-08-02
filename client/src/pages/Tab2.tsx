import React from 'react';
import {
  IonPage,
  IonHeader,
  IonToolbar,
  IonTitle,
  IonContent,
  IonText
} from '@ionic/react';
import './Tab2.css';

const records = [
  {
    user: 'Márquez Muñoz\nGabriel Sebastián',
    day: 'Miércoles',
    date: '2025-04-30',
    registered: '18:22:39',
    expected: '17:00:00',
    novelty: '01:22:39 Atraso'
  },
  {
    user: 'Márquez Muñoz\nGabriel Sebastián',
    day: 'Sábado',
    date: '2025-05-03',
    registered: '08:08:14',
    expected: '08:00:00',
    novelty: '00:08:14 Atraso'
  },
  {
    user: 'Márquez Muñoz\nGabriel Sebastián',
    day: 'Miércoles',
    date: '2025-05-07',
    registered: '17:22:10',
    expected: '17:00:00',
    novelty: '00:22:10 Atraso'
  },
  {
    user: 'Márquez Muñoz\nGabriel Sebastián',
    day: 'Sábado',
    date: '2025-05-10',
    registered: '08:05:41',
    expected: '08:00:00',
    novelty: '00:05:41 Atraso'
  }
];

const Tab2: React.FC = () => (
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
          <input type="text" className="tab2-filter" placeholder="Buscar..." />
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
              {records.map((r, i) => (
                <tr key={i} className="tab2-row-tardy">
                  <td className="tab2-user">
                    {r.user.split('\n').map((line, idx) => (
                      <React.Fragment key={idx}>
                        {line}
                        <br />
                      </React.Fragment>
                    ))}
                  </td>
                  <td>{r.day}</td>
                  <td>{r.date}</td>
                  <td>{r.registered}</td>
                  <td>{r.expected}</td>
                  <td>{r.novelty}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </IonContent>
  </IonPage>
);

export default Tab2;