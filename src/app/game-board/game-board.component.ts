import { Component, OnDestroy, OnInit } from '@angular/core';
import { Subscription } from 'rxjs';
import { ScoringService } from '../scoring.service';

interface Select {
  element: HTMLElement;
  value: string;
}

@Component({
  selector: 'app-game-board',
  templateUrl: './game-board.component.html',
  styleUrls: ['./game-board.component.scss'],
})
export class GameBoardComponent implements OnInit, OnDestroy {
  private _numberOfPuzzles: number = 6; // determines how many pairs you have to choose to finish a game

  constructor(private scoringService: ScoringService) {
    this._subscription = this.scoringService.currentState.subscribe((next) => {
      if (next) {
        this.generateWords();
      }
    });
  }

  select(target: EventTarget | null, side: string, value: string) {
    if (target instanceof HTMLElement) {
      const element = <HTMLElement>target;
      if (!element.classList.contains('completed')) {
        if (side === 'left') {
          if (this._selectedRight !== null) {
            const result = this.scoringService.check(
              value,
              this._selectedRight.value
            );
            if (result) {
              element.classList.add('completed');
              this._selectedRight.element.classList.remove('selected');
              this._selectedRight.element.classList.add('completed');
              this._answered++;
            } else {
              this._selectedRight.element.classList.remove('selected');
            }
            this._selectedLeft = null;
            this._selectedRight = null;
          } else {
            if (this._selectedLeft !== null) {
              this._selectedLeft.element.classList.remove('selected');
            }
            element.classList.add('selected');
            this._selectedLeft = { element, value };
          }
        } else if (side === 'right') {
          if (this._selectedLeft !== null) {
            const result = this.scoringService.check(
              this._selectedLeft.value,
              value
            );
            if (result) {
              element.classList.add('completed');
              this._selectedLeft.element.classList.remove('selected');
              this._selectedLeft.element.classList.add('completed');
              this._answered++;
            } else {
              this._selectedLeft.element.classList.remove('selected');
            }
            this._selectedLeft = null;
            this._selectedRight = null;
          } else {
            if (this._selectedRight !== null) {
              this._selectedRight.element.classList.remove('selected');
            }
            element.classList.add('selected');
            this._selectedRight = { element, value };
          }
        }
      }
      if (this._answered === this._leftWords.length) {
        this.onFinish();
      }
    }
  }

  onFinish() {
    const element = document.getElementById('popup');
    if (element) {
      element.style.opacity = '1';
      element.style.zIndex = '999';
    }
  }

  onRestart() {
    // this._answered = 0;
    // this._leftWords = [];
    // this._rightWords = [];
    // this._selectedLeft = null;
    // this._selectedRight = null;
    // this.generateWords();
    const element = document.getElementById('popup');
    // this.scoringService.resetScore();
    if (element) {
      element.style.opacity = '0';
      element.style.zIndex = '-999';
    }
  }

  ngOnDestroy(): void {
    this._subscription.unsubscribe();
  }

  ngOnInit(): void {}

  get leftWords() {
    return this._leftWords;
  }
  get rightWords() {
    return this._rightWords;
  }
  get score() {
    return this.scoringService.score;
  }
  get numberOfPuzzles(){
    return this._numberOfPuzzles;
  }

  private generateWords() {
    [this._leftWords, this._rightWords] = this.scoringService.getWords(
      this._numberOfPuzzles
    );
  }

  private _answered: number = 0;
  private _leftWords: string[] = [];
  private _rightWords: string[] = [];
  private _subscription: Subscription;
  private _selectedLeft: Select | null = null;
  private _selectedRight: Select | null = null;
}
