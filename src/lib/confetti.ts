import confetti from "canvas-confetti";

export function celebrate() {
  const colors = ["#00D26A", "#22c55e", "#a7f3d0", "#ffffff"];
  confetti({ particleCount: 90, spread: 70, origin: { y: 0.7 }, colors });
  setTimeout(() => confetti({ particleCount: 60, angle: 60, spread: 60, origin: { x: 0, y: 0.8 }, colors }), 150);
  setTimeout(() => confetti({ particleCount: 60, angle: 120, spread: 60, origin: { x: 1, y: 0.8 }, colors }), 300);
}
