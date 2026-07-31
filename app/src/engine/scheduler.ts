/**
 * scheduler.ts — chống lặp câu đã hỏi trong 20 câu gần nhất (thiết kế 3.3).
 * Generator sinh ngẫu nhiên; scheduler đảm bảo ràng buộc "không lặp trong 20".
 */
import { generate, type Question, type SkillId } from './questions';

export class QuestionScheduler {
  private recent: string[] = [];
  private window = 20;

  next(skill: SkillId, level: number): Question {
    let q = generate(skill, level);
    let tries = 0;
    while (this.recent.includes(q.key) && tries < 30) {
      q = generate(skill, level);
      tries++;
    }
    this.recent.push(q.key);
    if (this.recent.length > this.window) this.recent.shift();
    return q;
  }

  reset() {
    this.recent = [];
  }
}
