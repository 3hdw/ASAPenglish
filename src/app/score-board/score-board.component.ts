import { Component, OnInit } from '@angular/core';
import { ScoringService } from '../scoring.service';

@Component({
  selector: 'app-score-board',
  templateUrl: './score-board.component.html',
  styleUrls: ['./score-board.component.scss'],
})
export class ScoreBoardComponent implements OnInit {
  constructor(private scoringService: ScoringService) {}

  ngOnInit(): void {}

  get score() {
    return this.scoringService.score;
  }
}
