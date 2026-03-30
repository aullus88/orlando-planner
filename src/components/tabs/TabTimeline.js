"use client";
import { useState, useMemo } from "react";
import { CROWD_COLORS, TIMELINE_FILTERS, WEEKDAYS_PT, MONTHS_PT } from "@/lib/constants";
import { Card } from "@/components/ui";

function buildTimeline(days, dayItems, flights, hotels, cars) {
  const sortedDays = [...days].sort((a, b) => a.day_number - b.day_number);
  if (sortedDays.length === 0) return [];

  const firstDay = sortedDays[0];
  const lastDay = sortedDays[sortedDays.length - 1];

  // date string -> day object lookup
  const dateToDay = {};
  for (const d of sortedDays) {
    if (d.date) dateToDay[d.date] = d;
  }

  // Initialize events per day
  const dayEvents = {};
  for (const d of sortedDays) {
    dayEvents[d.id] = [];
  }

  // Flights: outbound -> first day, return -> last day
  for (const f of flights) {
    const targetDay = f.direction === "outbound" ? firstDay : lastDay;
    dayEvents[targetDay.id].push({
      type: "flight",
      time: f.departure_time || "00:00",
      icon: "✈️",
      title: `Voo ${f.origin} → ${f.destination}`,
      subtitle: [f.flight_number, f.duration, f.class].filter(Boolean).join(" · "),
      sourceId: f.id,
    });
  }

  // Hotels: check-in and check-out events
  for (const h of hotels) {
    if (h.check_in && dateToDay[h.check_in]) {
      dayEvents[dateToDay[h.check_in].id].push({
        type: "hotel",
        time: "16:00",
        icon: h.icon || "🏨",
        title: `Check-in ${h.name}`,
        subtitle: [h.address, h.booking_ref].filter(Boolean).join(" · "),
        sourceId: h.id,
      });
    }
    if (h.check_out && dateToDay[h.check_out]) {
      dayEvents[dateToDay[h.check_out].id].push({
        type: "hotel",
        time: "11:00",
        icon: h.icon || "🏨",
        title: `Check-out ${h.name}`,
        subtitle: [h.address, h.booking_ref].filter(Boolean).join(" · "),
        sourceId: h.id,
      });
    }
  }

  // Cars: pickup and return events
  for (const c of cars) {
    if (c.pickup_date) {
      const pickupDateStr = c.pickup_date.slice(0, 10);
      const pickupTime = c.pickup_date.includes("T") ? c.pickup_date.slice(11, 16) : "16:00";
      if (dateToDay[pickupDateStr]) {
        dayEvents[dateToDay[pickupDateStr].id].push({
          type: "car",
          time: pickupTime,
          icon: c.icon || "🚗",
          title: `Retirar carro ${c.company}`,
          subtitle: [c.car_type, c.pickup_location].filter(Boolean).join(" · "),
          sourceId: c.id,
        });
      }
    }
    if (c.return_date) {
      const returnDateStr = c.return_date.slice(0, 10);
      const returnTime = c.return_date.includes("T") ? c.return_date.slice(11, 16) : "11:00";
      if (dateToDay[returnDateStr]) {
        dayEvents[dateToDay[returnDateStr].id].push({
          type: "car",
          time: returnTime,
          icon: c.icon || "🚗",
          title: `Devolver carro ${c.company}`,
          subtitle: [c.car_type, c.return_location].filter(Boolean).join(" · "),
          sourceId: c.id,
        });
      }
    }
  }

  // Day items: activities on their parent day
  for (const item of dayItems) {
    if (!dayEvents[item.day_id]) continue;
    dayEvents[item.day_id].push({
      type: "activity",
      time: item.time_slot || "99:99",
      icon: item.is_highlight ? "⭐" : item.is_warning ? "⚠️" : "📌",
      title: item.title,
      subtitle: item.description || "",
      sourceId: item.id,
      status: item.status,
    });
  }

  // Sort events by time within each day
  for (const dayId of Object.keys(dayEvents)) {
    dayEvents[dayId].sort((a, b) => a.time.localeCompare(b.time));
  }

  return sortedDays.map((d) => ({ day: d, events: dayEvents[d.id] || [] }));
}

