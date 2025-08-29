import { Component, OnInit } from '@angular/core';
import { AuthService } from '../auth/auth.service';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { TradeService } from '../trade/trade.service';
import { TradeView } from '../models/trade-view.dto';
import { FormsModule } from '@angular/forms';
import { combineLatest } from 'rxjs';
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

  newTrade = {
    accountId: '',
    instrumentId: '',
    direction: 'BUY' as 'BUY' | 'SELL',
    quantity: 0,
    price: 0,
    unit: 'PER_UNIT',
    deliveryType: 'CASH',
    status: 'OPEN' as 'OPEN' | 'EXERCISED' | 'CLOSED',
  };

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
      unit: this.editingTrade.unit,
      deliveryType: this.editingTrade.deliveryType,
      status: this.editingTrade.status,
    };

    this.tradeService.update(dto).subscribe({
      next: () => {
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
    this.tradeService.create(this.newTrade).subscribe({
      next: () => {
        this.newTrade = { ...this.newTrade, quantity: 0, price: 0 };
        this.loadAllData();
      },
      error: (err) => {
        alert('Error while creating');
        console.error(err);
      },
    });
  }

  deleteTrade(id: string): void {
    if (confirm('Delete trade?')) {
      this.tradeService.delete(id).subscribe(() => {
        this.loadAllData();
      });
    }
  }

  exerciseTrade(id: string): void {
    this.tradeService.exercise(id).subscribe({
      next: () => {
        alert('Trade exercised!');
        this.loadAllData();
      },
      error: (err) => {
        alert('Cant exercise');
        console.error(err);
      },
    });
  }
  logout() {
    this.authService.logout();
    this.router.navigate(['/login']);
  }

  isManager(): boolean {
    return this.authService.getRole() === 'MANAGER';
  }
}
