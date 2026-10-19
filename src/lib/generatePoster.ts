import { NomineeResult } from '../types';

/**
 * Generates a high-res (1080x1350) VMA award champion poster on HTML5 canvas and triggers download.
 */
export async function generateWinnerPoster(categoryTitle: string, winner: NomineeResult): Promise<void> {
  const canvas = document.createElement('canvas');
  canvas.width = 1080;
  canvas.height = 1350;
  const ctx = canvas.getContext('2d');
  if (!ctx) return;

  // 1. Dark Midnight Background
  ctx.fillStyle = '#050508';
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  // Gradient atmosphere
  const bgGrad = ctx.createLinearGradient(0, 0, 0, canvas.height);
  bgGrad.addColorStop(0, '#0a0d14');
  bgGrad.addColorStop(0.5, '#050508');
  bgGrad.addColorStop(1, '#0e1726');
  ctx.fillStyle = bgGrad;
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  // Radial glow in center
  const radial = ctx.createRadialGradient(540, 580, 50, 540, 580, 500);
  radial.addColorStop(0, 'rgba(123, 241, 168, 0.15)');
  radial.addColorStop(1, 'rgba(0, 0, 0, 0)');
  ctx.fillStyle = radial;
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  // 2. Top Header & VMA Mint Accent Line
  ctx.fillStyle = '#7bf1a8';
  ctx.fillRect(70, 70, canvas.width - 140, 6);

  ctx.fillStyle = '#7bf1a8';
  ctx.font = "bold 26px 'JetBrains Mono', monospace";
  ctx.fillText("● OFFICIAL WINNERS CEREMONY // NOIR STAN AWARDS '26", 70, 120);

  // Category Title
  ctx.fillStyle = '#ffffff';
  ctx.font = "900 56px 'Oswald', 'Syne', sans-serif";
  const catText = categoryTitle.toUpperCase();
  ctx.fillText(catText.length > 28 ? catText.substring(0, 28) + '...' : catText, 70, 195);

  // 3. Photo Box
  const boxX = 70;
  const boxY = 240;
  const boxW = canvas.width - 140;
  const boxH = 680;

  // Draw background frame for photo
  ctx.fillStyle = '#0b0c10';
  ctx.fillRect(boxX, boxY, boxW, boxH);
  ctx.strokeStyle = '#7bf1a8';
  ctx.lineWidth = 4;
  ctx.strokeRect(boxX, boxY, boxW, boxH);

  // Try loading winner avatar image
  if (winner.avatar_url) {
    try {
      const img = new Image();
      img.crossOrigin = 'anonymous';
      await new Promise<void>((resolve, reject) => {
        img.onload = () => resolve();
        img.onerror = () => reject();
        img.src = winner.avatar_url!;
      });

      // Draw image inside box (cover aspect ratio)
      ctx.save();
      ctx.beginPath();
      ctx.rect(boxX, boxY, boxW, boxH);
      ctx.clip();

      const scale = Math.max(boxW / img.width, boxH / img.height);
      const x = boxX + (boxW - img.width * scale) / 2;
      const y = boxY + (boxH - img.height * scale) / 2;
      ctx.drawImage(img, x, y, img.width * scale, img.height * scale);

      // Dark gradient overlay on photo bottom
      const photoGrad = ctx.createLinearGradient(0, boxY + boxH - 260, 0, boxY + boxH);
      photoGrad.addColorStop(0, 'rgba(5, 5, 8, 0)');
      photoGrad.addColorStop(1, 'rgba(5, 5, 8, 0.95)');
      ctx.fillStyle = photoGrad;
      ctx.fillRect(boxX, boxY, boxW, boxH);

      ctx.restore();
    } catch {
      // Fallback if image fails to render
      ctx.fillStyle = '#141824';
      ctx.fillRect(boxX, boxY, boxW, boxH);
      ctx.fillStyle = '#7bf1a8';
      ctx.font = "bold 140px 'Oswald', sans-serif";
      ctx.textAlign = 'center';
      ctx.fillText(winner.display_name.charAt(0), canvas.width / 2, boxY + boxH / 2 + 50);
      ctx.textAlign = 'left';
    }
  } else {
    // Initial letter fallback
    ctx.fillStyle = '#141824';
    ctx.fillRect(boxX, boxY, boxW, boxH);
    ctx.fillStyle = '#7bf1a8';
    ctx.font = "bold 140px 'Oswald', sans-serif";
    ctx.textAlign = 'center';
    ctx.fillText(winner.display_name.charAt(0), canvas.width / 2, boxY + boxH / 2 + 50);
    ctx.textAlign = 'left';
  }

  // 4. Gold Champion Banner Over Box Bottom
  ctx.fillStyle = '#eab308';
  ctx.fillRect(boxX, boxY + boxH - 60, 280, 60);
  ctx.fillStyle = '#050508';
  ctx.font = "900 24px 'Oswald', sans-serif";
  ctx.fillText("★ OFFICIAL WINNER", boxX + 24, boxY + boxH - 22);

  // 5. Bottom Details Section
  const detailsY = boxY + boxH + 60;

  // Winner Display Name
  ctx.fillStyle = '#ffffff';
  ctx.font = "900 68px 'Oswald', 'Syne', sans-serif";
  ctx.fillText(winner.display_name, 70, detailsY + 20);

  // Winner @Handle
  ctx.fillStyle = '#7bf1a8';
  ctx.font = "bold 34px 'JetBrains Mono', monospace";
  ctx.fillText(`@${winner.x_username}`, 70, detailsY + 75);

  // Vote Stats
  ctx.fillStyle = '#94a3b8';
  ctx.font = "bold 28px 'JetBrains Mono', monospace";
  ctx.fillText(`${winner.votes.toLocaleString()} Votes // ${winner.percentage}% of Ballot`, 70, detailsY + 125);

  // 6. Footer Watermark & Branding
  ctx.fillStyle = 'rgba(255, 255, 255, 0.2)';
  ctx.fillRect(70, canvas.height - 110, canvas.width - 140, 2);

  ctx.fillStyle = '#64748b';
  ctx.font = "bold 20px 'JetBrains Mono', monospace";
  ctx.fillText("ONE TIMELINE. EVERY FANDOM. // NOIR STAN AWARDS 2026", 70, canvas.height - 60);

  // 7. Trigger Direct Download
  const link = document.createElement('a');
  link.download = `NoirAwards_${categoryTitle.replace(/[^a-zA-Z0-9]/g, '_')}_${winner.x_username}.png`;
  link.href = canvas.toDataURL('image/png');
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}
