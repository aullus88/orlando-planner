"use client";
import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/lib/supabase";
import { TRIP_ID } from "@/lib/constants";

export function useTrip() {
  const [days, setDays] = useState([]);
  const [dayItems, setDayItems] = useState([]);
  const [parks, setParks] = useState([]);
  const [attractions, setAttractions] = useState([]);
  const [costs, setCosts] = useState([]);
  const [flights, setFlights] = useState([]);
  const [shoppingItems, setShoppingItems] = useState([]);
  const [hotels, setHotels] = useState([]);
  const [cars, setCars] = useState([]);
  const [loading, setLoading] = useState(true);

  // ── Initial fetch ──
  const fetchAll = useCallback(async () => {
    const [dRes, diRes, pRes, aRes, cRes, fRes, sRes, hRes, carRes] = await Promise.all([
      supabase.from("trip_days").select("*").eq("trip_id", TRIP_ID).order("sort_order"),
      supabase.from("day_items").select("*").order("sort_order"),
      supabase.from("parks").select("*").eq("trip_id", TRIP_ID).order("sort_order"),
      supabase.from("attractions").select("*").order("sort_order"),
      supabase.from("trip_costs").select("*").eq("trip_id", TRIP_ID).order("sort_order"),
      supabase.from("trip_flights").select("*").eq("trip_id", TRIP_ID).order("sort_order"),
      supabase.from("shopping_lists").select("*").eq("trip_id", TRIP_ID).order("sort_order"),
      supabase.from("trip_hotels").select("*").eq("trip_id", TRIP_ID).order("sort_order"),
      supabase.from("trip_cars").select("*").eq("trip_id", TRIP_ID).order("sort_order"),
    ]);
    setDays(dRes.data || []);
    setDayItems(diRes.data || []);
    setParks(pRes.data || []);
    setAttractions(aRes.data || []);
    setCosts(cRes.data || []);
    setFlights(fRes.data || []);
    setShoppingItems(sRes.data || []);
    setHotels(hRes.data || []);
    setCars(carRes.data || []);
    setLoading(false);
  }, []);

  useEffect(() => { fetchAll(); }, [fetchAll]);

  // ── Realtime subscriptions ──
  useEffect(() => {
    const setterMap = {
      day_items: setDayItems,
      trip_days: setDays,
      parks: setParks,
      attractions: setAttractions,
      trip_costs: setCosts,
      trip_flights: setFlights,
      shopping_lists: setShoppingItems,
      trip_hotels: setHotels,
      trip_cars: setCars,
    };

    function handleChange(table, payload) {
      const setter = setterMap[table];
      if (!setter) return;
      const { eventType, new: newRow, old: oldRow } = payload;

      switch (eventType) {
        case "INSERT":
          setter((prev) => {
            if (prev.some((item) => item.id === newRow.id)) return prev;
            return [...prev, newRow];
          });
          break;
        case "UPDATE":
          setter((prev) => prev.map((item) => (item.id === newRow.id ? newRow : item)));
          break;
        case "DELETE":
          setter((prev) => prev.filter((item) => item.id !== oldRow.id));
          break;
      }
    }

    const channel = supabase
      .channel("trip-realtime")
      .on("postgres_changes", { event: "*", schema: "public", table: "trip_days" }, (p) => handleChange("trip_days", p))
      .on("postgres_changes", { event: "*", schema: "public", table: "day_items" }, (p) => handleChange("day_items", p))
      .on("postgres_changes", { event: "*", schema: "public", table: "parks" }, (p) => handleChange("parks", p))
      .on("postgres_changes", { event: "*", schema: "public", table: "attractions" }, (p) => handleChange("attractions", p))
      .on("postgres_changes", { event: "*", schema: "public", table: "trip_costs" }, (p) => handleChange("trip_costs", p))
      .on("postgres_changes", { event: "*", schema: "public", table: "trip_flights" }, (p) => handleChange("trip_flights", p))
      .on("postgres_changes", { event: "*", schema: "public", table: "shopping_lists" }, (p) => handleChange("shopping_lists", p))
      .on("postgres_changes", { event: "*", schema: "public", table: "trip_hotels" }, (p) => handleChange("trip_hotels", p))
      .on("postgres_changes", { event: "*", schema: "public", table: "trip_cars" }, (p) => handleChange("trip_cars", p))
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  // ── Day Item Mutations ──

  async function addDayItem(dayId, formData) {
    const tempId = crypto.randomUUID();
    const newItem = {
      id: tempId,
      day_id: dayId,
      title: formData.title,
      description: formData.description || null,
      time_slot: formData.time_slot || null,
      is_highlight: formData.is_highlight,
      is_warning: formData.is_warning,
      status: "planned",
      sort_order: (dayItems.filter((i) => i.day_id === dayId).length + 1) * 10,
    };
    const prev = [...dayItems];
    setDayItems((items) => [...items, newItem]);

    const { data, error } = await supabase
      .from("day_items")
      .insert({ ...newItem, id: undefined })
      .select()
      .single();

    if (error) {
      setDayItems(prev);
      console.error("addDayItem failed:", error);
      return;
    }
    setDayItems((items) => items.map((i) => (i.id === tempId ? data : i)));
  }

  async function updateDayItem(itemId, updates) {
    const prev = [...dayItems];
    setDayItems((items) => items.map((i) => (i.id === itemId ? { ...i, ...updates } : i)));

    const { error } = await supabase.from("day_items").update(updates).eq("id", itemId);
    if (error) {
      setDayItems(prev);
      console.error("updateDayItem failed:", error);
    }
  }

  async function deleteDayItem(itemId) {
    const prev = [...dayItems];
    setDayItems((items) => items.filter((i) => i.id !== itemId));

    const { error } = await supabase.from("day_items").delete().eq("id", itemId);
    if (error) {
      setDayItems(prev);
      console.error("deleteDayItem failed:", error);
    }
  }

  async function toggleDayItemDone(item) {
    const newStatus = item.status === "done" ? "planned" : "done";
    const prev = [...dayItems];
    setDayItems((items) => items.map((i) => (i.id === item.id ? { ...i, status: newStatus } : i)));

    const { error } = await supabase.from("day_items").update({ status: newStatus }).eq("id", item.id);
    if (error) {
      setDayItems(prev);
      console.error("toggleDayItemDone failed:", error);
    }
  }

  // ── Attraction Mutations ──

  async function addAttraction(parkId, formData) {
    const tempId = crypto.randomUUID();
    const newAttraction = {
      id: tempId,
      park_id: parkId,
      name: formData.name,
      type: formData.type,
      min_height_cm: formData.min_height_cm ? Number(formData.min_height_cm) : null,
      description: formData.description || null,
      tips: formData.tips || null,
      pregnant_ok: formData.pregnant_ok,
      has_child_swap: formData.has_child_swap,
      indoor: formData.indoor,
      thrill_level: Number(formData.thrill_level),
      sort_order: (attractions.filter((a) => a.park_id === parkId).length + 1) * 10,
    };
    const prev = [...attractions];
    setAttractions((items) => [...items, newAttraction]);

    const { data, error } = await supabase
      .from("attractions")
      .insert({ ...newAttraction, id: undefined })
      .select()
      .single();

    if (error) {
      setAttractions(prev);
      console.error("addAttraction failed:", error);
      return;
    }
    setAttractions((items) => items.map((i) => (i.id === tempId ? data : i)));
  }

  async function deleteAttraction(attractionId) {
    const prev = [...attractions];
    setAttractions((items) => items.filter((i) => i.id !== attractionId));

    const { error } = await supabase.from("attractions").delete().eq("id", attractionId);
    if (error) {
      setAttractions(prev);
      console.error("deleteAttraction failed:", error);
    }
  }

  // ── Cost Mutations ──

  async function addCost(formData) {
    const tempId = crypto.randomUUID();
    const newCost = {
      id: tempId,
      trip_id: TRIP_ID,
      category: formData.category,
      description: formData.description,
      amount: Number(formData.amount),
      is_paid: formData.is_paid,
      notes: formData.notes || null,
      icon: formData.icon,
      sort_order: costs.length + 1,
    };
    const prev = [...costs];
    setCosts((items) => [...items, newCost]);

    const { data, error } = await supabase
      .from("trip_costs")
      .insert({ ...newCost, id: undefined })
      .select()
      .single();

    if (error) {
      setCosts(prev);
      console.error("addCost failed:", error);
      return;
    }
    setCosts((items) => items.map((i) => (i.id === tempId ? data : i)));
  }

  async function toggleCostPaid(cost) {
    const prev = [...costs];
    setCosts((items) => items.map((i) => (i.id === cost.id ? { ...i, is_paid: !i.is_paid } : i)));

    const { error } = await supabase.from("trip_costs").update({ is_paid: !cost.is_paid }).eq("id", cost.id);
    if (error) {
      setCosts(prev);
      console.error("toggleCostPaid failed:", error);
    }
  }

  async function deleteCost(costId) {
    const prev = [...costs];
    setCosts((items) => items.filter((i) => i.id !== costId));

    const { error } = await supabase.from("trip_costs").delete().eq("id", costId);
    if (error) {
      setCosts(prev);
      console.error("deleteCost failed:", error);
    }
  }

  // ── Shopping Item Mutations ──

  async function addShoppingItem(formData) {
    const tempId = crypto.randomUUID();
    const newItem = {
      id: tempId,
      trip_id: TRIP_ID,
      person: formData.person,
      category: formData.category || "outro",
      item: formData.item,
      quantity: Number(formData.quantity) || 1,
      is_checked: false,
      store: formData.store || null,
      notes: formData.notes || null,
      sort_order: shoppingItems.filter((i) => i.person === formData.person).length + 1,
    };
    const prev = [...shoppingItems];
    setShoppingItems((items) => [...items, newItem]);

    const { data, error } = await supabase
      .from("shopping_lists")
      .insert({ ...newItem, id: undefined })
      .select()
      .single();

    if (error) {
      setShoppingItems(prev);
      console.error("addShoppingItem failed:", error);
      return;
    }
    setShoppingItems((items) => items.map((i) => (i.id === tempId ? data : i)));
  }

  async function updateShoppingItem(itemId, updates) {
    const prev = [...shoppingItems];
    setShoppingItems((items) => items.map((i) => (i.id === itemId ? { ...i, ...updates } : i)));

    const { error } = await supabase.from("shopping_lists").update(updates).eq("id", itemId);
    if (error) {
      setShoppingItems(prev);
      console.error("updateShoppingItem failed:", error);
    }
  }

  async function toggleShoppingChecked(item) {
    const prev = [...shoppingItems];
    setShoppingItems((items) => items.map((i) => (i.id === item.id ? { ...i, is_checked: !i.is_checked } : i)));

    const { error } = await supabase.from("shopping_lists").update({ is_checked: !item.is_checked }).eq("id", item.id);
    if (error) {
      setShoppingItems(prev);
      console.error("toggleShoppingChecked failed:", error);
    }
  }

  async function deleteShoppingItem(itemId) {
    const prev = [...shoppingItems];
    setShoppingItems((items) => items.filter((i) => i.id !== itemId));

    const { error } = await supabase.from("shopping_lists").delete().eq("id", itemId);
    if (error) {
      setShoppingItems(prev);
      console.error("deleteShoppingItem failed:", error);
    }
  }

  async function moveShoppingItem(itemId, newPerson) {
    const prev = [...shoppingItems];
    setShoppingItems((items) => items.map((i) => (i.id === itemId ? { ...i, person: newPerson } : i)));

    const { error } = await supabase.from("shopping_lists").update({ person: newPerson }).eq("id", itemId);
    if (error) {
      setShoppingItems(prev);
      console.error("moveShoppingItem failed:", error);
    }
  }

  // ── Hotel Mutations ──

  async function addHotel(formData) {
    const tempId = crypto.randomUUID();
    const newHotel = {
      id: tempId,
      trip_id: TRIP_ID,
      name: formData.name,
      check_in: formData.check_in || null,
      check_out: formData.check_out || null,
      address: formData.address || null,
      booking_ref: formData.booking_ref || null,
      notes: formData.notes || null,
      icon: formData.icon || "🏨",
      sort_order: hotels.length + 1,
    };
    const prev = [...hotels];
    setHotels((items) => [...items, newHotel]);

    const { data, error } = await supabase
      .from("trip_hotels")
      .insert({ ...newHotel, id: undefined })
      .select()
      .single();

    if (error) {
      setHotels(prev);
      console.error("addHotel failed:", error);
      return;
    }
    setHotels((items) => items.map((i) => (i.id === tempId ? data : i)));
  }

  async function updateHotel(hotelId, updates) {
    const prev = [...hotels];
    setHotels((items) => items.map((i) => (i.id === hotelId ? { ...i, ...updates } : i)));

    const { error } = await supabase.from("trip_hotels").update(updates).eq("id", hotelId);
    if (error) {
      setHotels(prev);
      console.error("updateHotel failed:", error);
    }
  }

  async function deleteHotel(hotelId) {
    const prev = [...hotels];
    setHotels((items) => items.filter((i) => i.id !== hotelId));

    const { error } = await supabase.from("trip_hotels").delete().eq("id", hotelId);
    if (error) {
      setHotels(prev);
      console.error("deleteHotel failed:", error);
    }
  }

  // ── Car Mutations ──

  async function addCar(formData) {
    const tempId = crypto.randomUUID();
    const newCar = {
      id: tempId,
      trip_id: TRIP_ID,
      company: formData.company,
      car_type: formData.car_type || null,
      pickup_date: formData.pickup_date || null,
      return_date: formData.return_date || null,
      pickup_location: formData.pickup_location || null,
      return_location: formData.return_location || null,
      booking_ref: formData.booking_ref || null,
      notes: formData.notes || null,
      icon: formData.icon || "🚗",
      sort_order: cars.length + 1,
    };
    const prev = [...cars];
    setCars((items) => [...items, newCar]);

    const { data, error } = await supabase
      .from("trip_cars")
      .insert({ ...newCar, id: undefined })
      .select()
      .single();

    if (error) {
      setCars(prev);
      console.error("addCar failed:", error);
      return;
    }
    setCars((items) => items.map((i) => (i.id === tempId ? data : i)));
  }

  async function updateCar(carId, updates) {
    const prev = [...cars];
    setCars((items) => items.map((i) => (i.id === carId ? { ...i, ...updates } : i)));

    const { error } = await supabase.from("trip_cars").update(updates).eq("id", carId);
    if (error) {
      setCars(prev);
      console.error("updateCar failed:", error);
    }
  }

  async function deleteCar(carId) {
    const prev = [...cars];
    setCars((items) => items.filter((i) => i.id !== carId));

    const { error } = await supabase.from("trip_cars").delete().eq("id", carId);
    if (error) {
      setCars(prev);
      console.error("deleteCar failed:", error);
    }
  }

  return {
    days, dayItems, parks, attractions, costs, flights, shoppingItems, hotels, cars, loading,
    addDayItem, updateDayItem, deleteDayItem, toggleDayItemDone,
    addAttraction, deleteAttraction,
    addCost, toggleCostPaid, deleteCost,
    addShoppingItem, updateShoppingItem, toggleShoppingChecked, deleteShoppingItem, moveShoppingItem,
    addHotel, updateHotel, deleteHotel,
    addCar, updateCar, deleteCar,
  };
}
