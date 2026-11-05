import * as Dialog from "@radix-ui/react-dialog";
import { useState } from "react";
import { ArrowRight, ArrowUp, Check, Lock, Star, Timer, X, Flame, Snowflake, Gamepad2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ART, OFFER_ART, TOKEN_ART } from "@/lib/art";
import { clock, fmt, useGame } from "@/lib/game";
import { eventRun, eventTiers, progressFor, type EventDef } from "@/lib/events";
import type { Offer } from "@/lib/offers";

type Selection = { kind: "offer"; value: Offer } | { kind: "event"; value: EventDef };

export function SlotsOfferDialog({ selection, now, onClose }: { selection: Selection | null; now: number; onClose: () => void }) {
  return <Dialog.Root open={selection !== null} onOpenChange={(open) => { if (!open) onClose(); }}>
    <Dialog.Portal>
      <Dialog.Overlay className="slots-offer-backdrop" />
      <Dialog.Content className={`slots-offer-dialog ${selection?.kind === "event" ? `slots-offer-event slots-offer-theme-${selection.value.key}` : "slots-offer-paid"}`} aria-describedby={undefined}>
        <Dialog.Close asChild><Button variant="ghost" size="icon" className="slots-offer-close" aria-label="Close offer"><X /></Button></Dialog.Close>
        {selection && <Dialog.Title className="slots-offer-title">{selection.value.name.toUpperCase()}</Dialog.Title>}
        {selection?.kind === "offer" && <PaidOffer offer={selection.value} now={now} />}
        {selection?.kind === "event" && <EventPresentation key={selection.value.key} def={selection.value} now={now} />}
      </Dialog.Content>
    </Dialog.Portal>
  </Dialog.Root>;
}

function PaidOffer({ offer, now }: { offer: Offer; now: number }) {
  const [notice, setNotice] = useState(false);
  return <>
    <div className={`slots-offer-poster slots-offer-poster-${offer.key}`}>
      <div className="slots-offer-ribbon">SPECIAL OFFER</div>
      <img className="slots-offer-hero" src={OFFER_ART[offer.key]} alt={offer.name} />
      <div className="slots-offer-bundle">
        <div><img src={ART.bolt} alt="Spins" /><strong>{fmt(offer.spins)}</strong><span>SPINS</span></div>
        <span className="slots-offer-plus">+</span>
        <div><img src={ART.wheelSpin} alt="Wheel spins" /><strong>{fmt(offer.tickets)}</strong><span>WHEEL SPINS</span></div>
      </div>
    </div>
    <Button className="slots-offer-action slots-offer-buy" onClick={() => setNotice(true)}><img src={ART.ton} alt="" />{offer.ton} TON</Button>
    {notice && <p role="status" className="slots-offer-notice">Payments are not connected yet — nothing has been charged.</p>}
    <div className="slots-offer-countdown"><Timer /><span>ENDS IN: {now ? clock(offer.endsIn) : "--:--:--"}</span></div>
  </>;
}

