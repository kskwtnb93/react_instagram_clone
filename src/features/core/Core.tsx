import React, { useEffect } from "react";
import Auth from "../auth/Auth";

import styles from "./Core.module.css";
import { useSelector, useDispatch } from "react-redux";
import { AppDispatch } from "../../app/store";

import { withStyles } from "@material-ui/core/styles";
import {
  Button,
  Grid,
  Avatar,
  Badge,
  CircularProgress,
} from "@material-ui/core";

import { MdAddAPhoto } from "react-icons/md";

import {
  editNickName,
  selectProfile,
  selectIsLoadingAuth,
  setOpenSignIn,
  resetOpenSignIn,
  setOpenSignUp,
  resetOpenSignUp,
  setOpenProfile,
  resetOpenProfile,
  fetchAsyncGetMyProfile,
  fetchAsyncGetProfiles,
} from "../auth/authSlice";

import {
  selectPost,
  selectIsLoadingPost,
  setOpenNewPost,
  resetOpenNewPost,
  fetchAsyncGetPosts,
  fetchAsyncGetComments,
} from "../post/postSlice";

const StyledBadge = withStyles((theme) => ({
  badge: {
    backgroundColor: "#44b700",
    color: "#44b700",
    boxShadow: `0 0 0 2px ${theme.palette.background.paper}`,
    "&::after": {
      position: "absolute",
      top: 0,
      left: 0,
      width: "100%",
      height: "100%",
      borderRadius: "50%",
      animation: "$ripple 1.2s infinite ease-in-out",
      border: "1px solid currentColor",
      content: '""',
    },
  },
  "@keyframes ripple": {
    "0%": {
      transform: "scale(.8)",
      opacity: 1,
    },
    "100%": {
      transform: "scale(2.4)",
      opacity: 0,
    },
  },
}))(Badge);

function Core() {
  // dispatch の実態の定義
  const dispatch: AppDispatch = useDispatch();
  // 下記 state を redux store の中から参照
  const profile = useSelector(selectProfile);
  const posts = useSelector(selectPost);
  const isLoadingPost = useSelector(selectIsLoadingPost);
  const isLoadingAuth = useSelector(selectIsLoadingAuth);

  // ブラウザ起動時に実行
  useEffect(() => {
    const fetchBootLoader = async () => {
      // localStorage にJWTトークンが保存されているかチェック
      if (localStorage.localJWT) {
        // サインインモーダルを閉じる
        dispatch(resetOpenSignIn());
        // ログインしているユーザーの情報を取得
        const result = await dispatch(fetchAsyncGetMyProfile());
        // もしJWTトークンの有効期限が切れていたらサインインのモーダルを表示して、処理を抜ける
        if (fetchAsyncGetMyProfile.rejected.match(result)) {
          dispatch(setOpenSignIn());
          return null;
        }

        // 投稿の一覧を取得
        await dispatch(fetchAsyncGetPosts());
        // プロフィール一覧を取得
        await dispatch(fetchAsyncGetProfiles());
        // コメントの一覧を取得
        await dispatch(fetchAsyncGetComments());
      }
    };

    fetchBootLoader();
  }, [dispatch]);

  return (
    <div>
      <Auth />
      <div className={styles.core_header}>
        <h1 className={styles.core_title}>Instagram clone</h1>
        {
          // profile?は、profileが存在しているかどうか判定するもの
          profile?.nickName ? (
            <>
              <button
                className={styles.core_btnModal}
                onClick={() => {
                  dispatch(setOpenNewPost());
                  dispatch(resetOpenProfile());
                }}
              >
                <MdAddAPhoto />
              </button>

              <div className={styles.core_logout}>
                {(isLoadingPost || isLoadingAuth) && <CircularProgress />}
                <Button
                  onClick={() => {
                    localStorage.removeItem("localJWT");
                    dispatch(editNickName(""));
                    dispatch(resetOpenProfile());
                    dispatch(resetOpenNewPost());
                    dispatch(setOpenSignIn());
                  }}
                >
                  Logout
                </Button>
                <button
                  className={styles.core_btnModal}
                  onClick={() => {
                    dispatch(setOpenProfile());
                    dispatch(resetOpenNewPost());
                  }}
                >
                  <StyledBadge
                    overlap="circle"
                    anchorOrigin={{
                      vertical: "bottom",
                      horizontal: "right",
                    }}
                    variant="dot"
                  >
                    <Avatar alt="who?" src={profile.img} />{" "}
                  </StyledBadge>
                </button>
              </div>
            </>
          ) : (
            <div>
              <div>
                <Button
                  onClick={() => {
                    dispatch(setOpenSignIn());
                    dispatch(resetOpenSignUp());
                  }}
                >
                  LogIn
                </Button>
                <Button
                  onClick={() => {
                    dispatch(setOpenSignUp());
                    dispatch(resetOpenSignIn());
                  }}
                >
                  SignUp
                </Button>
              </div>

              {profile?.nickName && (
                <>
                  <div className={styles.core_posts}>
                    <Grid container spacing={4}>
                      {posts
                        .slice(0)
                        .reverse()
                        .map((post) => (
                          <Grid key={post.id} item xs={12} md={4}>
                            {/* <Post
                              postId={post.id}
                              title={post.title}
                              loginId={profile.userProfile}
                              userPost={post.userPost}
                              imageUrl={post.img}
                              liked={post.liked}
                            /> */}
                          </Grid>
                        ))}
                    </Grid>
                  </div>
                </>
              )}
            </div>
          )
        }
      </div>
    </div>
  );
}

export default Core;
