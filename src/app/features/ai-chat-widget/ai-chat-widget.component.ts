import { CommonModule } from '@angular/common';
import {
  Component,
  ElementRef,
  ViewChild,
  AfterViewInit,
  NgZone,
  ChangeDetectorRef
} from '@angular/core';
import { FormsModule } from '@angular/forms';
import { AiService } from '../../core/services/ai.service';

type ChatMessage = { role: 'user' | 'ai'; content: string };

@Component({
  selector: 'app-ai-chat-widget',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './ai-chat-widget.component.html',
  styleUrls: ['./ai-chat-widget.component.scss'],
})
export class AiChatWidgetComponent implements AfterViewInit {
  @ViewChild('messagesContainer') messagesContainer!: ElementRef<HTMLDivElement>;

  messages: ChatMessage[] = [
    { role: 'ai', content: 'Hi! I am the AI assistant. How can I help you today?' }
  ];
  input = '';
  loading = false;
  error = '';

  constructor(
    private ai: AiService,
    private ngZone: NgZone,
    private cdr: ChangeDetectorRef
  ) {}

  ngAfterViewInit(): void {
    this.scrollToBottom();
  }

  private scrollToBottom(): void {
    if (!this.messagesContainer) return;
    const el = this.messagesContainer.nativeElement;
    el.scrollTop = el.scrollHeight;
  }

  private scrollAfterRender(): void {
    // small timeout so DOM has rendered the new message
    setTimeout(() => this.scrollToBottom(), 0);
  }

  send() {
    const text = this.input.trim();
    if (!text || this.loading) return;

    this.error = '';
    this.input = '';
    this.loading = true;

    this.messages.push({ role: 'user', content: text });
    this.cdr.detectChanges();      // force UI update immediately
    this.scrollAfterRender();

    this.ai.chat({ role: 'teacher', message: text }).subscribe({
      next: (res) => {
        // ensure state update + CD both happen
        this.ngZone.run(() => {
          this.messages.push({ role: 'ai', content: res.reply || '...' });
          this.loading = false;

          this.cdr.detectChanges();  // <- critical line
          this.scrollAfterRender();
        });
      },
      error: () => {
        this.ngZone.run(() => {
          this.error = 'Something went wrong. Please try again.';
          this.loading = false;

          this.cdr.detectChanges();
          this.scrollAfterRender();
        });
      }
    });
  }
}
