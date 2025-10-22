import { Component, Input, Output, EventEmitter } from '@angular/core';
import { TradeView } from '../models/trade-view.dto';
import { AccountDTO } from '../models/account.dto';
import { InstrumentDTO } from '../models/instrument.dto';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-trade-form',
  templateUrl: './trade-form.component.html',
  imports: [CommonModule, FormsModule],
  standalone: true,
})
export class TradeFormComponent {
  @Input() editingTrade: TradeView | null = null;
  @Input() accounts: AccountDTO[] = [];
  @Input() instruments: InstrumentDTO[] = [];
  @Output() save = new EventEmitter<any>();
  @Output() cancel = new EventEmitter<void>();

  newTrade = {
    accountId: '',
    instrumentId: '',
    direction: 'BUY' as 'BUY' | 'SELL',
    quantity: 0,
    price: 0,
    unit: 'PER_UNIT' as 'PER_UNIT' | 'PER_KG',
    deliveryType: 'CASH' as 'CASH' | 'DELIVERY',
    status: 'OPEN' as 'OPEN' | 'EXERCISED' | 'CLOSED' | 'MATCHED',
    matchedTradeId: null,
  };

  get currentTrade() {
    if (this.editingTrade) {
      // Konvertuj TradeView u format sa accountId i instrumentId
      return {
        ...this.editingTrade,
        accountId: this.editingTrade.account.id,
        instrumentId: this.editingTrade.instrument.id,
      };
    }
    return this.newTrade;
  }

  onSave() {
    this.save.emit(this.currentTrade);
  }

  onCancel() {
    this.cancel.emit();
  }
}
