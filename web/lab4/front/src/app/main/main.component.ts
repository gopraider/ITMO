import { AfterViewInit, Component } from '@angular/core';
import { HttpClient } from '@angular/common/http';

interface HitRecord {
  id?: number;
  x: number;
  y: number;
  r: number;
  hit: boolean;
  time?: string;
  execTimeMs?: number;
}

@Component({
  selector: 'app-main',
  templateUrl: './main.component.html',
  styleUrls: ['./main.component.css']
})
export class MainComponent implements AfterViewInit {
  xValues = [-5,-4,-3,-2,-1,0,1,2,3];
  x = 0;
  y: number | null = null;
  r = 1;
  history: HitRecord[] = [];
  error = '';

  constructor(private http: HttpClient) {}

  ngAfterViewInit(): void {
    this.loadHistory();
    setTimeout(() => this.drawArea(), 0);
  }

  loadHistory() {
    this.http.get<HitRecord[]>('http://localhost:8080/backend/api/hits')
      .subscribe(res => this.history = res);
  }

  shoot() {
    this.error = '';
    if (this.y == null || isNaN(this.y)) {
      this.error = 'Y должен быть числом от -3 до 3';
      return;
    }
    if (this.y < -3 || this.y > 3) {
      this.error = 'Y должен быть от -3 до 3';
      return;
    }
    const body = { x: this.x, y: this.y, r: this.r };
    this.http.post<HitRecord>('http://localhost:8080/backend/api/hits', body)
      .subscribe({
        next: rec => {
          this.history.unshift(rec);
          this.drawArea();
        },
        error: () => this.error = 'Ошибка при отправке точки'
      });
  }

  clear() {
    this.http.delete('http://localhost:8080/backend/api/hits')
      .subscribe(() => {
        this.history = [];
        this.drawArea();
      });
  }

  logout() {
    window.location.href = '/';
  }

  // ======== Графика (упрощённая) =========
  drawArea() {
    const c = document.getElementById('area') as HTMLCanvasElement | null;
    if (!c) return;
    const ctx = c.getContext('2d');
    if (!ctx) return;

    const W = c.width, H = c.height, cx = W / 2, cy = H / 2;
    const R = this.r > 0 ? this.r : 1;
    const scale = (W / 2) / (R * 1.25);

    ctx.clearRect(0, 0, W, H);

    ctx.strokeStyle = '#333';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(0, cy); ctx.lineTo(W, cy);
    ctx.moveTo(cx, 0); ctx.lineTo(cx, H);
    ctx.stroke();

    ctx.font = '12px Arial';
    ctx.fillStyle = '#333';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';

    const marks = [-R, -R/2, R/2, R];
    marks.forEach(m => {
      const px = cx + m * scale;
      const py = cy - m * scale;

      ctx.beginPath();
      ctx.moveTo(px, cy - 5);
      ctx.lineTo(px, cy + 5);
      ctx.stroke();
      ctx.fillText(m.toString(), px, cy + 15);

      ctx.beginPath();
      ctx.moveTo(cx - 5, py);
      ctx.lineTo(cx + 5, py);
      ctx.stroke();
      if (m !== 0) {
        ctx.fillText(m.toString(), cx - 15, py);
      }
    });

    ctx.fillStyle = 'rgba(100,150,255,0.6)';
    ctx.strokeStyle = '#0066cc';
    ctx.beginPath();
    ctx.rect(cx - (R/2)*scale, cy - R*scale, (R/2)*scale, R*scale);
    ctx.fill();
    ctx.stroke();

    ctx.beginPath();
    ctx.moveTo(cx, cy);
    ctx.lineTo(cx - R*scale, cy);
    ctx.lineTo(cx, cy + (R/2)*scale);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();

    ctx.beginPath();
    ctx.arc(cx, cy, (R/2)*scale, 0, Math.PI/2, false);
    ctx.lineTo(cx, cy);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();

    // точки из history
    this.history.forEach(h => {
      const px = cx + h.x * scale;
      const py = cy - h.y * scale;
      ctx.beginPath();
      ctx.arc(px, py, 4, 0, Math.PI * 2);
      ctx.fillStyle = h.hit ? '#00aa00' : '#ff0000';
      ctx.fill();
      ctx.strokeStyle = '#333';
      ctx.stroke();
    });
  }
}
