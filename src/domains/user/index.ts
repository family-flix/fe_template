import { BaseDomain, Handler } from "@/domains/base";
import { RequestCoreV2 } from "@/domains/request/v2";
import { HttpClientCore } from "@/domains/http_client";
import { Result } from "@/types";

import { fetch_user_profile, login, register, validate } from "./services";

export enum Events {
  Tip,
  Error,
  Login,
  Logout,
  /** 身份凭证失效 */
  Expired,
  StateChange,
}
type TheTypesOfEvents = {
  [Events.Tip]: string[];
  [Events.Error]: Error;
  [Events.Login]: UserState & { token: string };
  [Events.Logout]: void;
  [Events.Expired]: void;
  [Events.StateChange]: UserState;
};

type UserProps = {
  id: string;
  username: string;
  avatar: string;
  token: string;
  client: HttpClientCore;
};
type UserState = {
  // id: string;
  // username: string;
  // avatar: string;
  // token: string;
};

export class UserCore extends BaseDomain<TheTypesOfEvents> {
  name = "UserCore";
  debug = false;

  $client: HttpClientCore;

  id: string = "";
  username: string = "Anonymous";
  avatar: string = "";
  token: string = "";
  isLogin: boolean = false;
  needRegister = false;

  get state(): UserState {
    return {
      id: this.id,
      username: this.username,
      avatar: this.avatar,
      token: this.token,
    };
  }
  values: Partial<{ email: string; password: string }> = {};

  static Events = Events;

  constructor(options: Partial<{ _name: string }> & UserProps) {
    super(options);

    const { id, username, avatar, token, client } = options;
    // console.log("initialize", options);
    this.id = id;
    this.username = username;
    this.avatar = avatar;
    this.isLogin = !!token;
    this.token = token;
    this.$client = client;
  }
  inputEmail(value: string) {
    this.values.email = value;
  }
  inputPassword(value: string) {
    this.values.password = value;
  }
  /** 校验用户凭证是否有效 */
  async validate() {
    if (!this.token) {
      this.emit(Events.Expired);
      return Result.Err("缺少 token");
    }
    const fetch = new RequestCoreV2({
      fetch: validate,
      client: this.$client,
    });
    const r = await fetch.run({ token: this.token });
    if (r.error) {
      if (r.error.code === 900) {
        this.isLogin = false;
        this.emit(Events.Expired);
      }
      return Result.Err(r.error);
    }
    return Result.Ok(null);
  }
  /** 用户名密码登录 */
  async login() {
    const { email, password } = this.values;
    if (!email) {
      const msg = this.tip({ text: ["请输入邮箱"] });
      return Result.Err(msg);
    }
    if (!password) {
      const msg = this.tip({ text: ["请输入密码"] });
      return Result.Err(msg);
    }
    const fetch = new RequestCoreV2({
      fetch: login,
      client: this.$client,
    });
    const r = await fetch.run({ email, password });
    if (r.error) {
      this.tip({ text: ["登录失败", r.error.message] });
      return Result.Err(r.error);
    }
    this.values = {};
    this.isLogin = true;
    const { id, username, avatar, token } = r.data;
    this.id = id;
    this.username = username;
    this.avatar = avatar;
    this.token = token;
    this.emit(Events.Login, { ...this.state, token: this.token });
    return Result.Ok(r.data);
  }
  /** 退出登录 */
  logout() {
    this.isLogin = false;
    this.emit(Events.Logout);
  }
  async register() {
    console.log("[DOMAIN]user/index - register", this.values);
    const { email, password } = this.values;
    if (!email) {
      const msg = this.tip({ text: ["请输入邮箱"] });
      return Result.Err(msg);
    }
    if (!password) {
      const msg = this.tip({ text: ["请输入密码"] });
      return Result.Err(msg);
    }
    const fetch = new RequestCoreV2({
      fetch: register,
      client: this.$client,
    });
    const r = await fetch.run({ email, password });
    if (r.error) {
      this.tip({ text: ["注册失败", r.error.message] });
      return Result.Err(r.error);
    }
    this.values = {};
    this.isLogin = true;
    const { id, username, avatar, token } = r.data;
    this.id = id;
    this.username = username;
    this.avatar = avatar;
    this.token = token;
    this.needRegister = false;
    this.emit(Events.Login, { ...this.state, token: this.token });
    return Result.Ok(r.data);
  }
  async fetchProfile() {
    if (!this.isLogin) {
      return Result.Err("请先登录");
    }
    const fetch = new RequestCoreV2({
      fetch: fetch_user_profile,
      client: this.$client,
    });
    const r = await fetch.run();
    if (r.error) {
      return r;
    }
    return Result.Ok(r.data);
  }

  onError(handler: Handler<TheTypesOfEvents[Events.Error]>) {
    return this.on(Events.Error, handler);
  }
  onLogin(handler: Handler<TheTypesOfEvents[Events.Login]>) {
    return this.on(Events.Login, handler);
  }
  onLogout(handler: Handler<TheTypesOfEvents[Events.Logout]>) {
    return this.on(Events.Logout, handler);
  }
  onExpired(handler: Handler<TheTypesOfEvents[Events.Expired]>) {
    return this.on(Events.Expired, handler);
  }
}
