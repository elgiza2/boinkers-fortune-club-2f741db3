import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { Check, Info, LockKeyhole, Moon, Ticket, X, Zap } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import headerArt from "@/assets/fire-pass-header.jpg";
import { ART } from "@/lib/art";
import { useGame, passGift, passNeed, fmt } from "@/lib/game";

export const Route = createFileRoute("/pass")({
  head: () => ({
    meta: [
      { title: "Fire Pass — Solo Slots" },
      { name: "description", content: "Track your Fire Pass progress and explore free and premium spin rewards." },
      { property: "og:title", content: "Fire Pass — Solo Slots" },
      { property: "og:description", content: "Track your Fire Pass progress and explore free and premium spin rewards." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: PassPage,
});

function PassPage() {
  const { s } = useGame();
  const [info, setInfo] = useState(false);
  const firstLevel = Math.max(2, s.passLevel - 2);
  const levels = Array.from({ length: 20 }, (_, i) => firstLevel + i);
  return (
    <div className="fire-pass-page">
      <header className="fire-pass-header">
        <img src={headerArt} alt="Yellow masked character under the moon" className="fire-pass-header-art" />
        <Button variant="ghost" size="icon" className="fire-pass-info" aria-label="Pass information" onClick={() => setInfo(true)}><Info /></Button>
        <Button asChild variant="ghost" size="icon" className="fire-pass-close" aria-label="Close Fire Pass"><Link to="/"><X /></Link></Button>
        <div className="fire-pass-title"><h1>FIRE PASS</h1><span className="fire-pass-level"><Zap /> LEVEL {s.passLevel}</span></div>
      </header>
      <section className="fire-pass-progress" aria-label="Pass progress">
        <p>Spin the slot and progress!</p>
        <div className="fire-pass-progress-track">
          <span className="fire-pass-progress-ticket"><Ticket /><Moon /></span>
          <progress max={passNeed(s.passLevel)} value={s.passXp} aria-label="Experience to next level" />
          <span className="fire-pass-progress-value">{fmt(s.passXp)} / {fmt(passNeed(s.passLevel))}</span>
          <span className="fire-pass-progress-badge">{s.passLevel}</span>
        </div>
      </section>
      <div className="fire-pass-columns" aria-label="Reward tracks">
        <div><span className="fire-pass-ticket fire-pass-ticket-free">FREE</span></div>
        <div><span className="fire-pass-ticket fire-pass-ticket-pink"><Moon /></span></div>
        <div><span className="fire-pass-ticket fire-pass-ticket-gold"><Moon /></span></div>
      </div>
      <main className="fire-pass-rewards" aria-label="Pass level rewards">
        {levels.map(level => {
          const free = passGift(level, false), premium = passGift(level, true);
          const earned = level <= s.passLevel;
          return <div className="fire-pass-row" key={level}>
            <RewardTile label={`${fmt(free.coins)} coins`} earned={earned}><img src={ART.coin} alt="Coins" /><strong>x{fmt(free.coins)}</strong></RewardTile>
            <RewardTile label={`${free.spins} spins`} earned={earned}><img src={ART.wheelSpin} alt="Spins" /><strong>x{free.spins}</strong></RewardTile>
            <RewardTile label={`${fmt(premium.coins)} coins, ${premium.spins} spins, ${premium.tickets} ticket`} earned={earned && s.premium} premium locked={!s.premium}>
              <img src={ART.wheelSpin} alt="Premium spins" /><strong>x{premium.spins}</strong><small>{fmt(premium.coins)} coins · {premium.tickets} ticket</small>
            </RewardTile>
            <span className="fire-pass-row-level">{level}</span>
          </div>
        })}
      </main>
      <footer className="fire-pass-footer"><Button disabled className="fire-pass-claim">CLAIM ALL</Button></footer>
      <Dialog open={info} onOpenChange={setInfo}><DialogContent><DialogHeader><DialogTitle>Fire Pass</DialogTitle><DialogDescription>Each spin adds XP. Rewards are credited automatically when you reach a new level. Premium rewards include double coins and spins, plus one ticket.</DialogDescription></DialogHeader></DialogContent></Dialog>
    </div>
  );
}

function RewardTile({ children, label, earned, premium, locked }: { children: React.ReactNode; label: string; earned: boolean; premium?: boolean; locked?: boolean }) {
  return <div className={`fire-pass-cell${premium ? " fire-pass-cell-premium" : ""}`} aria-label={`${label}: ${earned ? "received" : locked ? "premium locked" : "upcoming"}`}>
    <div className={`fire-pass-reward${earned ? " fire-pass-reward-earned" : ""}`}>
      {earned ? <Check className="fire-pass-check" /> : <LockKeyhole className="fire-pass-lock" />}
      {children}
    </div>
  </div>;
}
