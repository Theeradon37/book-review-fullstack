'use client';

// แสดงดาว (อ่านอย่างเดียว) เช่น 4.0 -> ★★★★☆
export function Stars({ value = 0 }) {
  const full = Math.round(value);
  return (
    <span className="stars" aria-label={`${value.toFixed(1)} out of 5`}>
      {[1, 2, 3, 4, 5].map((n) => (
        <span key={n} className={n <= full ? 'star on' : 'star'}>
          ★
        </span>
      ))}
    </span>
  );
}

// ช่องให้ผู้ใช้คลิกเลือกดาว 1-5
export function StarInput({ value, onChange }) {
  return (
    <span className="stars input" role="radiogroup" aria-label="Rating">
      {[1, 2, 3, 4, 5].map((n) => (
        <button
          type="button"
          key={n}
          role="radio"
          aria-checked={n === value}
          aria-label={`${n} star${n > 1 ? 's' : ''}`}
          className={n <= value ? 'star on' : 'star'}
          onClick={() => onChange(n)}
        >
          ★
        </button>
      ))}
    </span>
  );
}

