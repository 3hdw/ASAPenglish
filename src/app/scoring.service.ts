import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs/internal/BehaviorSubject';
import { map } from 'rxjs/operators';

function shuffle(array: any[]): any[] {
  let currentIndex = array.length,
    randomIndex;

  // While there remain elements to shuffle.
  while (currentIndex != 0) {
    // Pick a remaining element.
    randomIndex = Math.floor(Math.random() * currentIndex);
    currentIndex--;

    // And swap it with the current element.
    [array[currentIndex], array[randomIndex]] = [
      array[randomIndex],
      array[currentIndex],
    ];
  }

  return array;
}

@Injectable({
  providedIn: 'root',
})
export class ScoringService {
  constructor(private httpClient: HttpClient) {
    this._dictionary = new Map<string, string>();
    this._createPairs();
  }

  private _stateSubject = new BehaviorSubject(false);
  public currentState = this._stateSubject.asObservable();

  public get score() {
    return this._score;
  }

  public resetScore() {
    this._score = 0;
    this._multiplier = 1;
  }

  public check(left: string, right: string): boolean {
    const result = this._dictionary.get(left) === right;
    if (result) {
      this._score += this._multiplier * 10;
      this._multiplier += 0.1;
    } else {
      this._multiplier = 1;
    }
    return result;
  }

  public getWords(n: number): string[][] {
    const leftWords: string[] = [];
    const rightWords: string[] = [];
    const limit = this._arrayPointer + n;
    for (; this._arrayPointer < limit; this._arrayPointer++) {
      if (this._arrayPointer >= this._pairs.length)
        return [shuffle(leftWords), shuffle(rightWords)];
      leftWords.push(this._pairs[this._arrayPointer][0]);
      rightWords.push(this._pairs[this._arrayPointer][1]);
    }
    return [shuffle(leftWords), shuffle(rightWords)];
  }

  private _createPairs() {
    console.log('ONCEEE');
    this.httpClient
      .get('assets/pairs.txt', { responseType: 'text' })
      .pipe(
        map((dataWithWhiteCharacters: string) =>
          dataWithWhiteCharacters.replace(/[\r\n\t ]/gm, '')
        ),
        map((stringPairs: string) => {
          const stringPairsArray: any = stringPairs.split(',');
          for (let i = 0; i < stringPairsArray.length; i++) {
            stringPairsArray[i] = stringPairsArray[i].split(':');
            this._dictionary.set(
              stringPairsArray[i][0],
              stringPairsArray[i][1]
            );
            this._dictionary.set(
              stringPairsArray[i][1],
              stringPairsArray[i][0]
            );
          }
          return stringPairsArray;
        })
      )
      .subscribe((data: string[][]) => {
        this._pairs = shuffle(data);
        this._setStateToReady();
      });
  }

  private _setStateToReady() {
    this._stateSubject.next(true);
  }

  private _score: number = 0;
  private _pairs: string[][] = [];
  private _multiplier: number = 1;
  private _dictionary: Map<string, string>;
  private _arrayPointer: number = 0;
}
