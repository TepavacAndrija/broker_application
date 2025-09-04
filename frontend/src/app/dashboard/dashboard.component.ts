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
import * as Stomp from '@stomp/stompjs';
import SockJS from 'sockjs-client';
import { NotificationService } from '../notification/notification.service';

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
    private instrumentService: InstrumentService,
    private notificationService: NotificationService
  ) {}

  trades: TradeView[] = [];
  accounts: AccountDTO[] = [];
  instruments: InstrumentDTO[] = [];
  editingTrade: TradeView | null = null;
  showCreateModal = false;
  private client!: Stomp.Client;

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
    this.connectWebSocket();
  }

  connectWebSocket() {
    this.client = new Stomp.Client({
      brokerURL: 'ws://localhost:8080/ws',
      webSocketFactory: () => new SockJS('http://localhost:8080/ws'),
      connectHeaders: {},
      debug: (str) => {
        console.log('STOMP: ' + str);
      },
      reconnectDelay: 5000,
      onConnect: () => {
        console.log(' Connected to WebSocket');

        this.client.subscribe('/topic/trades', (message) => {
          const trade = JSON.parse(message.body);
          this.notificationService.showInfo(
            'Succesfully created trade with ID ' + trade.id,
            'Trade Created'
          );

          this.loadAllData();
        });

        this.client.subscribe('/topic/trades/update', (message) => {
          const trade = JSON.parse(message.body);
          this.notificationService.showEdit(
            'Succesfully updated trade with ID ' + trade.id,
            'Trade updated'
          );

          this.loadAllData();
        });

        this.client.subscribe('/topic/trades/exercise', (message) => {
          const trade = JSON.parse(message.body);
          this.notificationService.showExercise(
            'Succesfully exercised selected trades!',
            'Trades exercised'
          );

          this.loadAllData();
        });

        this.client.subscribe('/topic/trades/deleted', (message: any) => {
          this.notificationService.showWarning(
            `Trade with ID ${message.body} has been deleted`,
            'Trade Deleted'
          );
          this.loadAllData();
        });
      },
      onStompError: (error) => {
        console.error('STOMP Error:', error);
      },
    });

    this.client.activate();
  }

  startEdit(trade: TradeView): void {
    // console.log('Stareted edit');
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
        this.cancelEdit();
      },
      error: (e) => {
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
      },
      error: (e) => {
        console.error(e);
      },
    });
  }

  deleteTrade(id: string): void {
    if (!confirm('Delete trade?')) return;
    this.tradeService.delete(id).subscribe();
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
        this.cancelMatch();
      },
      error: (err) => {
        console.error('Error during match process:', err);
        this.loadAllData();
      },
    });
  }

  cancelMatch(): void {
    this.matchConfirmation = null;
  }

  exerciseTrade(id: string): void {
    if (!confirm('Are you sure you want to exercise this trade?')) return;

    this.tradeService.exercise(id).subscribe();
  }

  logout() {
    this.authService.logout();
    this.router.navigate(['/login']);
  }

  isManager(): boolean {
    return this.authService.getRole() === 'MANAGER';
  }
}
