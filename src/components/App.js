"use client";
import { useState } from "react";
import { TABS } from "@/lib/constants";
import { useCountdown } from "@/hooks/useCountdown";
import { useTrip } from "@/hooks/useTrip";
import { useTheme } from "@/hooks/useTheme";
import { Hero } from "@/components/layout/Hero";
import { TabBar } from "@/components/layout/TabBar";
import { ThemeToggle } from "@/components/layout/ThemeToggle";
import { TabRoteiro } from "@/components/tabs/TabRoteiro";
import { TabParques } from "@/components/tabs/TabParques";
import { TabCustos } from "@/components/tabs/TabCustos";
import { TabVoos } from "@/components/tabs/TabVoos";
import { TabMalu } from "@/components/tabs/TabMalu";
import { TabCompras } from "@/components/tabs/TabCompras";
import { TabTimeline } from "@/components/tabs/TabTimeline";

export default function App() {
  const [tab, setTab] = useState("timeline");
  const cd = useCountdown("2026-03-31T02:00:00");
  const trip = useTrip();
  const theme = useTheme();

  if (trip.loading) {
    return (
      <div className="min-h-screen bg-theme-bg flex items-center justify-center">
        <div className="text-center">
          <div className="text-4xl mb-3 animate-bounce">🏰</div>
          <p className="text-sm text-theme-secondary">Carregando viagem...</p>
        </div>
      </div>
    );
  }

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
      />
    ),
    parques: (
      <TabParques
        parks={trip.parks}
        attractions={trip.attractions}
        addAttraction={trip.addAttraction}
        deleteAttraction={trip.deleteAttraction}
      />
    ),
    custos: (
      <TabCustos
        costs={trip.costs}
        addCost={trip.addCost}
        toggleCostPaid={trip.toggleCostPaid}
        deleteCost={trip.deleteCost}
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
      <Hero cd={cd} themeToggle={<ThemeToggle mode={theme.mode} onCycle={theme.cycle} />} />
      <TabBar tabs={TABS} activeTab={tab} onTabChange={setTab} />
      <div className="max-w-2xl mx-auto px-3 py-5 pb-16">
        {tabContent[tab]}
      </div>
      <div className="text-center pb-6">
        <p className="text-[10px] text-theme-muted">Planejado com ❤️ · Orlando 2026 · Atualizado mar/2026</p>
      </div>
    </div>
  );
}
