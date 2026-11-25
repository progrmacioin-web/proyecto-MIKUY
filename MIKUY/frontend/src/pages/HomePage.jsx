import React, { useState } from 'react';
import FoodCard from '../components/FoodCard';

const PROGRAMAS = [
  {
    icon: '🥗',
    title: 'Rescate y distribución alimentaria',
    desc: 'Canalizamos excedentes aptos de mercados, restaurantes y hoteles cusqueños hacia comedores populares sin intermediarios.',
    action: 'catalog',
  },
  {
    icon: '🍲',
    title: 'Apoyo a comedores populares',
    desc: 'Abastecemos diariamente a organizaciones de Santiago, San Jerónimo, Wanchaq y Poroy según sus necesidades registradas.',
    action: 'map',
  },
  {
    icon: '🏡',
    title: 'Albergues y hogares de acogida',
    desc: 'Priorizamos lotes nutritivos para albergues infantiles y hogares de adultos mayores en situación de vulnerabilidad.',
    action: 'register',
  },
  {
    icon: '📱',
    title: 'Tickets QR y entrega segura',
    desc: 'Emitimos tickets de recojo con código QR y PIN verificable para que el donante valide la identidad de quien recoge.',
    action: 'verify',
  },
];

const HISTORIAS = [
  {
    fecha: 'Noviembre 2026',
    titulo: 'Jornada de rescate en Mercado San Pedro – Cusco',
    resumen: 'Comerciantes aliados canalizaron jabas de papa nativa, arroz y menestras aptas para consumo inmediato.',
    img: '/assets/images/andino-market.svg',
  },
  {
    fecha: 'Octubre 2026',
    titulo: 'Abastecimiento al Comedor Popular Las Flores – Santiago',
    resumen: 'Más de 120 raciones diarias cubiertas mediante reservas directas y validación transparente con pase QR.',
    img: '/assets/images/sharing-hands.svg',
  },
  {
    fecha: 'Septiembre 2026',
    titulo: 'Entrega solidaria al Albergue Buen Camino – San Sebastián',
    resumen: 'Coordinación de verduras frescas y frutas de temporada con cadena de frío verificada por voluntarios.',
    img: '/assets/images/foods/carrot.svg',
  },
  {
    fecha: 'Agosto 2026',
    titulo: 'Alianza con productores en Mercado Vinocanchón – San Jerónimo',
    resumen: 'Reducción de mermas orgánicas rumbo al botadero de Haquira impulsando economía circular en Cusco.',
    img: '/assets/images/cusco-map-art.svg',
  },
];

const ALIADOS = [
  'Mercado San Pedro',
  'Comedor Popular Las Flores',
  'Restaurante Inti',
  'Albergue Buen Camino',
  'Mercado Vinocanchón',
  'Universidad Continental',
];

