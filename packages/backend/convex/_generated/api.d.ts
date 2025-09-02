/* eslint-disable */
/**
 * Generated `api` utility.
 *
 * THIS CODE IS AUTOMATICALLY GENERATED.
 *
 * To regenerate, run `npx convex dev`.
 * @module
 */

import type {
  ApiFromModules,
  FilterApi,
  FunctionReference,
} from "convex/server";
import type * as achievements from "../achievements.js";
import type * as admin from "../admin.js";
import type * as ai from "../ai.js";
import type * as auth from "../auth.js";
import type * as community from "../community.js";
import type * as consulting from "../consulting.js";
import type * as courses from "../courses.js";
import type * as credentials from "../credentials.js";
import type * as events from "../events.js";
import type * as governance from "../governance.js";
import type * as http from "../http.js";
import type * as lessons from "../lessons.js";
import type * as multimedia from "../multimedia.js";
import type * as mux from "../mux.js";
import type * as muxActions from "../muxActions.js";
import type * as router from "../router.js";
import type * as seedData from "../seedData.js";
import type * as web3 from "../web3.js";

/**
 * A utility for referencing Convex functions in your app's API.
 *
 * Usage:
 * ```js
 * const myFunctionReference = api.myModule.myFunction;
 * ```
 */
declare const fullApi: ApiFromModules<{
  achievements: typeof achievements;
  admin: typeof admin;
  ai: typeof ai;
  auth: typeof auth;
  community: typeof community;
  consulting: typeof consulting;
  courses: typeof courses;
  credentials: typeof credentials;
  events: typeof events;
  governance: typeof governance;
  http: typeof http;
  lessons: typeof lessons;
  multimedia: typeof multimedia;
  mux: typeof mux;
  muxActions: typeof muxActions;
  router: typeof router;
  seedData: typeof seedData;
  web3: typeof web3;
}>;
export declare const api: FilterApi<
  typeof fullApi,
  FunctionReference<any, "public">
>;
export declare const internal: FilterApi<
  typeof fullApi,
  FunctionReference<any, "internal">
>;
