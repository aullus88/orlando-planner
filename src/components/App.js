"use client";
import { useState, useRef } from "react";
import { TABS } from "@/lib/constants";
import { useCountdown } from "@/hooks/useCountdown";
import { useTrip } from "@/hooks/useTrip";
import { useTheme } from "@/hooks/useTheme";
import { Hero } from "@/components/layout/Hero";
import { TabBar } from "@/components/layout/TabBar";
import { ThemeToggle } from "@/components/layout/ThemeToggle";
import { SkeletonLoading, GlobalSearch } from "@/components/ui";
import { TabRoteiro } from "@/components/tabs/TabRoteiro";
import { TabParques } from "@/components/tabs/TabParques";
import { TabCustos } from "@/components/tabs/TabCustos";
import { TabVoos } from "@/components/tabs/TabVoos";
import { TabMalu } from "@/components/tabs/TabMalu";
import { TabCompras } from "@/components/tabs/TabCompras";
import { TabTimeline } from "@/components/tabs/TabTimeline";

const TRIP_START = "2026-03-31";
const TRIP_END = "2026-04-10";
const TRIP_TOTAL_DAYS = 11;

function getTripProgress() {
  const today = new Date();
  const start = new Date(TRIP_START);
  const end = new Date(TRIP_END);
  if (today < start) return { pct: 0, label: "Viagem ainda não começou" };
  if (today > end) return { pct: 100, label: "Viagem concluída!" };
  const elapsed = Math.ceil((today - start) / (1000 * 60 * 60 * 24));
  const pct = Math.round((elapsed / TRIP_TOTAL_DAYS) * 100);
  return { pct, label: `Dia ${elapsed} de ${TRIP_TOTAL_DAYS}` };
}

export default function App() {
  const [tab, setTab] = useState("timeline");
  const [tabKey, setTabKey] = useState(0);
  const [searchOpen, setSearchOpen] = useState(false);
  const touchStartX = useRef(null);
  const touchStartY = useRef(null);

  const cd = useCountdown("2026-03-31T02:00:00");
  const trip = useTrip();
  const theme = useTheme();

  const tabIds = TABS.map((t) => t.id);

  function handleTabChange(newTab) {
    if (newTab === tab) return;
    setTab(newTab);
    setTabKey((k) => k + 1);
  }

  // Swipe gesture handlers
  function handleTouchStart(e) {
    touchStartX.current = e.touches[0].clientX;
    touchStartY.current = e.touches[0].clientY;
  }

  function handleTouchEnd(e) {
    if (touchStartX.current === null) return;
    const dx = touchStartX.current - e.changedTouches[0].clientX;
    const dy = Math.abs(touchStartY.current - e.changedTouches[0].clientY);
    // Only swipe if horizontal movement > 60px and not mostly vertical
    if (Math.abs(dx) > 60 && Math.abs(dx) > dy * 1.5) {
      const currentIndex = tabIds.indexOf(tab);
      if (dx > 0 && currentIndex < tabIds.length - 1) {
        handleTabChange(tabIds[currentIndex + 1]);
      } else if (dx < 0 && currentIndex > 0) {
        handleTabChange(tabIds[currentIndex - 1]);
      }
    }
    touchStartX.current = null;
    touchStartY.current = null;
  }

  if (trip.loading) {
    return <SkeletonLoading />;
  }

  const progress = getTripProgress();

  const tabContent = {
    timeline: (
      <TabTimeline
        days={trip.days}
        dayItems={trip.dayItems}
        flights={trip.flights}
        hotels={trip.hotels}
        cars={trip.cars}
      />
    ),
    roteiro: (
      <TabRoteiro
        days={trip.days}
        dayItems={trip.dayItems}
        addDayItem={trip.addDayItem}
        updateDayItem={trip.updateDayItem}
        deleteDayItem={trip.deleteDayItem}
        toggleDayItemDone={trip.toggleDayItemDone}
        reorderDayItems={trip.reorderDayItems}
      />
    ),
    parques: (
      <TabParques
        parks={trip.parks}
        attractions={trip.attractions}
        addAttraction={trip.addAttraction}
        deleteAttraction={trip.deleteAttraction}
        reorderAttractions={trip.reorderAttractions}
      />
    ),
    custos: (
      <TabCustos
        costs={trip.costs}
        addCost={trip.addCost}
        toggleCostPaid={trip.toggleCostPaid}
        deleteCost={trip.deleteCost}
        reorderCosts={trip.reorderCosts}
      />
    ),
    voos: <TabVoos flights={trip.flights} />,
    compras: (
      <TabCompras
        shoppingItems={trip.shoppingItems}
        addShoppingItem={trip.addShoppingItem}
        updateShoppingItem={trip.updateShoppingItem}
        toggleShoppingChecked={trip.toggleShoppingChecked}
        deleteShoppingItem={trip.deleteShoppingItem}
        moveShoppingItem={trip.moveShoppingItem}
      />
    ),
    malu: <TabMalu attractions={trip.attractions} />,
  };

  return (
    <div className="min-h-screen bg-theme-bg transition-colors duration-300">
      <Hero
        cd={cd}
        themeToggle={<ThemeToggle mode={theme.mode} onCycle={theme.cycle} />}
        onSearchOpen={() => setSearchOpen(true)}
      />

      {/* Trip progress bar */}
      {progress.pct > 0 && progress.pct < 100 && (
        <div style={{ background: "var(--color-bg-secondary)", borderBottom: "1px solid var(--color-border-light)" }}>
          <div className="max-w-2xl mx-auto px-3 py-1.5 flex items-center gap-2">
            <span className="text-[10px] text-theme-muted shrink-0">{progress.label}</span>
            <div className="flex-1 h-1.5 rounded-full overflow-hidden" style={{ background: "var(--color-border)" }}>
              <div
                className="h-full rounded-full transition-all duration-700"
                style={{ width: `${progress.pct}%`, background: "var(--color-accent)" }}
              />
            </div>
            <span className="text-[10px] font-bold text-accent shrink-0">{progress.pct}%</span>
          </div>
        </div>
      )}

      <TabBar tabs={TABS} activeTab={tab} onTabChange={handleTabChange} />

      {/* Tab content with fade animation on change + swipe support */}
      <div
        className="max-w-2xl mx-auto px-3 py-5 pb-16"
        onTouchStart={handleTouchStart}
        onTouchEnd={handleTouchEnd}
      >
        <div key={tabKey} className="fade-up">
          {tabContent[tab]}
        </div>
      </div>

      <div className="text-center pb-6">
        <p className="text-[10px] text-theme-muted">Planejado com ❤️ · Orlando 2026 · Atualizado mar/2026</p>
      </div>

      {/* Global Search overlay */}
      {searchOpen && (
        <GlobalSearch
          days={trip.days}
          dayItems={trip.dayItems}
          attractions={trip.attractions}
          costs={trip.costs}
          shoppingItems={trip.shoppingItems}
          onTabChange={handleTabChange}
          onClose={() => setSearchOpen(false)}
        />
      )}
    </div>
  );
}
