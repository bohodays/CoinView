import { tickerSchema } from "../model/type";
import { apiFetch } from "@/shared/api";
import { z } from "zod";

export const fetchTickerAllData = () =>
  apiFetch(`/api/upbit/ticker`, z.array(tickerSchema));
