import axios from "axios";
import { getEnvs } from "@/helpers/get-envs";

const { NEXT_PUBLIC_API_URL } = getEnvs();

export const api = axios.create({
  baseURL: NEXT_PUBLIC_API_URL,
  withCredentials: true,
});
