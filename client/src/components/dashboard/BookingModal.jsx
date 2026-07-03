import { useState } from 'react';
import { HiOutlineX, HiOutlineCalendar, HiOutlineCheck, HiOutlineChevronLeft, HiOutlineChevronRight } from 'react-icons/hi';
import './BookingModal.css';

const MONTHS = ['January','February','March','April','May','June','July','August','September','October','November','December'];
const DAYS   = ['Sun','Mon','Tue','Wed','Thu','Fri','Sat'];

// Generate some fake available dates (next 30 days, skip weekends randomly)
const generateAvailableDates = () => {
  const dates = new Set();
  const today = new Date();
  for (let i = 1; i <= 30; i++) {
    const d = new Date(today);
    d.setDate(today.getDate() + i);
    const dow = d.getDay();
    if (dow === 0 || dow === 6) continue; // skip weekends
    if (Math.random() > 0.35) dates.add(d.toDateString());
  }
  return dates;
};

const AVAILABLE = generateAvailableDates();

const TIME_SLOTS = ['09:00 AM', '10:30 AM', '12:00 PM', '02:00 PM', '03:30 PM', '05:00 PM'];

const BookingModal = ({ plan, onClose }) => {
  const today = new Date();
  const [year,  setYear]  = useState(today.getFullYear());
  const [month, setMonth] = useState(today.getMonth());
  const [selectedDate, setSelectedDate] = useState(null);
  const [selectedTime, setSelectedTime] = useState(null);
  const [booked, setBooked] = useState(false);

  // Calendar helpers
  const firstDay = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();

  const prevMonth = () => {
    if (month === 0) { setMonth(11); setYear(y => y - 1); }
    else setMonth(m => m - 1);
    setSelectedDate(null);
    setSelectedTime(null);
  };
  const nextMonth = () => {
    if (month === 11) { setMonth(0); setYear(y => y + 1); }
    else setMonth(m => m + 1);
    setSelectedDate(null);
    setSelectedTime(null);
  };

  const isAvailable = (day) => {
    const d = new Date(year, month, day);
    return d > today && AVAILABLE.has(d.toDateString());
  };

  const isToday = (day) => {
    const d = new Date(year, month, day);
    return d.toDateString() === today.toDateString();
  };

  const handleDayClick = (day) => {
    if (!isAvailable(day)) return;
    setSelectedDate(new Date(year, month, day));
    setSelectedTime(null);
  };

  const handleBook = () => {
    if (!selectedDate || !selectedTime) return;
    setBooked(true);
  };

  const formatDate = (d) =>
    d.toLocaleDateString('en-IN', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });

  return (
    <div className="booking-overlay" onClick={onClose}>
      <div className="booking-modal" onClick={e => e.stopPropagation()}>
        {/* Header */}
        <div className="booking-header">
          <div>
            <p className="booking-plan-label">Booking session for</p>
            <h2 className="booking-plan-name">{plan.name}</h2>
            <p className="booking-plan-price">{plan.price}<span>/session</span></p>
          </div>
          <button className="booking-close" onClick={onClose}><HiOutlineX /></button>
        </div>

        {booked ? (
          /* ===== SUCCESS STATE ===== */
          <div className="booking-success">
            <div className="booking-success-icon">
              <HiOutlineCheck />
            </div>
            <h3>Session Booked!</h3>
            <p className="booking-success-msg">
              <strong>{plan.name}</strong> on{' '}
              <strong>{formatDate(selectedDate)}</strong> at{' '}
              <strong>{selectedTime}</strong>
            </p>
            <p className="booking-success-sub">
              A confirmation will be sent to your registered email address. Our team will reach out with session details shortly.
            </p>
            <button className="btn btn-primary" style={{ marginTop: 24, width: '100%' }} onClick={onClose}>
              Done
            </button>
          </div>
        ) : (
          /* ===== BOOKING FORM ===== */
          <div className="booking-body">
            {/* Calendar */}
            <div className="booking-calendar">
              <div className="cal-nav">
                <button className="cal-nav-btn" onClick={prevMonth}><HiOutlineChevronLeft /></button>
                <span className="cal-month-label">{MONTHS[month]} {year}</span>
                <button className="cal-nav-btn" onClick={nextMonth}><HiOutlineChevronRight /></button>
              </div>

              <div className="cal-days-header">
                {DAYS.map(d => <span key={d}>{d}</span>)}
              </div>

              <div className="cal-grid">
                {/* empty cells before first day */}
                {Array.from({ length: firstDay }).map((_, i) => (
                  <div key={`empty-${i}`} className="cal-cell empty" />
                ))}
                {/* day cells */}
                {Array.from({ length: daysInMonth }, (_, i) => i + 1).map(day => {
                  const available = isAvailable(day);
                  const today_    = isToday(day);
                  const selected  = selectedDate &&
                    selectedDate.getDate() === day &&
                    selectedDate.getMonth() === month &&
                    selectedDate.getFullYear() === year;

                  return (
                    <div
                      key={day}
                      className={[
                        'cal-cell',
                        available ? 'available' : 'unavailable',
                        today_ ? 'today' : '',
                        selected ? 'selected' : '',
                      ].join(' ')}
                      onClick={() => handleDayClick(day)}
                    >
                      {day}
                      {available && <span className="cal-dot" />}
                    </div>
                  );
                })}
              </div>

              <div className="cal-legend">
                <span><span className="legend-dot available" />Available</span>
                <span><span className="legend-dot unavailable" />Unavailable</span>
              </div>
            </div>

            {/* Time slots */}
            {selectedDate && (
              <div className="booking-times">
                <p className="times-heading">
                  <HiOutlineCalendar />
                  {formatDate(selectedDate)}
                </p>
                <p className="times-sub">Select a time slot</p>
                <div className="time-slots">
                  {TIME_SLOTS.map(t => (
                    <button
                      key={t}
                      className={`time-slot ${selectedTime === t ? 'selected' : ''}`}
                      onClick={() => setSelectedTime(t)}
                    >
                      {t}
                    </button>
                  ))}
                </div>

                {selectedTime && (
                  <button className="btn btn-primary" style={{ width: '100%', marginTop: 20 }} onClick={handleBook}>
                    Confirm Booking
                  </button>
                )}
              </div>
            )}

            {!selectedDate && (
              <div className="booking-hint">
                <HiOutlineCalendar style={{ fontSize: 32, color: 'var(--indigo)', opacity: 0.4 }} />
                <p>Select an available date from the calendar to choose a time slot.</p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default BookingModal;
