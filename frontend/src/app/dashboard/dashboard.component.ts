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
      unit: string;
      deliveryType: string;
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
      unit: this.editingTrade.unit,
      deliveryType: this.editingTrade.deliveryType,
      status: 'OPEN' as 'OPEN' | 'EXERCISED' | 'CLOSED' | 'MATCHED',
      matchedTradeId: this.editingTrade.matchedTradeId,
    };

    this.tradeService.update(dto).subscribe({
      next: () => {
        if (dto.matchedTradeId) {
          this.tradeService
            .open(dto.matchedTradeId)
            .subscribe(() => this.loadAllData());
        }
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
    this.tradeService.findMatchableTrades(this.newTrade).subscribe({
      next: (matches) => {
        if (matches.length > 0) {
          this.executeAutoMatch(matches[0], this.newTrade);
        } else {
          this.tradeService
            .create({ ...this.newTrade, status: 'OPEN' })
            .subscribe({
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
      },
      error: (e) => {
        alert('Error while matching');
        console.error(e);
      },
    });
  }

  executeAutoMatch(existingTrade: TradeDTO, newTradeData: any): void {
    const tradeToCreate = {
      ...newTradeData,
      status: 'MATCHED' as 'OPEN' | 'EXERCISED' | 'CLOSED' | 'MATCHED',
      matchedTradeId: null,
    };

    this.tradeService.create(tradeToCreate).subscribe({
      next: (createdTrade) => {
        const updatedExisting = {
          ...existingTrade,
          status: 'MATCHED' as 'OPEN' | 'EXERCISED' | 'CLOSED' | 'MATCHED',
          matchedTradeId: createdTrade.id,
        };
        const updatedNew = {
          ...createdTrade,
          matchedTradeId: existingTrade.id,
        };
        this.tradeService.update(updatedExisting).subscribe({
          next: () => {
            this.tradeService.update(updatedNew).subscribe({
              next: () => {
                alert('Automated matching successful and linked!');
                this.showCreateModal = false;
                this.newTrade = { ...this.newTrade, quantity: 0, price: 0 };
                this.loadAllData();
              },
              error: (err) => {
                alert('Error updating new trade with matched ID');
                console.error(err);
                this.loadAllData();
              },
            });
          },
          error: (err) => {
            alert('Error updating existing trade with matched ID');
            console.error(err);
            this.loadAllData();
          },
        });
      },
      error: (err) => {
        alert('Error while creating new trade');
        console.error(err);
      },
    });
  }

  deleteTrade(id: string): void {
    if (!confirm('Delete trade?')) return;
    this.tradeService.getTradeById(id).subscribe({
      next: (trade) => {
        if (trade.matchedTradeId) {
          this.tradeService.open(trade.matchedTradeId).subscribe();
        }
      },
      complete: () => {
        this.tradeService.delete(id).subscribe(() => this.loadAllData());
      },
    });
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
        unit: trade.unit,
        deliveryType: trade.deliveryType,
        status: 'MATCHED',
        matchedTradeId: trade.id,
      },
    };
  }

  executeMatch(): void {
    if (!this.matchConfirmation) return;

    const { original, matching } = this.matchConfirmation;

    this.tradeService
      .match(original.id)
      .pipe(switchMap(() => this.tradeService.create(matching)))
      .subscribe({
        next: (createdTrade) => {
          const updatedOriginal = {
            ...original,
            accountId: original.account.id,
            instrumentId: original.instrument.id,
            matchedTradeId: createdTrade.id,
          };
          const updatedNew = { ...createdTrade, matchedTradeId: original.id };

          this.tradeService
            .update(updatedOriginal)
            .pipe(
              switchMap(() => this.tradeService.match(updatedOriginal.id)),
              switchMap(() => this.tradeService.update(updatedNew))
            )
            .subscribe({
              next: () => {
                alert('Trade matched successfully!');
                this.loadAllData();
                this.cancelMatch();
              },
              error: (e) => {
                alert('Error while creating matched trades');
              },
            });
        },
        error: (err) => {
          alert('Error during match process');
          console.error(err);
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