export function TabTimeline({ days, dayItems, flights, hotels, cars }) {
  const [activeFilters, setActiveFilters] = useState(new Set(["all"]));
  const [collapsedDays, setCollapsedDays] = useState(new Set());

  const timeline = useMemo(
    () => buildTimeline(days, dayItems, flights, hotels, cars),
    [days, dayItems, flights, hotels, cars]
  );

  function toggleFilter(filterId) {
    setActiveFilters((prev) => {
      const next = new Set(prev);
      if (filterId === "all") return new Set(["all"]);
      next.delete("all");
      if (next.has(filterId)) {
        next.delete(filterId);
        if (next.size === 0) return new Set(["all"]);
      } else {
        next.add(filterId);
      }
      return next;
    });
  }

  function isVisible(event) {
    if (activeFilters.has("all")) return true;
    return activeFilters.has(event.type);
  }

  function toggleDay(dayId) {
    setCollapsedDays((prev) => {
      const next = new Set(prev);
      if (next.has(dayId)) next.delete(dayId);
      else next.add(dayId);
      return next;
    });
  }

  // Total event count for header
  const totalEvents = timeline.reduce((sum, t) => sum + t.events.length, 0);

  return (
    <div>
      {/* Summary */}
      <div className="text-center p-4 rounded-xl mb-3" style={{ background: "rgba(255,107,61,0.06)", border: "1px solid rgba(255,107,61,0.15)" }}>
        <div className="text-[10px] text-theme-secondary uppercase tracking-wider">Timeline da Viagem</div>
        <div className="text-2xl font-bold text-accent" style={{ fontFamily: "var(--font-display)" }}>
          {days.length} dias · {totalEvents} eventos
        </div>
      </div>

      {/* Filter Pills */}
      <div className="flex gap-2 overflow-x-auto pb-2 mb-4" style={{ scrollbarWidth: "none" }}>
        {TIMELINE_FILTERS.map((f) => (
          <button
            key={f.id}
            onClick={() => toggleFilter(f.id)}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition-all ${
              activeFilters.has(f.id)
                ? "bg-accent/15 text-accent border border-accent/30"
                : "bg-theme-card text-theme-secondary border border-theme hover:bg-theme-card-hover"
            }`}
          >
            <span>{f.emoji}</span>
            <span>{f.label}</span>
          </button>
        ))}
      </div>

      {/* Day Sections */}
      {timeline.map(({ day, events }) => {
        const visibleEvents = events.filter(isVisible);
        const isCollapsed = collapsedDays.has(day.id);
        const dateObj = new Date(day.date + "T12:00:00");
        const weekday = WEEKDAYS_PT[dateObj.getDay()];
        const dayNum = dateObj.getDate();
        const month = MONTHS_PT[dateObj.getMonth()];

        return (
          <Card
            key={day.id}
            onClick={() => toggleDay(day.id)}
            border={!isCollapsed ? `1px solid ${day.color || "#666"}44` : undefined}
          >
            {/* Day Header */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div
                  className="w-10 h-10 rounded-lg flex items-center justify-center text-lg shrink-0"
                  style={{ background: (day.color || "#666") + "18" }}
                >
                  {day.emoji}
                </div>
                <div>
                  <div className="text-[10px] font-semibold text-theme-muted uppercase tracking-wider">
                    {String(dayNum).padStart(2, "0")} {month} ({weekday}) · Dia {day.day_number}
                    {day.crowd_level && (
                      <span className="ml-1.5" style={{ color: CROWD_COLORS[day.crowd_level] }}>
                        · {day.crowd_level}
                      </span>
                    )}
                  </div>
                  <div className="text-sm font-semibold text-theme-primary truncate">
                    {day.title}
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] text-theme-muted">{visibleEvents.length}</span>
                <span className={`text-theme-muted transition-transform ${!isCollapsed ? "rotate-180" : ""}`}>▾</span>
              </div>
            </div>

            {/* Event List */}
            {!isCollapsed && visibleEvents.length > 0 && (
              <div className="mt-3 pl-2 fade-up" onClick={(e) => e.stopPropagation()}>
                {visibleEvents.map((event, idx) => (
                  <div key={`${event.sourceId}-${idx}`} className="flex gap-3 mb-2 items-start">
                    <span className="text-sm shrink-0 mt-0.5">{event.icon}</span>
                    <div className="flex-1 min-w-0">
                      <div className={`text-xs leading-relaxed ${
                        event.status === "done" ? "line-through opacity-50 text-theme-secondary" : "text-theme-primary"
                      }`}>
                        {event.time !== "99:99" && (
                          <span className="text-theme-muted mr-1.5" style={{ fontFamily: "var(--font-mono)" }}>{event.time}</span>
                        )}
                        <span className="font-semibold">{event.title}</span>
                      </div>
                      {event.subtitle && (
                        <div className="text-[10px] text-theme-muted mt-0.5">{event.subtitle}</div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Empty state for filtered day */}
            {!isCollapsed && visibleEvents.length === 0 && (
              <div className="mt-3 text-center text-[11px] text-theme-muted py-2">
                Nenhum evento com os filtros selecionados
              </div>
            )}
          </Card>
        );
      })}
    </div>
  );
}
