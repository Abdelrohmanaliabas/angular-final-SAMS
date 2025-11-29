import { Pipe, PipeTransform } from '@angular/core';
import { TranslateService } from '../services/translate.service';

@Pipe({ name: 't', standalone: true, pure: false })
export class TranslatePipe implements PipeTransform {
  constructor(private translate: TranslateService) {}

  transform(value: string): string {
    return this.translate.t(value);
  }
}
