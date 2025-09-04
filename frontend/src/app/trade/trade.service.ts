import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { combineLatest, map, Observable } from 'rxjs';
import { environment } from '../../environments/environment';
import { TradeView } from '../models/trade-view.dto';
import { AccountService } from '../account/account.service';
import { InstrumentService } from '../instrument/instrument.service';
import { AccountDTO } from '../models/account.dto';
import { InstrumentDTO } from '../models/instrument.dto';

export interface TradeDTO {
  id: string;
  instrumentId: string;
  accountId: string;
  direction: 'BUY' | 'SELL';
  quantity: number;
  price: number;
  unit: 'PER_UNIT' | 'PER_KG';
  deliveryType: 'CASH' | 'DELIVERY';
  status: 'OPEN' | 'EXERCISED' | 'CLOSED' | 'MATCHED';
  matchedTradeId: string | null;
}

export interface CreateTradeDTO {
  instrumentId: string;
  accountId: string;
  direction: 'BUY' | 'SELL';
  quantity: number;
  price: number;
  unit: 'PER_UNIT' | 'PER_KG';
  deliveryType: 'CASH' | 'DELIVERY';
  status: 'OPEN' | 'EXERCISED' | 'CLOSED' | 'MATCHED';
  matchedTradeId: string | null;
}

@Injectable({
  providedIn: 'root',
})
export class TradeService {
  constructor(
    private http: HttpClient,
    private accountService: AccountService,
    private instrumentService: InstrumentService
  ) {}

  getAllTrades(): Observable<TradeDTO[]> {
    return this.http.get<TradeDTO[]>(`${environment.apiUrl}/trades`, {
      withCredentials: true,
    });
  }

  getTradeById(id: string): Observable<TradeDTO> {
    return this.http.get<TradeDTO>(`${environment.apiUrl}/trades/${id}`, {
      withCredentials: true,
    });
  }

  getTradeViews(): Observable<TradeView[]> {
    return combineLatest([
      this.getAllTrades(),
      this.accountService.getAll(),
      this.instrumentService.getAll(),
    ]).pipe(
      map(([trades, accounts, instruments]) => {
        const accountMap = new Map<string, AccountDTO>(
          accounts.map((a) => [a.id, a])
        );
        const instrumentMap = new Map<string, InstrumentDTO>(
          instruments.map((i) => [i.id, i])
        );

        return trades.map(
          (trade) =>
            ({
              id: trade.id,
              account: accountMap.get(trade.accountId)!,
              instrument: instrumentMap.get(trade.instrumentId)!,
              direction: trade.direction,
              quantity: trade.quantity,
              price: trade.price,
              status: trade.status,
              matchedTradeId: trade.matchedTradeId,
            } as TradeView)
        );
      })
    );
  }

  update(trade: TradeDTO): Observable<TradeDTO> {
    return this.http.put<TradeDTO>(
      `${environment.apiUrl}/trades/${trade.id}`,
      trade,
      { withCredentials: true }
    );
  }

  delete(id: string): Observable<void> {
    return this.http.delete<void>(`${environment.apiUrl}/trades/${id}`, {
      withCredentials: true,
    });
  }
  create(dto: CreateTradeDTO): Observable<TradeDTO> {
    return this.http.post<TradeDTO>(`${environment.apiUrl}/trades`, dto, {
      withCredentials: true,
    });
  }

  exercise(id: string): Observable<void> {
    return this.http.post<void>(
      `${environment.apiUrl}/trades/${id}/exercise`,
      id,
      {
        withCredentials: true,
      }
    );
  }

  // match(id: string): Observable<TradeDTO> {
  //   return this.http.post<TradeDTO>(
  //     `${environment.apiUrl}/trades/${id}/match`,
  //     {},
  //     { withCredentials: true }
  //   );
  // }
}
