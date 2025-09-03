import { Component, OnInit } from '@angular/core';
import { AuthService } from '../auth/auth.service';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { TradeDTO, TradeService } from '../trade/trade.service';
import { TradeView } from '../models/trade-view.dto';
import { FormsModule } from '@angular/forms';
import { combineLatest, switchMap } from 'rxjs';
import { AccountService } from '../account/account.service';
import { InstrumentService } from '../instrument/instrument.service';
import { AccountDTO } from '../models/account.dto';
import { InstrumentDTO } from '../models/instrument.dto';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.scss',
})
export class DashboardComponent implements OnInit {
  constructor(
    private authService: AuthService,
    private router: Router,
    private tradeService: TradeService,
    private accountService: AccountService,
    private instrumentService: InstrumentService
  ) {}

  trades: TradeView[] = [];
  accounts: AccountDTO[] = [];
  instruments: InstrumentDTO[] = [];
  editingTrade: TradeView | null = null;
  showCreateModal = false;

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

  matchConfirmation: {
    original: TradeView;
    matching: {
      accountId: string;
      instrumentId: string;
      direction: 'BUY' | 'SELL';
      quantity: number;
      price: number;
      unit: 'PER_UNIT' | 'PER_KG';
      deliveryType: 'CASH' | 'DELIVERY';
      status: 'OPEN' | 'EXERCISED' | 'CLOSED' | 'MATCHED';
      matchedTradeId: string | null;
    };
  } | null = null;

  ngOnInit(): void {
    this.loadAllData();
  }

  startEdit(trade: TradeView): void {
    console.log('Pokrenut edit');
    this.editingTrade = { ...trade };
  }

  saveEdit(): void {
    if (!this.editingTrade) return;

    const dto = {
      id: this.editingTrade.id,
      accountId: this.editingTrade.account.id,
      instrumentId: this.editingTrade.instrument.id,
      direction: this.editingTrade.direction,
      quantity: this.editingTrade.quantity,
      price: this.editingTrade.price,
      unit: 'PER_UNIT' as 'PER_UNIT' | 'PER_KG',
      deliveryType: 'CASH' as 'CASH' | 'DELIVERY',
      status: 'OPEN' as 'OPEN' | 'EXERCISED' | 'CLOSED' | 'MATCHED',
      matchedTradeId: this.editingTrade.matchedTradeId,
    };

    this.tradeService.update(dto).subscribe({
      next: (updatedTrade) => {
        console.log(
          'Trade updated successfully. Match status:',
          updatedTrade.status
        );
        this.cancelEdit();
        this.loadAllData();
      },
      error: (e) => {
        alert('Error while updating');
        console.error(e);
      },
    });
  }

  loadAllData(): void {
    combineLatest({
      allTrades: this.tradeService.getTradeViews(),
      allAccounts: this.accountService.getAll(),
      allInstruments: this.instrumentService.getAll(),
    }).subscribe(({ allTrades, allAccounts, allInstruments }) => {
      this.trades = allTrades;
      this.accounts = allAccounts;
      this.instruments = allInstruments;
    });
  }

  cancelEdit(): void {
    this.editingTrade = null;
  }

  createTrade(): void {
    this.tradeService.create({ ...this.newTrade, status: 'OPEN' }).subscribe({
      next: () => {
        this.showCreateModal = false;
        this.newTrade = { ...this.newTrade, quantity: 0, price: 0 };
        this.loadAllData();
      },
      error: (e) => {
        alert('Error creating new trade');
        console.error(e);
      },
    });
  }

  deleteTrade(id: string): void {
    if (!confirm('Delete trade?')) return;
    this.tradeService.delete(id).subscribe(() => this.loadAllData());
  }

  confirmMatch(trade: TradeView): void {
    const matchingDirection = trade.direction === 'BUY' ? 'SELL' : 'BUY';

    this.matchConfirmation = {
      original: trade,
      matching: {
        accountId: this.accounts[0]?.id,
        instrumentId: trade.instrument.id,
        direction: matchingDirection,
        quantity: trade.quantity,
        price: trade.price,
        unit: 'PER_UNIT' as 'PER_UNIT' | 'PER_KG',
        deliveryType: 'CASH' as 'CASH' | 'DELIVERY',
        status: 'OPEN',
        matchedTradeId: trade.id,
      },
    };
  }

  executeMatch(): void {
    if (!this.matchConfirmation) return;

    const { original, matching } = this.matchConfirmation;

    this.tradeService.create(matching).subscribe({
      next: () => {
        alert('Trade matched successfully!');
        this.loadAllData();
        this.cancelMatch();
      },
      error: (err) => {
        console.error('Error during match process:', err);
        alert('Error during match process. Please check console for details.');
        this.loadAllData();
      },
    });
  }

  cancelMatch(): void {
    this.matchConfirmation = null;
  }
  logout() {
    this.authService.logout();
    this.router.navigate(['/login']);
  }

  isManager(): boolean {
    return this.authService.getRole() === 'MANAGER';
  }
}
