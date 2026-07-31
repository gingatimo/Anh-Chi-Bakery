/**
 * StepShell.tsx — khung chung cho một bước câu hỏi trong lúc phục vụ.
 * Khách (bối rối/kiên nhẫn khi sai, không thất vọng) + Mập gợi ý 3 cấp.
 * "Sai không mất gì" — chỉ gợi ý, làm lại.
 */
import type { ReactNode } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { Customer, type CustomerVariant, type CustomerMood } from '../assets/svg/Customer';
import { SpeechBubble } from './kit';
import { MapChar } from './MapChar';

export function StepShell({
  title,
  stepLabel,
  customerVariant,
  customerMood = 'neutral',
  customerSays,
  hint,
  mapMood = 'idle',
  children,
}: {
  title: string;
  stepLabel: string;
  customerVariant: CustomerVariant;
  customerMood?: CustomerMood;
  customerSays: string;
  hint: string | null;
  mapMood?: import('../assets/svg/Map').Mood;
  children: ReactNode;
}) {
  return (
    <div
      style={{
        maxWidth: 940,
        margin: '0 auto',
        padding: '12px 20px 28px',
        display: 'grid',
        gridTemplateColumns: 'minmax(180px, 240px) 1fr',
        gap: 20,
        alignItems: 'start',
      }}
    >
      {/* Cột trái: khách + Mập */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 12, position: 'sticky', top: 12 }}>
        <div style={{ display: 'flex', alignItems: 'flex-start', gap: 6 }}>
          <Customer variant={customerVariant} mood={customerMood} width={112} />
        </div>
        <SpeechBubble>{customerSays}</SpeechBubble>

        <div style={{ marginTop: 6, display: 'flex', alignItems: 'flex-end', gap: 4 }}>
          <MapChar mood={hint ? 'hint' : mapMood} width={104} />
          <AnimatePresence>
            {hint && (
              <motion.div
                key={hint}
                initial={{ scale: 0.7, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.7, opacity: 0 }}
                style={{ flex: 1 }}
              >
                <SpeechBubble>{hint}</SpeechBubble>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* Cột phải: khu tương tác */}
      <div>
        <div style={{ fontSize: 15, color: 'var(--text-soft)', fontWeight: 600, marginBottom: 4 }}>{stepLabel}</div>
        <h2 style={{ fontSize: 26, marginBottom: 18 }}>{title}</h2>
        {children}
      </div>
    </div>
  );
}