function EventPresentation({ def, now }: { def: EventDef; now: number }) {
  const [notice, setNotice] = useState("");
  const { s, claimLive } = useGame();
  const { run, endsIn } = eventRun(def, now);
  const p = progressFor(s.live[def.key], run);
  const tiers = eventTiers(def);
  const target = tiers.find((t, i) => !p.claimed.includes(i)) ?? tiers[tiers.length - 1];
  const layout = def.key === "sun-crystal" ? "trail" : def.key === "ice-orb" ? "expedition" : def.key === "robot" ? "arcade" : def.key === "volcano" ? "jackpot" : "shelves";
  const tokenArt = TOKEN_ART[def.key] ?? ART.gem;
  const rewardTile = (tier: (typeof tiers)[number], i: number) => {
    const row = Math.floor(i / 3), col = row % 2 === 0 ? i % 3 : 2 - i % 3;
    const done = p.claimed.includes(i), reached = p.tokens >= tier.need;
    const image = tier.reward.spins ? ART.bolt : tier.reward.tickets ? ART.wheelSpin : ART.ton;
    const amount = tier.reward.spins ?? tier.reward.tickets ?? tier.reward.ton ?? 0;
    return <div key={i} className={`slots-offer-step ${!done && reached ? "slots-offer-step-active" : ""} ${done ? "slots-offer-step-done" : ""}`} style={layout === "trail" ? { gridRow: 4 - row, gridColumn: col + 1 } : undefined}>
      <span className="slots-offer-milestone">{String(i + 1).padStart(2, "0")}</span>
      <img className="slots-offer-step-token" src={tokenArt} alt="" />
      <strong className="slots-offer-step-need">{fmt(tier.need)}</strong>
      <span className="slots-offer-step-reward"><img src={image} alt={tier.reward.spins ? "Spins" : tier.reward.tickets ? "Wheel spins" : "TON"} />{fmt(amount)}</span>
      <Button className="slots-offer-action slots-offer-step-action" aria-label={done ? `Reward ${i + 1} claimed` : tier.price ? `Buy reward ${i + 1}` : `Claim reward ${i + 1}`} disabled={done || (!tier.price && !reached)} onClick={() => {
        if (tier.price) setNotice(`Payments coming soon: ${tier.price.ton} TON or ${tier.price.stars} Stars`);
        else claimLive(def.key, i);
      }}>{done ? <Check /> : tier.price ? <><Star />{tier.price.stars}</> : "FREE"}{!done && !reached && <Lock className="slots-offer-step-lock" />}</Button>
      {layout === "trail" && i < tiers.length - 1 && <span className={`slots-offer-trail-arrow ${i % 3 === 2 ? "slots-offer-trail-up" : row % 2 ? "slots-offer-trail-left" : "slots-offer-trail-right"}`}>{i % 3 === 2 ? <ArrowUp /> : <ArrowRight />}</span>}
    </div>;
  };
  return <>
    <div className="slots-offer-token-balance"><img src={tokenArt} alt="Event tokens" /><strong>{fmt(p.tokens)}</strong></div>
    {layout !== "trail" && <div className={`slots-offer-event-scene slots-offer-scene-${layout}`}>
      {layout === "expedition" && <><Snowflake className="slots-offer-scene-symbol" /><img className="slots-offer-scene-companion" src={ART.rocket} alt="" /></>}
      {layout === "arcade" && <Gamepad2 className="slots-offer-scene-symbol" />}
      {layout === "jackpot" && <Flame className="slots-offer-scene-symbol" />}
      <img className="slots-offer-scene-token" src={tokenArt} alt={def.name} />
      <span>{layout === "expedition" ? "EXPEDITION REWARDS" : layout === "arcade" ? "ARCADE PRIZES" : layout === "jackpot" ? "NEXT JACKPOT" : "SODA REWARDS"}</span>
      {layout === "jackpot" && target && <strong className="slots-offer-jackpot-prize"><img src={target.reward.spins ? ART.bolt : ART.wheelSpin} alt={target.reward.spins ? "Spins" : "Wheel spins"} />{fmt(target.reward.spins ?? target.reward.tickets ?? 0)}</strong>}
    </div>}
    <div className="slots-offer-trail-scroll">
      <div className={layout === "trail" ? "slots-offer-trail" : `slots-offer-layout-${layout}`}>
        {tiers.map(rewardTile)}
      </div>
    </div>
    {notice && <p role="status" className="slots-offer-notice">{notice}</p>}
    {target && <div className="slots-offer-progress"><img src={TOKEN_ART[def.key]} alt="" /><progress value={Math.min(p.tokens, target.need)} max={target.need} /><strong>{fmt(p.tokens)} / {fmt(target.need)}</strong></div>}
    <div className="slots-offer-countdown"><Timer /><span>ENDS IN: {now ? clock(endsIn) : "--:--:--"}</span></div>
  </>;
}