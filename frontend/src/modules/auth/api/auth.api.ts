import axios from "axios";
import { getEnvs } from "@/helpers/get-envs";

const { NEXT_PUBLIC_API_URL } = getEnvs();

// console.log({ NEXT_PUBLIC_API_URL });

export const authApi = axios.create({
  baseURL: `${NEXT_PUBLIC_API_URL}/auth`,
  withCredentials: true,
});
