import { marketSchema } from "../model/type";
import { apiFetch } from "@/shared/api";
import { z } from "zod";

export const fetchMarketData = () =>
  apiFetch(`/api/upbit/market`, z.array(marketSchema));
