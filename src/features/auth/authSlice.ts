import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { RootState } from "../../app/store";
import axios from "axios";
import { PROPS_AUTHEN, PROPS_PROFILE, PROPS_NICKNAME } from "../types";

const apiUrl = process.env.REACT_APP_DEV_API_URL;

// ログイン用関数
export const fetchAsyncLogin = createAsyncThunk(
  "auth/post",
  async (authen: PROPS_AUTHEN) => {
    const res = await axios.post(`${apiUrl}authen/jwt/create/`, authen, {
      headers: {
        "Content-Type": "application/json",
      },
    });
    return res.data;
  }
);

// サインアップ（登録）用関数
export const fetchAsyncRegister = createAsyncThunk(
  "auth/register",
  async (authen: PROPS_AUTHEN) => {
    const res = await axios.post(`${apiUrl}api/register/`, authen, {
      headers: {
        "Content-Type": "application/json",
      },
    });
    return res.data;
  }
);

// プロフィール作成用関数
export const fetchAsyncCreateProfile = createAsyncThunk(
  "profile/post",
  async (nickName: PROPS_NICKNAME) => {
    const res = await axios.post(`${apiUrl}api/profile/`, nickName, {
      headers: {
        "Content-Type": "application/json",
        Authorization: `JWT ${localStorage.localJWT}`,
      },
    });
    return res.data;
  }
);

// プロフィール更新用関数
export const fetchAsyncUpdateProfile = createAsyncThunk(
  "profile/put",
  async (profile: PROPS_PROFILE) => {
    const uploadData = new FormData();
    uploadData.append("nickName", profile.nickName);
    profile.img && uploadData.append("img", profile.img, profile.img.name);

    const res = await axios.put(
      `${apiUrl}api/profile/${profile.id}/`,
      uploadData,
      {
        headers: {
          "Content-Type": "application/json",
          Authorization: `JWT ${localStorage.localJWT}`,
        },
      }
    );
    return res.data;
  }
);

// ログインユーザーのプロフィール取得
export const fetchAsyncGetMyProfile = createAsyncThunk(
  "profile/get",
  async () => {
    const res = await axios.get(`${apiUrl}api/myprofile/`, {
      headers: {
        Authorization: `JWT ${localStorage.localJWT}`,
      },
    });
    // django　の方で配列を返す使用のため、[0]を指定
    return res.data[0];
  }
);

// プロフィール全てを取得
export const fetchAsyncGetProfiles = createAsyncThunk(
  "profiles/get",
  async () => {
    const res = await axios.get(`${apiUrl}api/profile/`, {
      headers: {
        Authorization: `JWT ${localStorage.localJWT}`,
      },
    });
    return res.data;
  }
);

export const authSlice = createSlice({
  name: "name",
  initialState: {
    openSignIn: true,
    openSignUp: false,
    openProfile: false,
    isLoadingAuth: false,
    myprofile: {
      id: 0,
      nickName: "",
      userProfile: 0,
      created_on: "",
      img: "",
    },
    profiles: [
      {
        id: 0,
        nickName: "",
        userProfile: 0,
        created_on: "",
        img: "",
      },
    ],
  },
  reducers: {
    fetchCredStart(state) {
      state.isLoadingAuth = true;
    },
    fetchCredEnd(state) {
      state.isLoadingAuth = false;
    },
    // サインイン用モーダルの表示／非表
    setOpenSignIn(state) {
      state.openSignIn = true;
    },
    resetOpenSignIn(state) {
      state.openSignIn = false;
    },
    // サインアップ（登録）用モーダルの表示／非表
    setOpenSignUp(state) {
      state.openSignUp = true;
    },
    resetOpenSignUp(state) {
      state.openSignUp = false;
    },
    // プロフィール編集用モーダルの表示／非表
    setOpenProfile(state) {
      state.openProfile = true;
    },
    resetOpenProfile(state) {
      state.openProfile = false;
    },
    // ニックネーム上書き用のアクション
    editNickName(state, action) {
      state.myprofile.nickName = action.payload;
    },
  },
  // 非同期処理が成功した場合
  extraReducers: (builder) => {
    // fulfilled → 正常終了
    builder.addCase(fetchAsyncLogin.fulfilled, (state, action) => {
      // action.payload → fetchAsyncLogin関数でreturnした値を受け取っている
      // action.payload.access → JWTでは、accessとrefreshのトークンがある。ここではaccessトークンを取得し、localStorageに格納。
      localStorage.setItem("localeJWT", action.payload.access);
    });
    builder.addCase(fetchAsyncCreateProfile.fulfilled, (state, action) => {
      state.myprofile = action.payload;
    });
    builder.addCase(fetchAsyncGetMyProfile.fulfilled, (state, action) => {
      state.myprofile = action.payload;
    });
    builder.addCase(fetchAsyncGetProfiles.fulfilled, (state, action) => {
      state.profiles = action.payload;
    });
    builder.addCase(fetchAsyncUpdateProfile.fulfilled, (state, action) => {
      state.myprofile = action.payload;
      state.profiles = state.profiles.map((profile) =>
        profile.id === action.payload.id ? action.payload : profile
      );
    });
  },
});

export const {
  fetchCredStart,
  fetchCredEnd,
  setOpenSignIn,
  resetOpenSignIn,
  setOpenSignUp,
  resetOpenSignUp,
  setOpenProfile,
  resetOpenProfile,
  editNickName,
} = authSlice.actions;

export const selectIsLoadingAuth = (state: RootState) =>
  // ここでの.auth.は、store.tsの記載と一致させる必要がある
  state.auth.isLoadingAuth;
export const selectOpenSignIn = (state: RootState) => state.auth.openSignIn;
export const selectOpenSignUp = (state: RootState) => state.auth.openSignUp;
export const selectOpenProfile = (state: RootState) => state.auth.openProfile;
export const selectProfile = (state: RootState) => state.auth.myprofile;
export const selectProfiles = (state: RootState) => state.auth.profiles;

export default authSlice.reducer;
