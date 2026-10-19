import { NomineeResult } from '../types';

/**
 * Generates a high-res (1080x1350) Red Carpet Award Poster on HTML5 canvas for ANY nominee (1st, 2nd, 3rd, Finalist)
 * and triggers immediate download to camera roll / gallery.
 */
export async function generateNomineePoster(
  categoryTitle: string,
  nominee: NomineeResult,
  rank: number
): Promise<void> {
  const canvas = document.createElement('canvas');
  canvas.width = 1080;
  canvas.height = 1350;
  const ctx = canvas.getContext('2d');
  if (!ctx) return;

  // Color schemes based on position
  let primaryColor = '#7bf1a8'; // default mint
  let badgeText = `★ OFFICIAL FINALIST // RANK #${rank}`;
  let badgeBg = '#1e293b';
  let badgeFg = '#f8fafc';

  if (rank === 1) {
    primaryColor = '#facc15'; // Gold
    badgeText = '👑 CROWNED WINNER // 1ST PLACE';
    badgeBg = '#eab308';
    badgeFg = '#050508';
  } else if (rank === 2) {
    primaryColor = '#e2e8f0'; // Silver
    badgeText = '🥈 2ND PLACE // RUNNER-UP';
    badgeBg = '#94a3b8';
    badgeFg = '#050508';
  } else if (rank === 3) {
    primaryColor = '#f97316'; // Bronze
    badgeText = '🥉 3RD PLACE // PODIUM FINALIST';
    badgeBg = '#ea580c';
    badgeFg = '#ffffff';
  }

  // 1. Red Carpet Stage Midnight Background
  ctx.fillStyle = '#050508';
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  // Red velvet spotlight glow from bottom floor
  const bgGrad = ctx.createLinearGradient(0, 0, 0, canvas.height);
  bgGrad.addColorStop(0, '#0a0d14');
  bgGrad.addColorStop(0.5, '#07080c');
  bgGrad.addColorStop(0.85, '#20070b'); // velvet red undertone
  bgGrad.addColorStop(1, '#3b0811'); // red carpet stage floor
  ctx.fillStyle = bgGrad;
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  // Top spotlight cone from ceiling
  const spotlight = ctx.createRadialGradient(540, 0, 80, 540, 500, 700);
  spotlight.addColorStop(0, 'rgba(255, 255, 255, 0.18)');
  spotlight.addColorStop(0.6, 'rgba(123, 241, 168, 0.05)');
  spotlight.addColorStop(1, 'rgba(0, 0, 0, 0)');
  ctx.fillStyle = spotlight;
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  // 2. Top Header & Accent Line
  ctx.fillStyle = primaryColor;
  ctx.fillRect(70, 70, canvas.width - 140, 6);

  ctx.fillStyle = primaryColor;
  ctx.font = "bold 24px 'JetBrains Mono', monospace";
  ctx.fillText("● NOIR STAN AWARDS '26 // RED CARPET HONORS", 70, 118);

  // Category Title
  ctx.fillStyle = '#ffffff';
  ctx.font = "900 52px 'Oswald', sans-serif";
  const catText = categoryTitle.toUpperCase();
  ctx.fillText(catText.length > 28 ? catText.substring(0, 28) + '...' : catText, 70, 185);

  // 3. Photo Frame
  const boxX = 70;
  const boxY = 230;
  const boxW = canvas.width - 140;
  const boxH = 680;

  // Frame background
  ctx.fillStyle = '#0a0c12';
  ctx.fillRect(boxX, boxY, boxW, boxH);
  ctx.strokeStyle = primaryColor;
  ctx.lineWidth = rank === 1 ? 6 : 3;
  ctx.strokeRect(boxX, boxY, boxW, boxH);

  // Load avatar image
  if (nominee.avatar_url) {
    try {
      const img = new Image();
      img.crossOrigin = 'anonymous';
      await new Promise<void>((resolve, reject) => {
        img.onload = () => resolve();
        img.onerror = () => reject();
        img.src = nominee.avatar_url!;
      });

      ctx.save();
      ctx.beginPath();
      ctx.rect(boxX, boxY, boxW, boxH);
      ctx.clip();

      const scale = Math.max(boxW / img.width, boxH / img.height);
      const x = boxX + (boxW - img.width * scale) / 2;
      const y = boxY + (boxH - img.height * scale) / 2;
      ctx.drawImage(img, x, y, img.width * scale, img.height * scale);

      // Dark gradient overlay on photo bottom
      const photoGrad = ctx.createLinearGradient(0, boxY + boxH - 240, 0, boxY + boxH);
      photoGrad.addColorStop(0, 'rgba(5, 5, 8, 0)');
      photoGrad.addColorStop(1, 'rgba(5, 5, 8, 0.96)');
      ctx.fillStyle = photoGrad;
      ctx.fillRect(boxX, boxY, boxW, boxH);

      ctx.restore();
    } catch {
      ctx.fillStyle = '#141824';
      ctx.fillRect(boxX, boxY, boxW, boxH);
      ctx.fillStyle = primaryColor;
      ctx.font = "bold 140px 'Oswald', sans-serif";
      ctx.textAlign = 'center';
      ctx.fillText(nominee.display_name.charAt(0), canvas.width / 2, boxY + boxH / 2 + 50);
      ctx.textAlign = 'left';
    }
  } else {
    ctx.fillStyle = '#141824';
    ctx.fillRect(boxX, boxY, boxW, boxH);
    ctx.fillStyle = primaryColor;
    ctx.font = "bold 140px 'Oswald', sans-serif";
    ctx.textAlign = 'center';
    ctx.fillText(nominee.display_name.charAt(0), canvas.width / 2, boxY + boxH / 2 + 50);
    ctx.textAlign = 'left';
  }

  // 4. Rank Badge Ribbon Over Photo
  ctx.fillStyle = badgeBg;
  ctx.fillRect(boxX, boxY + boxH - 65, 380, 65);
  ctx.fillStyle = badgeFg;
  ctx.font = "900 24px 'Oswald', sans-serif";
  ctx.fillText(badgeText, boxX + 24, boxY + boxH - 24);

  // 5. Bottom Details Section
  const detailsY = boxY + boxH + 50;

  // Display Name
  ctx.fillStyle = '#ffffff';
  ctx.font = "900 68px 'Oswald', sans-serif";
  const nameText = nominee.display_name.length > 22 ? nominee.display_name.substring(0, 22) + '...' : nominee.display_name;
  ctx.fillText(nameText, 70, detailsY + 25);

  // Handle
  ctx.fillStyle = primaryColor;
  ctx.font = "bold 34px 'JetBrains Mono', monospace";
  ctx.fillText(`@${nominee.x_username}`, 70, detailsY + 80);

  // Vote Stats
  ctx.fillStyle = '#cbd5e1';
  ctx.font = "bold 30px 'JetBrains Mono', monospace";
  ctx.fillText(`${nominee.votes.toLocaleString()} Votes // ${nominee.percentage}% of Ballot`, 70, detailsY + 130);

  // 6. Footer Ribbon & Red Carpet Branding
  ctx.fillStyle = 'rgba(255, 255, 255, 0.2)';
  ctx.fillRect(70, canvas.height - 110, canvas.width - 140, 2);

  ctx.fillStyle = '#94a3b8';
  ctx.font = "bold 20px 'JetBrains Mono', monospace";
  ctx.fillText("OFFICIAL RED CARPET CEREMONY // NOIR STAN AWARDS '26", 70, canvas.height - 60);

  // High-Resolution Image Export (Mobile Camera Roll & Desktop Download)
  const blob: Blob | null = await new Promise((resolve) => canvas.toBlob(resolve, 'image/png'));
  const fileName = `NoirAwards_Rank${rank}_${nominee.x_username}.png`;

  if (!blob) {
    // Fallback to dataURL if toBlob is unavailable
    const link = document.createElement('a');
    link.download = fileName;
    link.href = canvas.toDataURL('image/png');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    return;
  }

  const file = new File([blob], fileName, { type: 'image/png' });

  // 1. Mobile Native Share Sheet (iOS Safari & Android Chrome)
  // Allows user to directly tap "Save Image" to Photos / Camera Roll
  if (typeof navigator !== 'undefined' && navigator.canShare && navigator.canShare({ files: [file] })) {
    try {
      await navigator.share({
        files: [file],
        title: `NOIR STAN AWARDS '26 - ${nominee.display_name}`,
        text: `Official Award Card for @${nominee.x_username} (${categoryTitle})! 🏆 #NoirStanAwards`,
      });
      return;
    } catch (err: any) {
      if (err.name === 'AbortError') {
        // User closed the share sheet
        return;
      }
    }
  }

  // 2. Standard Blob Download (Desktop / Laptops / Android fallback)
  const blobUrl = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.download = fileName;
  link.href = blobUrl;
  link.rel = 'noopener';
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);

  // 3. Fallback for iOS webviews/browsers without Web Share API: open image in new tab to long-press save
  const isIOS = typeof navigator !== 'undefined' && /iPad|iPhone|iPod/.test(navigator.userAgent);
  if (isIOS) {
    window.open(blobUrl, '_blank');
  }

  setTimeout(() => URL.revokeObjectURL(blobUrl), 30000);
}
