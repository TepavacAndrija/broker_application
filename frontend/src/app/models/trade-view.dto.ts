import { AccountDTO } from './account.dto';
import { InstrumentDTO } from './instrument.dto';

export interface TradeView {
  id: string;
  account: AccountDTO;
  instrument: InstrumentDTO;
  direction: 'BUY' | 'SELL';
  quantity: number;
  price: number;
  unit: string;
  deliveryType: string;
  status: 'OPEN' | 'EXERCISED' | 'CLOSED' | 'MATCHED';
}
