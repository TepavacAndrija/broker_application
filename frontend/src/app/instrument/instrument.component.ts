import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { InstrumentDTO } from '../models/instrument.dto';
import { InstrumentService } from './instrument.service';
import { AuthService } from '../auth/auth.service';
import * as Stomp from '@stomp/stompjs';
import SockJS from 'sockjs-client';

@Component({
  selector: 'app-instrument',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './instrument.component.html',
  styleUrl: './instrument.component.scss',
})
export class InstrumentComponent implements OnInit {
  instruments: InstrumentDTO[] = [];
  editingInstrument: InstrumentDTO | null = null;
  private client!: Stomp.Client;

  constructor(
    private instrumentService: InstrumentService,
    private authService: AuthService
  ) {}

  ngOnInit(): void {
    this.loadInstruments();
    this.connectWebSocket();
  }

  loadInstruments(): void {
    this.instrumentService.getAll().subscribe((data) => {
      this.instruments = data;
    });
  }

  connectWebSocket() {
    this.client = new Stomp.Client({
      webSocketFactory: () => new SockJS('http://localhost:8080/ws'),
      connectHeaders: {},
      debug: (str) => {
        console.log('STOMP: ' + str);
      },
      reconnectDelay: 5000,
      onConnect: () => {
        console.log('Connected to Websocket');
        this.client.subscribe('/topic/instruments', (message) => {
          console.log('Instrumen:', JSON.parse(message.body));
          this.loadInstruments();
        });

        this.client.subscribe('/topic/instruments/deleted', (message: any) => {
          const deletedInstrumentId = message.body;
          console.log('Deleted:', deletedInstrumentId);
          this.loadInstruments();
        });
      },
      onStompError: (e) => {
        console.error('stomp error: ' + e);
      },
    });

    this.client.activate();
  }

  startEdit(instrument: InstrumentDTO): void {
    this.editingInstrument = { ...instrument };
  }

  startCreate(): void {
    this.editingInstrument = { id: '', code: '', maturityDate: '' };
  }

  saveInstrument(): void {
    if (!this.editingInstrument) return;

    const { id, ...dto } = this.editingInstrument;

    if (id) {
      this.instrumentService.update(id, dto).subscribe({
        next: () => {
          this.cancelEdit();
          // this.loadInstruments();
        },
        error: (e) => {
          alert('Error while updating');
          console.error(e);
        },
      });
    } else {
      this.instrumentService.create(dto).subscribe({
        next: () => {
          this.cancelEdit();
          // this.loadInstruments();
        },
        error: (e) => {
          alert('Error while creating');
          console.error(e);
        },
      });
    }
  }

  cancelEdit(): void {
    this.editingInstrument = null;
  }

  deleteInstrument(id: string): void {
    if (confirm('Delete?')) {
      this.instrumentService.delete(id).subscribe(() => {
        // this.loadInstruments();
      });
    }
  }
  isManager(): boolean {
    return this.authService.getRole() === 'MANAGER';
  }
}
