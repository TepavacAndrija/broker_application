import { AccountDTO } from './account.dto';
import { InstrumentDTO } from './instrument.dto';

export interface TradeView {
  id: string;
  account: AccountDTO;
  instrument: InstrumentDTO;
  direction: 'BUY' | 'SELL';
  quantity: number;
  price: number;
  unit: 'PER_UNIT' | 'PER_KG';
  deliveryType: 'CASH' | 'DELIVERY';
  status: 'OPEN' | 'EXERCISED' | 'CLOSED' | 'MATCHED';
  matchedTradeId: string | null;
}
