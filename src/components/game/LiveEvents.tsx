import { useState } from "react";
import { useGame, fmt, clock } from "@/lib/game";
import { ART, TOKEN_ART, OFFER_ART } from "@/lib/art";
import { LIVE_EVENTS, claimable, eventRun, progressFor, type EventDef, type EventReward } from "@/lib/events";
import { currentOffers } from "@/lib/offers";
import { Button } from "@/components/ui/button";
import { SlotsOfferDialog } from "@/components/game/OfferPresentation";
import { Timer } from "lucide-react";

export function RewardChip({ r, size = "md" }: { r: EventReward; size?: "md" | "lg" }) {
  const [img, n] = r.spins ? [ART.bolt, fmt(r.spins)] : r.tickets ? [ART.wheelSpin, fmt(r.tickets)] : [ART.ton, String(r.ton ?? 0)];
  return (
    <span className="flex items-center gap-1.5">
      <img src={img} alt="" className={size === "lg" ? "h-9 w-9 object-contain" : "h-7 w-7 object-contain"} />
      <span className={`font-display leading-none text-cream text-outline ${size === "lg" ? "text-2xl" : "text-xl"}`}>{n}</span>
    </span>
  );
}

function Chip({ img, timer, label, badge, badgeIcon }: { img: string; timer: string; label: string; badge?: string | number; badgeIcon?: string }) {
  return (
    <span className="relative flex w-[62px] shrink-0 flex-col items-center">
      {!!badge && (
        <span className="absolute right-0 top-0 z-10 flex h-4 min-w-4 items-center gap-0.5 rounded-full border-2 border-ink bg-berry px-0.5 font-display text-[9px] leading-none text-cream">
          {badgeIcon && <img src={badgeIcon} alt="" className="h-2.5 w-2.5 object-contain" />}
          {badge}
        </span>
      )}
      <img src={img} alt="" className="h-11 w-11 object-contain drop-shadow-[0_3px_0_var(--ink)]" />
      <span className="mt-0.5 rounded-full bg-cream px-1.5 font-display text-[9px] leading-[14px] text-berry">{timer}</span>
      <span className="mt-0.5 line-clamp-2 text-center font-display text-[9px] leading-[10px] text-cream text-outline">{label}</span>
    </span>
  );
}

function OfferChip({ img, timer, price, hot }: { img: string; timer: string; price: number; hot: boolean }) {
  return (
    <span className={`relative flex w-[62px] shrink-0 flex-col items-center rounded-[18px] border-2 border-ink px-1 pb-1 pt-2 shadow-[0_3px_0_var(--ink)] ${hot ? "bg-gradient-to-b from-grape to-berry" : "bg-gradient-to-b from-grape to-berry/70"}`}>
      <span className="absolute -top-2 left-1/2 z-10 flex -translate-x-1/2 items-center gap-0.5 whitespace-nowrap rounded-full border-2 border-ink bg-cream px-1.5 py-px font-display text-[9px] leading-none text-ink shadow-[0_2px_0_var(--ink)]">
        <img src={ART.ton} alt="" className="h-2.5 w-2.5 object-contain" />
        {price}
      </span>
      {hot && <span className="absolute -right-1 top-1 z-10 rounded-full border-2 border-ink bg-sun px-1 font-display text-[7px] leading-[11px] text-ink">HOT</span>}
      <img src={img} alt="" className="h-10 w-10 object-contain drop-shadow-[0_3px_0_var(--ink)]" />
      <span className="mt-1 flex items-center gap-0.5 rounded-full bg-cream px-1.5 font-display text-[9px] leading-[14px] text-berry">
        <Timer className="h-2.5 w-2.5" strokeWidth={3} />
        {timer}
      </span>
    </span>
  );
}

export function EventsRow({ now }: { now: number }) {
  const { s } = useGame();
  const [offerKey, setOfferKey] = useState<string | null>(null);
  const [event, setEvent] = useState<EventDef | null>(null);
  const offers = currentOffers(now || 0);
  const offer = offers.find((o) => o.key === offerKey);
  return (
    <>
      <div className="flex gap-1.5 overflow-x-auto px-1 pb-1 pt-2.5 [scrollbar-width:none]">
        {LIVE_EVENTS.map((e) => {
          const { run, endsIn } = eventRun(e, now || 0);
          return (
            <Button variant="ghost" key={e.key} onClick={() => setEvent(e)} aria-label={`Open ${e.name}`} className="h-auto shrink-0 p-0 hover:bg-transparent active:scale-90">
              <Chip img={TOKEN_ART[e.key] ?? ART.gem} timer={now ? clock(endsIn) : "--:--:--"} label={e.name.toUpperCase()} badge={claimable(e, progressFor(s.live[e.key], run))} />
            </Button>
          );
        })}
        {offers.map((o) => (
          <Button variant="ghost" key={o.key} onClick={() => setOfferKey(o.key)} aria-label={`Open ${o.name} offer`} className="h-auto shrink-0 p-0 hover:bg-transparent active:scale-90">
            <OfferChip img={OFFER_ART[o.key] ?? ART.chest} timer={now ? clock(o.endsIn) : "--:--:--"} price={o.ton} hot={o.ton >= 1.5} />
          </Button>
        ))}
      </div>
      <SlotsOfferDialog selection={event ? { kind: "event", value: event } : offer ? { kind: "offer", value: offer } : null} now={now} onClose={() => { setEvent(null); setOfferKey(null); }} />
    </>
  );
}