export default function HomePage({ summary, donations, onNavigate, onToast }) {
  const [contact, setContact] = useState({ name: '', email: '', message: '' });

  function handleContactSubmit(e) {
    e.preventDefault();
    onToast?.('¡Gracias por escribirnos! Tu mensaje fue registrado por el equipo de MIKUY.');
    setContact({ name: '', email: '', message: '' });
  }

  return (
    <div className="mk-landing">
      <section className="mk-hero-ong">
        <div className="mk-container mk-hero-grid">
          <div className="mk-hero-copy">
            <span className="mk-badge-ong">RED SOLIDARIA COMPROMETIDA CON EL CUSCO</span>
            <h1>
              Unimos manos para <em>transformar vidas</em> en el Cusco
            </h1>
            <p className="mk-lead">
              En MIKUY conectamos excedentes alimentarios de comercios locales con comedores
              populares y albergues mediante mensajería interna y tickets QR verificables.
            </p>
            <div className="mk-hero-actions">
              <button type="button" className="mk-btn mk-btn-primary" onClick={() => onNavigate('register')}>
                Donar Ahora
              </button>
              <button type="button" className="mk-btn mk-btn-outline" onClick={() => onNavigate('catalog')}>
                Explorar Catálogo
              </button>
            </div>
            <div className="mk-hero-metrics">
              <div>
                <strong>{summary?.donations_available ?? donations.length}</strong>
                <span>Lotes disponibles</span>
              </div>
              <div>
                <strong>{summary?.available_kg ?? 0} kg</strong>
                <span>Alimentos en red</span>
              </div>
              <div>
                <strong>{summary?.organizations_active ?? 2}</strong>
                <span>Organizaciones activas</span>
              </div>
            </div>
          </div>

          <div className="mk-hero-media">
            <img src="/assets/images/sharing-hands.svg" alt="Manos solidarias compartiendo alimentos en Cusco" />
            {summary?.clima_cusco && (
              <div className="mk-weather-card">
                <strong>Clima Cusco ({summary.clima_cusco.temperatura_c}°C):</strong>{' '}
                {summary.clima_cusco.recomendacion}
              </div>
            )}
          </div>
        </div>
      </section>

      <section id="nosotros" className="mk-band">
        <div className="mk-container mk-split">
          <div className="mk-split-visual">
            <img src="/assets/images/andino-market.svg" alt="Nosotros - MIKUY Cusco" />
          </div>
          <div className="mk-split-copy">
            <span className="mk-eyebrow">¿QUIÉNES SOMOS?</span>
            <h2>Una plataforma que cree en la solidaridad activa</h2>
            <p className="mk-muted">
              MIKUY es una iniciativa tecnológica cusqueña comprometida con la seguridad alimentaria
              (ODS 2) y la reducción del desperdicio de alimentos (ODS 12). Acompañamos a comedores
              populares y albergues impulsando entregas rápidas, seguras y auditables.
            </p>
            <ul className="mk-checklist">
              <li>Compromiso directo con comunidades vulnerables del Cusco</li>
              <li>Tickets de recojo con QR + PIN y validación en tiempo real</li>
              <li>Mensajería directa entre donantes y organizaciones</li>
            </ul>
            <button type="button" className="mk-btn mk-btn-primary" onClick={() => onNavigate('map')}>
              Conoce nuestra red en el mapa
            </button>
          </div>
        </div>
      </section>

      <section id="programas" className="mk-band mk-band-tinted">
        <div className="mk-container">
          <div className="mk-center-head">
            <span className="mk-eyebrow">PROGRAMAS</span>
            <h2>Acciones que transforman realidades</h2>
            <p className="mk-muted">
              Cada eje nace de la necesidad real de los comedores y albergues del Cusco y se sostiene
              gracias a la solidaridad de donantes locales.
            </p>
          </div>
          <div className="mk-grid-4">
            {PROGRAMAS.map((p) => (
              <article key={p.title} className="mk-program-card">
                <span className="mk-program-icon" aria-hidden="true">{p.icon}</span>
                <h3>{p.title}</h3>
                <p className="mk-muted">{p.desc}</p>
                <button type="button" className="mk-link" onClick={() => onNavigate(p.action)}>
                  Ver programa →
                </button>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="mk-band">
        <div className="mk-container">
          <div className="mk-section-head">
            <div>
              <span className="mk-eyebrow">CATÁLOGO EN VIVO · MYSQL</span>
              <h2>Alimentos disponibles ahora en Cusco</h2>
            </div>
            <button type="button" className="mk-btn mk-btn-ghost" onClick={() => onNavigate('catalog')}>
              Ver catálogo completo →
            </button>
          </div>
          <div className="mk-grid-3">
            {donations.slice(0, 3).map((d) => (
              <FoodCard key={d.id} donation={d} />
            ))}
          </div>
        </div>
      </section>

      <section className="mk-band mk-band-tinted">
        <div className="mk-container">
          <div className="mk-center-head">
            <span className="mk-eyebrow">CÓMO AYUDAR</span>
            <h2>Tu ayuda puede cambiar una vida</h2>
          </div>
          <div className="mk-grid-3">
            <article className="mk-help-card">
              <h3>Donar alimentos</h3>
              <p className="mk-muted">
                Publica tus excedentes con fotografía real y valida el Ticket QR al entregar el lote.
              </p>
              <button type="button" className="mk-btn mk-btn-primary" onClick={() => onNavigate('register')}>
                Donar Ahora
              </button>
            </article>
            <article className="mk-help-card">
              <h3>Ser organización receptora</h3>
              <p className="mk-muted">
                Si representas un comedor o albergue, adquiere lotes y obtén tu Ticket QR autorizado al instante.
              </p>
              <button type="button" className="mk-btn mk-btn-outline" onClick={() => onNavigate('register')}>
                Inscribir mi organización
              </button>
            </article>
            <article className="mk-help-card">
              <h3>Ser comercio o empresa aliada</h3>
              <p className="mk-muted">
                Construyamos alianzas con mercados, restaurantes y hoteles para generar impacto social real.
              </p>
              <button type="button" className="mk-btn mk-btn-outline" onClick={() => onNavigate('login')}>
                Quiero ser aliado
              </button>
            </article>
          </div>
        </div>
      </section>

      <section className="mk-band">
        <div className="mk-container mk-split">
          <div className="mk-split-copy">
            <span className="mk-eyebrow">INICIATIVA DESTACADA</span>
            <h2>Tickets de Recojo con Validación QR para Entregas Seguras</h2>
            <p className="mk-muted">
              Al adquirir un alimento, tanto el comedor como el donante reciben el mismo Ticket con QR y
              PIN. El donante puede leer el código desde la web para confirmar que quien recoge está autorizado.
            </p>
            <ul className="mk-checklist">
              <li>Identificación clara de la organización autorizada</li>
              <li>Lectura por cámara o código manual sin apps externas</li>
              <li>Constancia digital descargable en PDF</li>
            </ul>
            <button type="button" className="mk-btn mk-btn-primary" onClick={() => onNavigate('verify')}>
              Probar Validador QR
            </button>
          </div>
          <div className="mk-split-visual">
            <img src="/assets/images/cusco-map-art.svg" alt="Proyecto Trazabilidad QR Cusco" />
          </div>
        </div>
      </section>

      <section className="mk-band mk-band-tinted">
        <div className="mk-container">
          <div className="mk-center-head">
            <span className="mk-eyebrow">NOTICIAS</span>
            <h2>Últimas historias y campañas</h2>
          </div>
          <div className="mk-grid-4">
            {HISTORIAS.map((h) => (
              <article key={h.titulo} className="mk-news-card">
                <div className="mk-news-thumb">
                  <img src={h.img} alt={h.titulo} loading="lazy" />
                </div>
                <div className="mk-news-body">
                  <small className="mk-eyebrow">{h.fecha}</small>
                  <h3>{h.titulo}</h3>
                  <p className="mk-muted">{h.resumen}</p>
                  <button type="button" className="mk-link" onClick={() => onNavigate('catalog')}>
                    Leer más →
                  </button>
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="mk-band">
        <div className="mk-container">
          <div className="mk-center-head">
            <span className="mk-eyebrow">RED LOCAL</span>
            <h2>Nuestros Aliados</h2>
          </div>
          <div className="mk-allies-row">
            {ALIADOS.map((a) => (
              <div key={a} className="mk-ally-pill">{a}</div>
            ))}
          </div>
        </div>
      </section>

      <section className="mk-cta-banner">
        <div className="mk-container mk-cta-inner">
          <h2>Hoy puedes ser parte del cambio</h2>
          <p>Una mano solidaria puede abrir nuevas oportunidades y llevar alimento a quienes más lo necesitan.</p>
          <div className="mk-hero-actions" style={{ justifyContent: 'center' }}>
            <button type="button" className="mk-btn mk-btn-dark" onClick={() => onNavigate('register')}>
              Donar Ahora
            </button>
            <button type="button" className="mk-btn mk-btn-light" onClick={() => onNavigate('catalog')}>
              Ver Alimentos Disponibles
            </button>
          </div>
        </div>
      </section>

      <section id="contacto" className="mk-band">
        <div className="mk-container mk-split">
          <div className="mk-split-copy">
            <span className="mk-eyebrow">CONTACTO</span>
            <h2>¡Consulta cómo podemos ayudarte!</h2>
            <p className="mk-muted">
              Red solidaria cusqueña comprometida con el rescate alimentario, el apoyo a comedores
              populares y la transparencia tecnológica.
            </p>
            <div className="mk-contact-list">
              <div><strong>Correo:</strong> contacto@mikuycusco.org</div>
              <div><strong>Ubicación:</strong> Cusco, Perú</div>
              <div><strong>WhatsApp / Teléfono:</strong> +51 984 000 000</div>
            </div>
          </div>

          <form className="mk-card mk-form" onSubmit={handleContactSubmit}>
            <h3>¿Tienes alguna pregunta? ¡Escríbenos!</h3>
            <label>
              Nombre
              <input required placeholder="Tu nombre o institución" value={contact.name} onChange={(e) => setContact({ ...contact, name: e.target.value })} />
            </label>
            <label>
              Correo electrónico
              <input type="email" required placeholder="tu@correo.com" value={contact.email} onChange={(e) => setContact({ ...contact, email: e.target.value })} />
            </label>
            <label>
              Mensaje (opcional)
              <textarea rows="3" placeholder="Cuéntanos cómo deseas participar o recibir apoyo" value={contact.message} onChange={(e) => setContact({ ...contact, message: e.target.value })} />
            </label>
            <button type="submit" className="mk-btn mk-btn-primary">
              Enviar mensaje
            </button>
          </form>
        </div>
      </section>
    </div>
  );
}
