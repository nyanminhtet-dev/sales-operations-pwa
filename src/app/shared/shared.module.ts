import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { IconModule } from './icon/icon.module';

@NgModule({
  imports: [CommonModule, IconModule],
  exports: [CommonModule, IconModule],
})
export class SharedModule {}
