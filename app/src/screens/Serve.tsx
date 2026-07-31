/** Serve — điều phối các bước phục vụ một khách; chọn UI theo q.mode. */
import { useEffect } from 'react';
import { useGame } from '../game/store';
import { sfx } from '../ui/sfx';
import { ChooseNote } from './steps/ChooseNote';
import { BakeTray } from './steps/BakeTray';
import { Register } from './steps/Register';
import { ChangeTray } from './steps/ChangeTray';

export function Serve() {
  const plan = useGame((s) => s.plan);
  const beatIndex = useGame((s) => s.beatIndex);
  const stepIndex = useGame((s) => s.stepIndex);
  const dayResult = useGame((s) => s.dayResult);
  const customer = useGame((s) => s.currentCustomer());
  const step = useGame((s) => s.currentStep());
  const complete = useGame((s) => s.completeStep);

  // chuông cửa khi sang khách mới
  useEffect(() => {
    if (customer && stepIndex === 0) sfx.bell();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [customer?.id]);

  if (!plan || !customer || !step) return null;

  const served = plan.beats.slice(0, beatIndex + 1).filter((b) => b.kind === 'customer').length;
  const isLast = served === dayResult.total;

  const common = {
    q: step.q,
    stepLabel: `Khách ${served}/${dayResult.total} · ${step.label}`,
    customerVariant: customer.variant,
    customerSays: customer.wants,
    onDone: (firstTry: boolean) => complete(firstTry),
  };
  const key = `${customer.id}-${stepIndex}`;

  return (
    <div style={{ paddingTop: 8 }}>
      {isLast && stepIndex === 0 && (
        <div style={{ textAlign: 'center', color: 'var(--rose-dark)', fontWeight: 700, marginBottom: 4 }}>
          Khách cuối hôm nay rồi nhé!
        </div>
      )}
      {step.q.mode === 'choose' && <ChooseNote key={key} {...common} />}
      {step.q.mode === 'tray-drag' && (
        <BakeTray key={key} {...common} cake={customer.orderCakes[0] ?? 'cupcake'} />
      )}
      {step.q.mode === 'keypad' && <Register key={key} {...common} />}
      {step.q.mode === 'money-drag' && <ChangeTray key={key} {...common} />}
    </div>
  );
}
