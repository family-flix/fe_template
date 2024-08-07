/**
 *
 */
import dayjs from "dayjs";

import { FetchParams } from "@/domains/list/typing";
import { request } from "@/domains/request/utils";
import {
  JSONObject,
  ListResponse,
  ListResponseWithCursor,
  MutableRecord,
  RequestedResource,
  Result,
  Unpacked,
  UnpackedResult,
} from "@/types/index";
import { DriveTypes, MediaErrorTypes, MediaTypes, ReportTypeTexts, ReportTypes } from "@/constants/index";
import { bytes_to_size, query_stringify } from "@/utils/index";

export function ping(values: any) {
  return request.post("/api/ping", values);
}

export function pingPayload(...args: JSONObject[]) {
  return {
    url: "/api/ping",
    method: "POST",
    params: {},
    query: {},
    body: {},
    defaultResponse: {
      data: {
        success: true,
        message: "pong",
        data: {},
      },
    },
    base: "/",
    hostname: "api.funzm.com",
    headers: {},
  };
}

// 需要一个承载所有「请求信息」和「响应信息结构」的东西
