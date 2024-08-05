import { baseUrl } from "@/config";
import {
  APIResponseType,
  LanguageType,
  PaginatedResponseType,
  TemplateType,
} from "@/types/shared";
import axios from "axios";

export class TemplateService {
  private _token?: string | null;

  constructor(token?: string | null) {
    this._token = token;
  }

  async createTemplate(data: Omit<TemplateType, "id">) {
    const response = await axios.post<APIResponseType<string>>(
      `${baseUrl}/messaging/add/template`,
      data,
      {
        headers: {
          Authorization: `Bearer ${this._token}`,
        },
      }
    );
    return response.data;
  }

  async getAllTemplates(config?: Record<string, string | number>) {
    let temp = "";
    if (config) {
      temp = Object.keys(config)
        .reduce((initial, current) => {
          let val = initial;
          if (current in config) {
            val = val + `${current}=${config[current]}&`;
          }
          return val;
        }, "?sort=ASC&orderBy=createdAt&")
        .slice(0, -1);
    }
    console.log("here");

    const response = await axios.get<
      APIResponseType<
        PaginatedResponseType & { messagingRecords: TemplateType[] }
      >
    >(`${baseUrl}/messaging/view/all${temp}`, {
      headers: {
        Authorization: `Bearer ${this._token}`,
      },
    });
    return response.data;
  }

  async getAllLanguages() {
    const response = await axios.get<
      APIResponseType<
        LanguageType[]
      >
    >(`${baseUrl}/language/view/all`, {
      headers: {
        Authorization: `Bearer ${this._token}`,
      },
    });
    return response.data;
  }
}
