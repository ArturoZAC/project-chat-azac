import axios from "axios";
import { getEnvs } from "@/helpers/get-envs";

const { NEXT_PUBLIC_API_URL } = getEnvs();

export const invitationsApi = axios.create({
  baseURL: `${NEXT_PUBLIC_API_URL}`,
  withCredentials: true,
});
